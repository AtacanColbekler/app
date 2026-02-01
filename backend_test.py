#!/usr/bin/env python3
"""
Backend API Testing for zenXteknoloji E-commerce
Tests all API endpoints for functionality and data integrity
"""

import requests
import sys
import json
from datetime import datetime

class ZenXEcommerceAPITester:
    def __init__(self, base_url="https://zenx-ecommerce.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            self.failed_tests.append({"name": name, "details": details})
            print(f"❌ {name} - FAILED: {details}")

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "zenXteknoloji" in data.get("message", "")
            self.log_test("API Root", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("API Root", False, str(e))
            return False

    def test_get_categories(self):
        """Test GET /api/categories"""
        try:
            response = requests.get(f"{self.api_url}/categories", timeout=10)
            success = response.status_code == 200
            if success:
                categories = response.json()
                success = isinstance(categories, list) and len(categories) > 0
                expected_categories = ["Laptop", "Masaüstü Bilgisayar", "Monitör", "Ekran Kartı", "RAM"]
                for cat in expected_categories:
                    if cat not in categories:
                        success = False
                        break
            self.log_test("GET Categories", success, f"Status: {response.status_code}, Categories: {len(categories) if success else 0}")
            return success, categories if success else []
        except Exception as e:
            self.log_test("GET Categories", False, str(e))
            return False, []

    def test_get_products(self):
        """Test GET /api/products"""
        try:
            response = requests.get(f"{self.api_url}/products", timeout=10)
            success = response.status_code == 200
            products = []
            if success:
                products = response.json()
                success = isinstance(products, list) and len(products) > 0
                # Validate product structure
                if success and products:
                    required_fields = ["supplier", "category", "name", "model", "last_synced"]
                    for product in products[:3]:  # Check first 3 products
                        for field in required_fields:
                            if field not in product:
                                success = False
                                break
                        if not success:
                            break
            self.log_test("GET Products", success, f"Status: {response.status_code}, Products: {len(products) if success else 0}")
            return success, products
        except Exception as e:
            self.log_test("GET Products", False, str(e))
            return False, []

    def test_get_products_with_category_filter(self, category="Laptop"):
        """Test GET /api/products with category filter"""
        try:
            response = requests.get(f"{self.api_url}/products", params={"category": category}, timeout=10)
            success = response.status_code == 200
            if success:
                products = response.json()
                success = isinstance(products, list)
                # Verify all products belong to the category
                if success and products:
                    for product in products:
                        if product.get("category") != category:
                            success = False
                            break
            self.log_test(f"GET Products (Category: {category})", success, f"Status: {response.status_code}, Filtered products: {len(products) if success else 0}")
            return success
        except Exception as e:
            self.log_test(f"GET Products (Category: {category})", False, str(e))
            return False

    def test_search_products(self, query="Gaming"):
        """Test GET /api/products/search"""
        try:
            response = requests.get(f"{self.api_url}/products/search", params={"q": query}, timeout=10)
            success = response.status_code == 200
            if success:
                products = response.json()
                success = isinstance(products, list)
                # Verify search results contain the query term
                if success and products:
                    found_match = False
                    for product in products:
                        name = product.get("name", "").lower()
                        model = product.get("model", "").lower()
                        if query.lower() in name or query.lower() in model:
                            found_match = True
                            break
                    success = found_match
            self.log_test(f"Search Products (q={query})", success, f"Status: {response.status_code}, Results: {len(products) if success else 0}")
            return success, products if success else []
        except Exception as e:
            self.log_test(f"Search Products (q={query})", False, str(e))
            return False, []

    def test_get_product_by_model(self, model="FX506LH-HN004"):
        """Test GET /api/products/{model}"""
        try:
            response = requests.get(f"{self.api_url}/products/{model}", timeout=10)
            success = response.status_code == 200
            if success:
                product = response.json()
                success = isinstance(product, dict) and product.get("model") == model
                # Validate required fields
                if success:
                    required_fields = ["supplier", "category", "name", "model", "last_synced"]
                    for field in required_fields:
                        if field not in product:
                            success = False
                            break
            self.log_test(f"GET Product by Model ({model})", success, f"Status: {response.status_code}")
            return success, product if success else {}
        except Exception as e:
            self.log_test(f"GET Product by Model ({model})", False, str(e))
            return False, {}

    def test_get_nonexistent_product(self):
        """Test GET /api/products/{model} with non-existent model"""
        try:
            response = requests.get(f"{self.api_url}/products/NONEXISTENT-MODEL-123", timeout=10)
            success = response.status_code == 404
            self.log_test("GET Non-existent Product", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("GET Non-existent Product", False, str(e))
            return False

    def test_sync_products_endpoint(self):
        """Test POST /api/products/sync endpoint structure"""
        try:
            # Test with empty batch first
            test_data = {"products": []}
            response = requests.post(f"{self.api_url}/products/sync", json=test_data, timeout=10)
            success = response.status_code == 200
            if success:
                result = response.json()
                success = "success" in result and "total" in result
            self.log_test("POST Products Sync (Empty)", success, f"Status: {response.status_code}")
            
            # Test with single product
            test_product = {
                "supplier": "test_supplier",
                "category": "Test Category",
                "name": "Test Product",
                "model": f"TEST-MODEL-{datetime.now().strftime('%H%M%S')}",
                "barcode": "1234567890123",
                "image_url": "https://example.com/test.jpg",
                "stock_text": "Test Stock",
                "price_value": 99.99,
                "price_raw": "99,99 TL"
            }
            test_data = {"products": [test_product]}
            response = requests.post(f"{self.api_url}/products/sync", json=test_data, timeout=10)
            success = response.status_code == 200
            if success:
                result = response.json()
                success = result.get("success") == True and result.get("total") == 1
            self.log_test("POST Products Sync (Single Product)", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("POST Products Sync", False, str(e))
            return False

    def test_search_edge_cases(self):
        """Test search with edge cases"""
        # Test empty search
        try:
            response = requests.get(f"{self.api_url}/products/search", params={"q": ""}, timeout=10)
            success = response.status_code == 422  # Should return validation error
            self.log_test("Search Empty Query", success, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Search Empty Query", False, str(e))

        # Test very long search
        try:
            long_query = "a" * 1000
            response = requests.get(f"{self.api_url}/products/search", params={"q": long_query}, timeout=10)
            success = response.status_code in [200, 422]  # Either works or validation error
            self.log_test("Search Long Query", success, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Search Long Query", False, str(e))

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting zenXteknoloji E-commerce API Tests")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_api_root():
            print("❌ API root failed - stopping tests")
            return False
        
        # Core functionality tests
        categories_success, categories = self.test_get_categories()
        products_success, products = self.test_get_products()
        
        if not products_success:
            print("❌ Products endpoint failed - stopping tests")
            return False
        
        # Test with actual data
        if categories:
            self.test_get_products_with_category_filter(categories[0])
        
        # Search tests
        search_success, search_results = self.test_search_products("Gaming")
        self.test_search_products("Laptop")
        self.test_search_products("RTX")
        
        # Product detail tests
        if products:
            first_product_model = products[0].get("model")
            if first_product_model:
                self.test_get_product_by_model(first_product_model)
        
        self.test_get_nonexistent_product()
        
        # Sync endpoint test
        self.test_sync_products_endpoint()
        
        # Edge cases
        self.test_search_edge_cases()
        
        # Results summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['name']}: {test['details']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✅ Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80  # Consider 80%+ as passing

def main():
    """Main test execution"""
    tester = ZenXEcommerceAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())