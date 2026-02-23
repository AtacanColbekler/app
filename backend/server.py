from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
import httpx
import asyncio
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="zenXteknoloji API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    supplier: str = "sektoronline"
    category: str
    name: str
    model: str
    barcode: Optional[str] = None
    image_url: Optional[str] = None
    stock_text: Optional[str] = None
    price_value: Optional[float] = None
    price_raw: Optional[str] = None
    last_synced: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    supplier: str = "sektoronline"
    category: str
    name: str
    model: str
    barcode: Optional[str] = None
    image_url: Optional[str] = None
    stock_text: Optional[str] = None
    price_value: Optional[float] = None
    price_raw: Optional[str] = None

class ProductResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    supplier: str
    category: str
    name: str
    model: str
    barcode: Optional[str] = None
    image_url: Optional[str] = None
    stock_text: Optional[str] = None
    price_value: Optional[float] = None  # Original USD price
    price_raw: Optional[str] = None
    price_try: Optional[float] = None  # Final TRY price with profit
    last_synced: str

class ProductSyncBatch(BaseModel):
    products: List[ProductCreate]

# Routes

@api_router.get("/")
async def root():
    return {"message": "zenXteknoloji API'ye Hoşgeldiniz"}

@api_router.get("/exchange-rate")
async def get_exchange_rate():
    """Get current USD to TRY exchange rate"""
    rate = await fetch_usd_try_rate()
    return {
        "usd_to_try": rate,
        "profit_margin": f"{PROFIT_MARGIN * 100}%",
        "last_updated": currency_cache["last_updated"].isoformat() if currency_cache["last_updated"] else None
    }

@api_router.get("/categories", response_model=List[str])
async def get_categories():
    """Get all unique categories"""
    categories = await db.products.distinct("category")
    return sorted(categories)

@api_router.get("/products", response_model=List[ProductResponse])
async def get_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in name or model"),
    sort: Optional[str] = Query("name", description="Sort by: name, price_asc, price_desc"),
    in_stock: Optional[bool] = Query(False, description="Show only in-stock products"),
    limit: int = Query(100, ge=1, le=500)
):
    """Get products with optional category filter and search"""
    query = {}
    
    if category:
        query["category"] = category
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"model": {"$regex": search, "$options": "i"}},
            {"barcode": {"$regex": search, "$options": "i"}}
        ]
    
    # Filter by stock status - show only products with stock > 0
    if in_stock:
        query["$nor"] = [
            {"stock_text": {"$regex": "^Stok\\s*:\\s*0$", "$options": "i"}},  # Exactly "Stok : 0"
            {"stock_text": {"$regex": "yok", "$options": "i"}},
            {"stock_text": {"$regex": "tükendi", "$options": "i"}},
            {"stock_text": {"$regex": "bitti", "$options": "i"}},
            {"stock_text": None},
            {"stock_text": ""}
        ]
    
    # Determine sort order
    if sort == "price_asc":
        sort_field = [("price_value", 1)]
    elif sort == "price_desc":
        sort_field = [("price_value", -1)]
    else:
        sort_field = [("name", 1)]
    
    cursor = db.products.find(query, {"_id": 0}).sort(sort_field).limit(limit)
    products = await cursor.to_list(length=limit)
    
    # Get current exchange rate
    usd_to_try = await fetch_usd_try_rate()
    
    # Convert datetime to string and calculate TRY prices
    for product in products:
        if isinstance(product.get('last_synced'), datetime):
            product['last_synced'] = product['last_synced'].isoformat()
        elif product.get('last_synced') is None:
            product['last_synced'] = datetime.now(timezone.utc).isoformat()
        
        # Calculate TRY price with 20% profit
        product['price_try'] = calculate_final_price_try(product.get('price_value'), usd_to_try)
    
    return products

@api_router.get("/products/search", response_model=List[ProductResponse])
async def search_products(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(50, ge=1, le=100)
):
    """Search products by category using one or more words"""
    words = [re.escape(word) for word in q.strip().split() if word]
    if not words:
        raise HTTPException(status_code=400, detail="Search query must include at least one non-space word")

    query = {
        "$or": [
            {"category": {"$regex": word, "$options": "i"}}
            for word in words
        ]
    }
    
    cursor = db.products.find(query, {"_id": 0}).sort("name", 1).limit(limit)
    products = await cursor.to_list(length=limit)
    
    # Get current exchange rate
    usd_to_try = await fetch_usd_try_rate()
    
    for product in products:
        if isinstance(product.get('last_synced'), datetime):
            product['last_synced'] = product['last_synced'].isoformat()
        elif product.get('last_synced') is None:
            product['last_synced'] = datetime.now(timezone.utc).isoformat()
        
        # Calculate TRY price with 20% profit
        product['price_try'] = calculate_final_price_try(product.get('price_value'), usd_to_try)
    
    return products

@api_router.get("/products/{model}", response_model=ProductResponse)
async def get_product_by_model(model: str):
    """Get single product by model"""
    product = await db.products.find_one({"model": model}, {"_id": 0})
    
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    
    if isinstance(product.get('last_synced'), datetime):
        product['last_synced'] = product['last_synced'].isoformat()
    elif product.get('last_synced') is None:
        product['last_synced'] = datetime.now(timezone.utc).isoformat()
    
    # Get current exchange rate and calculate TRY price
    usd_to_try = await fetch_usd_try_rate()
    product['price_try'] = calculate_final_price_try(product.get('price_value'), usd_to_try)
    
    return product

@api_router.post("/products/sync", response_model=dict)
async def sync_products(batch: ProductSyncBatch):
    """Sync products from n8n - deletes all existing products and inserts new ones"""
    # Delete all existing products first
    deleted_count = 0    
    
    # Insert all new products
    inserted_count = 0
    if batch.products:
        products_to_insert = []
        for product_data in batch.products:
            product_dict = product_data.model_dump()
            product_dict['last_synced'] = datetime.now(timezone.utc)
            products_to_insert.append(product_dict)
        
        if products_to_insert:
            result = await db.products.insert_many(products_to_insert)
            inserted_count = len(result.inserted_ids)
    
    return {
        "success": True,
        "deleted": deleted_count,
        "inserted": inserted_count,
        "total": len(batch.products)
    }

@api_router.post("/products/drop", response_model=dict)
async def drop_products():
    delete_result = await db.products.delete_many({})
    deleted_count = delete_result.deleted_count

    return {
        "success": True,
        "deleted": deleted_count
    }


@api_router.post("/products", response_model=ProductResponse)
async def create_product(product: ProductCreate):
    """Create or update a single product"""
    product_dict = product.model_dump()
    product_dict['last_synced'] = datetime.now(timezone.utc)
    
    await db.products.update_one(
        {"supplier": product_dict['supplier'], "model": product_dict['model']},
        {"$set": product_dict},
        upsert=True
    )
    
    product_dict['last_synced'] = product_dict['last_synced'].isoformat()
    return product_dict

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Currency rate cache
currency_cache = {
    "usd_to_try": 36.0,  # Default fallback rate
    "last_updated": None
}

PROFIT_MARGIN = 0.20  # 20% net profit

async def fetch_usd_try_rate():
    """Fetch real-time USD to TRY exchange rate"""
    global currency_cache
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Try frankfurter.app (free, no API key)
            response = await client.get("https://api.frankfurter.app/latest?from=USD&to=TRY")
            if response.status_code == 200:
                data = response.json()
                rate = data.get("rates", {}).get("TRY", 36.0)
                currency_cache["usd_to_try"] = rate
                currency_cache["last_updated"] = datetime.now(timezone.utc)
                logger.info(f"Updated USD/TRY rate: {rate}")
                return rate
    except Exception as e:
        logger.warning(f"Failed to fetch from frankfurter: {e}")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Fallback: exchangerate.host
            response = await client.get("https://api.exchangerate.host/latest?base=USD&symbols=TRY")
            if response.status_code == 200:
                data = response.json()
                rate = data.get("rates", {}).get("TRY", 36.0)
                currency_cache["usd_to_try"] = rate
                currency_cache["last_updated"] = datetime.now(timezone.utc)
                logger.info(f"Updated USD/TRY rate from fallback: {rate}")
                return rate
    except Exception as e:
        logger.warning(f"Failed to fetch from exchangerate.host: {e}")
    
    return currency_cache["usd_to_try"]

def calculate_final_price_try(usd_price: float, usd_to_try_rate: float) -> float:
    """Calculate final price in TRY with 20% profit margin"""
    if usd_price is None:
        return None
    price_with_profit = usd_price * (1 + PROFIT_MARGIN)
    price_in_try = price_with_profit * usd_to_try_rate
    return round(price_in_try, 2)

# Create indexes on startup
@app.on_event("startup")
async def startup_db_client():
    # Create indexes for faster queries
    await db.products.create_index([("category", 1)])
    await db.products.create_index([("model", 1)])
    await db.products.create_index([("supplier", 1), ("model", 1)], unique=True)
    await db.products.create_index([("name", "text"), ("model", "text")])
    logger.info("Database indexes created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
