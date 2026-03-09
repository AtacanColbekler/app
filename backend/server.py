from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import httpx
import asyncio
import re
import math

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

logger = logging.getLogger(__name__)

PROFIT_MARGIN = 0.20
currency_cache = {"usd_to_try": 36.0, "last_updated": None}

# ── SMTP / Email config ───────────────────────────────────────────────────────
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT_NUM = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASS = os.environ.get("SMTP_PASS", "")
STORE_EMAIL = "zenxteknoloji@gmail.com"

# In-memory verification code store: email -> {code, expires_at}
verification_store: dict = {}

# ── Pydantic Models ───────────────────────────────────────────────────────────

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
    price_value: Optional[float] = None
    price_raw: Optional[str] = None
    price_try: Optional[float] = None
    last_synced: str

class ProductSyncBatch(BaseModel):
    products: List[ProductCreate]

# ── Order Models ──────────────────────────────────────────────────────────────

class OrderItem(BaseModel):
    name: str
    model: str
    quantity: int
    price_try: Optional[float] = None

class SendVerificationRequest(BaseModel):
    email: str

class VerifyCodeRequest(BaseModel):
    email: str
    code: str

class CheckoutRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    address: str
    phone: str
    payment_method: str = "Banka Havalesi"
    items: List[OrderItem]
    total_price: Optional[float] = None
    verification_code: str
    captcha_verified: bool

# ── Currency helpers ──────────────────────────────────────────────────────────

async def fetch_usd_try_rate():
    if currency_cache["last_updated"] and (datetime.now(timezone.utc) - currency_cache["last_updated"]).seconds < 3600:
        return currency_cache["usd_to_try"]
    try:
        async with httpx.AsyncClient(timeout=10.0) as c:
            r = await c.get("https://api.frankfurter.app/latest?base=USD&symbols=TRY")
            if r.status_code == 200:
                rate = r.json().get("rates", {}).get("TRY", 36.0)
                currency_cache["usd_to_try"] = rate
                currency_cache["last_updated"] = datetime.now(timezone.utc)
                return rate
    except Exception as e:
        logger.warning(f"Failed to fetch from frankfurter: {e}")
    try:
        async with httpx.AsyncClient(timeout=10.0) as c:
            r = await c.get("https://api.exchangerate.host/latest?base=USD&symbols=TRY")
            if r.status_code == 200:
                rate = r.json().get("rates", {}).get("TRY", 36.0)
                currency_cache["usd_to_try"] = rate
                currency_cache["last_updated"] = datetime.now(timezone.utc)
                return rate
    except Exception as e:
        logger.warning(f"Failed to fetch from exchangerate.host: {e}")
    return currency_cache["usd_to_try"]

def calculate_final_price_try(usd_price, usd_to_try_rate):
    if usd_price is None:
        return None
    return float(math.ceil(usd_price * (1 + PROFIT_MARGIN) * usd_to_try_rate))

# ── Email helpers ─────────────────────────────────────────────────────────────

def _send_email(to_list, subject, html):
    if not SMTP_USER or not SMTP_PASS:
        logger.warning(f"SMTP not configured — skipping email to {to_list}")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"zenX Teknoloji <{SMTP_USER}>"
        msg["To"] = ", ".join(to_list)
        msg.attach(MIMEText(html, "html", "utf-8"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT_NUM) as s:
            s.ehlo(); s.starttls()
            s.login(SMTP_USER, SMTP_PASS)
            s.sendmail(SMTP_USER, to_list, msg.as_string())
        return True
    except Exception as e:
        logger.error(f"Email error: {e}")
        return False

def _verification_html(code):
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px;">
      <h2 style="color:#1a1a6c;">zenX Teknoloji — E-posta Doğrulama</h2>
      <p style="color:#475569;">Sipariş için 4 haneli doğrulama kodunuz:</p>
      <div style="background:#f1f5f9;border-radius:8px;padding:20px;text-align:center;">
        <span style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#1a1a6c;">{code}</span>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin-top:16px;">Bu kod 10 dakika geçerlidir. Sipariş vermediyseniz görmezden gelin.</p>
    </div>"""

def _order_html(order, is_store=False):
    items_rows = "".join([
        f"<tr><td style='padding:8px;border-bottom:1px solid #e2e8f0;'>{i['name']}</td>"
        f"<td style='padding:8px;border-bottom:1px solid #e2e8f0;'>{i['model']}</td>"
        f"<td style='padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;'>{i['quantity']}</td>"
        f"<td style='padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;'>"
        f"{'₺{:,.2f}'.format(i['price_try']) if i.get('price_try') else 'Fiyat sorulacak'}</td></tr>"
        for i in order['items']
    ])
    total = f"₺{order['total_price']:,.2f}" if order.get('total_price') else "Fiyat sorulacak"
    title = "Yeni Sipariş Alındı" if is_store else f"Siparişiniz Alındı — {order['order_id']}"
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px;">
      <h2 style="color:#1a1a6c;">{title}</h2>
      <h3 style="color:#1e293b;">Müşteri Bilgileri</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:6px;color:#64748b;width:130px;">Ad Soyad</td><td style="padding:6px;">{order['first_name']} {order['last_name']}</td></tr>
        <tr><td style="padding:6px;color:#64748b;">E-posta</td><td style="padding:6px;">{order['email']}</td></tr>
        <tr><td style="padding:6px;color:#64748b;">Adres</td><td style="padding:6px;">{order['address']}</td></tr>
        <tr><td style="padding:6px;color:#64748b;">Telefon</td><td style="padding:6px;">{order['phone']}</td></tr>
      </table>
      <h3 style="color:#1e293b;margin-top:20px;">Ödeme Bilgileri</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:6px;color:#64748b;width:130px;">Banka</td><td>Enpara Bank A.Ş.</td></tr>
        <tr><td style="padding:6px;color:#64748b;">Hesap Adı</td><td>Mustafa Kemal Esen</td></tr>
        <tr><td style="padding:6px;color:#64748b;">IBAN</td><td style="font-family:monospace;">TR08 0015 7000 0000 0106 3842 39</td></tr>
        <tr><td style="padding:6px;color:#64748b;">Açıklama</td><td>Lütfen ödeme sonrası oluşan sipariş numarasını transfer bilgileriyle belirtiniz!</td></tr>
        <tr><td style="padding:6px;color:#64748b;font-weight:bold;">Toplam</td><td style="font-weight:bold;color:#1a1a6c;">{total}</td></tr>
      </table>
      <h3 style="color:#1e293b;margin-top:20px;">Sipariş Ürünleri</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <thead><tr style="background:#f8fafc;">
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e2e8f0;">Ürün</th>
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e2e8f0;">Model</th>
          <th style="padding:8px;text-align:center;border-bottom:2px solid #e2e8f0;">Adet</th>
          <th style="padding:8px;text-align:right;border-bottom:2px solid #e2e8f0;">Fiyat</th>
        </tr></thead>
        <tbody>{items_rows}</tbody>
      </table>
      <p style="color:#94a3b8;font-size:12px;margin-top:20px;">Sipariş No: {order['order_id']} | Tarih: {order['created_at']}</p>
    </div>"""

# ── Startup / Shutdown ────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_db_client():
    await db.products.create_index([("category", 1)])
    await db.products.create_index([("model", 1)])
    await db.products.create_index([("supplier", 1), ("model", 1)], unique=True)
    await db.products.create_index([("name", "text"), ("model", "text")])
    await db.orders.create_index([("order_id", 1)], unique=True)
    await db.orders.create_index([("email", 1)])
    await db.orders.create_index([("created_at", -1)])
    logger.info("Database indexes created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═════════════════════════════════════════════════════════════════════════════
#  PRODUCT ROUTES
# ═════════════════════════════════════════════════════════════════════════════

@api_router.get("/")
async def root():
    return {"message": "zenXteknoloji API'ye Hoşgeldiniz"}

@api_router.get("/exchange-rate")
async def get_exchange_rate():
    rate = await fetch_usd_try_rate()
    return {
        "usd_to_try": rate,
        "profit_margin": f"{PROFIT_MARGIN * 100}%",
        "last_updated": currency_cache["last_updated"].isoformat() if currency_cache["last_updated"] else None
    }

@api_router.get("/categories", response_model=List[str])
async def get_categories():
    categories = await db.products.distinct("category")
    return sorted(categories)

@api_router.get("/products", response_model=List[ProductResponse])
async def get_products(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query("name"),
    in_stock: Optional[bool] = Query(False),
    limit: int = Query(100, ge=1, le=500)
):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"model": {"$regex": search, "$options": "i"}},
            {"barcode": {"$regex": search, "$options": "i"}}
        ]
    if in_stock:
        query["$nor"] = [
            {"stock_text": {"$regex": "^Stok\\s*:\\s*0$", "$options": "i"}},
            {"stock_text": {"$regex": "yok", "$options": "i"}},
            {"stock_text": {"$regex": "tükendi", "$options": "i"}},
            {"stock_text": {"$regex": "bitti", "$options": "i"}},
            {"stock_text": None}, {"stock_text": ""}
        ]
    sort_field = [("price_value", 1)] if sort == "price_asc" else [("price_value", -1)] if sort == "price_desc" else [("name", 1)]
    cursor = db.products.find(query, {"_id": 0}).sort(sort_field).limit(limit)
    products = await cursor.to_list(length=limit)
    usd_to_try = await fetch_usd_try_rate()
    for p in products:
        p['last_synced'] = p['last_synced'].isoformat() if isinstance(p.get('last_synced'), datetime) else datetime.now(timezone.utc).isoformat()
        p['price_try'] = calculate_final_price_try(p.get('price_value'), usd_to_try)
    return products

@api_router.get("/products/search/name", response_model=List[ProductResponse])
async def search_products_by_name(
    q: str = Query(..., min_length=1),
    sort: Optional[str] = Query("name"),
    in_stock: Optional[bool] = Query(False),
    limit: int = Query(100, ge=1, le=100)
):
    q = q.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    query = {"$or": [
        {"name": {"$regex": re.escape(q), "$options": "i"}},
        {"model": {"$regex": re.escape(q), "$options": "i"}},
        {"barcode": {"$regex": re.escape(q), "$options": "i"}},
    ]}
    if in_stock:
        query["$nor"] = [
            {"stock_text": {"$regex": "^Stok\\s*:\\s*0$", "$options": "i"}},
            {"stock_text": {"$regex": "yok", "$options": "i"}},
            {"stock_text": {"$regex": "tükendi", "$options": "i"}},
            {"stock_text": {"$regex": "bitti", "$options": "i"}},
            {"stock_text": None}, {"stock_text": ""}
        ]
    sort_field = [("price_value", 1)] if sort == "price_asc" else [("price_value", -1)] if sort == "price_desc" else [("name", 1)]
    cursor = db.products.find(query, {"_id": 0}).sort(sort_field).limit(limit)
    products = await cursor.to_list(length=limit)
    usd_to_try = await fetch_usd_try_rate()
    for p in products:
        p['last_synced'] = p['last_synced'].isoformat() if isinstance(p.get('last_synced'), datetime) else datetime.now(timezone.utc).isoformat()
        p['price_try'] = calculate_final_price_try(p.get('price_value'), usd_to_try)
    return products

@api_router.get("/products/search", response_model=List[ProductResponse])
async def search_products(
    q: str = Query(..., min_length=1),
    sort: Optional[str] = Query("name"),
    in_stock: Optional[bool] = Query(False),
    limit: int = Query(100, ge=1, le=100)
):
    words = [re.escape(w) for w in q.strip().split() if w]
    if not words:
        raise HTTPException(status_code=400, detail="Search query must include at least one word")
    query = {"$or": [{"category": {"$regex": rf"(?<!\S){w}(?!\S)", "$options": "i"}} for w in words]}
    if in_stock:
        query["$nor"] = [
            {"stock_text": {"$regex": "^Stok\\s*:\\s*0$", "$options": "i"}},
            {"stock_text": {"$regex": "yok", "$options": "i"}},
            {"stock_text": {"$regex": "tükendi", "$options": "i"}},
            {"stock_text": {"$regex": "bitti", "$options": "i"}},
            {"stock_text": None}, {"stock_text": ""}
        ]
    sort_field = [("price_value", 1)] if sort == "price_asc" else [("price_value", -1)] if sort == "price_desc" else [("name", 1)]
    cursor = db.products.find(query, {"_id": 0}).sort(sort_field).limit(limit)
    products = await cursor.to_list(length=limit)
    usd_to_try = await fetch_usd_try_rate()
    for p in products:
        p['last_synced'] = p['last_synced'].isoformat() if isinstance(p.get('last_synced'), datetime) else datetime.now(timezone.utc).isoformat()
        p['price_try'] = calculate_final_price_try(p.get('price_value'), usd_to_try)
    return products

@api_router.get("/products/{model}", response_model=ProductResponse)
async def get_product_by_model(model: str):
    product = await db.products.find_one({"model": model}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    product['last_synced'] = product['last_synced'].isoformat() if isinstance(product.get('last_synced'), datetime) else datetime.now(timezone.utc).isoformat()
    usd_to_try = await fetch_usd_try_rate()
    product['price_try'] = calculate_final_price_try(product.get('price_value'), usd_to_try)
    return product

@api_router.post("/products/sync", response_model=dict)
async def sync_products(batch: ProductSyncBatch):
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
    return {"success": True, "deleted": 0, "inserted": inserted_count, "total": len(batch.products)}

@api_router.post("/products/drop", response_model=dict)
async def drop_products():
    result = await db.products.delete_many({})
    return {"success": True, "deleted": result.deleted_count}

@api_router.post("/products", response_model=ProductResponse)
async def create_product(product: ProductCreate):
    product_dict = product.model_dump()
    product_dict['last_synced'] = datetime.now(timezone.utc)
    await db.products.insert_one(product_dict)
    product_dict['last_synced'] = product_dict['last_synced'].isoformat()
    usd_to_try = await fetch_usd_try_rate()
    product_dict['price_try'] = calculate_final_price_try(product_dict.get('price_value'), usd_to_try)
    return product_dict

# ═════════════════════════════════════════════════════════════════════════════
#  ORDER ROUTES
# ═════════════════════════════════════════════════════════════════════════════

@api_router.post("/orders/send-verification")
async def send_verification(req: SendVerificationRequest):
    """Generate and send a 4-digit email verification code"""
    code = str(random.randint(1000, 9999))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    verification_store[req.email] = {"code": code, "expires_at": expires_at}
    html = _verification_html(code)
    sent = _send_email([req.email], "zenX Teknoloji — E-posta Doğrulama Kodu", html)
    if not sent:
        logger.info(f"[DEV] Verification code for {req.email}: {code}")
    return {"success": True, "message": "Doğrulama kodu e-posta adresinize gönderildi."}


@api_router.post("/orders/verify-code")
async def verify_email_code(req: VerifyCodeRequest):
    """Verify the 4-digit code sent to email"""
    entry = verification_store.get(req.email)
    if not entry:
        raise HTTPException(status_code=400, detail="Bu e-posta için doğrulama kodu bulunamadı.")
    if datetime.now(timezone.utc) > entry["expires_at"]:
        del verification_store[req.email]
        raise HTTPException(status_code=400, detail="Doğrulama kodunun süresi dolmuş. Lütfen yeniden gönderin.")
    if entry["code"] != req.code.strip():
        raise HTTPException(status_code=400, detail="Doğrulama kodu hatalı.")
    return {"success": True, "message": "E-posta doğrulandı."}


@api_router.post("/orders/checkout")
async def process_checkout(req: CheckoutRequest):
    """Process checkout: verify email code, save order, send emails"""
    # Re-verify code
    entry = verification_store.get(req.email)
    if not entry:
        raise HTTPException(status_code=400, detail="E-posta doğrulanmamış. Lütfen kodu tekrar gönderin.")
    if datetime.now(timezone.utc) > entry["expires_at"]:
        raise HTTPException(status_code=400, detail="Doğrulama kodunun süresi dolmuş.")
    if entry["code"] != req.verification_code.strip():
        raise HTTPException(status_code=400, detail="Doğrulama kodu hatalı.")
    if not req.captcha_verified:
        raise HTTPException(status_code=400, detail="CAPTCHA doğrulaması gerekli.")

    # Build order
    order_id = f"ZX-{datetime.now().strftime('%Y%m%d%H%M%S')}-{random.randint(100,999)}"
    order = {
        "order_id": order_id,
        "first_name": req.first_name,
        "last_name": req.last_name,
        "email": req.email,
        "address": req.address,
        "phone": req.phone,
        "payment_method": req.payment_method,
        "items": [i.model_dump() for i in req.items],
        "total_price": req.total_price,
        "created_at": datetime.now(timezone.utc).strftime("%d.%m.%Y %H:%M"),
        "status": "pending",
    }

    # Save to MongoDB
    await db.orders.insert_one({**order, "_id_str": order_id})

    order.pop("_id", None)

    # Send emails (store + customer)
    store_html = _order_html(order, is_store=True)
    customer_html = _order_html(order, is_store=False)
    _send_email([STORE_EMAIL], f"Yeni Sipariş: {order_id}", store_html)
    _send_email([req.email], f"Siparişiniz Alındı — {order_id}", customer_html)

    # Clean up verification code
    if req.email in verification_store:
        del verification_store[req.email]

    
    return order


@api_router.get("/orders", response_model=List[dict])
async def get_orders(limit: int = Query(100, ge=1, le=200)):
    """Get recent orders (admin)"""
    cursor = db.orders.find({}, {"_id": 0}).sort([("created_at", -1)]).limit(limit)
    orders = await cursor.to_list(length=limit)
    return orders


# ── Register router ───────────────────────────────────────────────────────────
app.include_router(api_router)