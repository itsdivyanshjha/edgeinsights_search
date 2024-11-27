import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
from urllib.parse import quote_plus

# MongoDB Setup
client = MongoClient("<your_mongodb_connection_string>")
db = client["unifiedProductDB"]
collection = db["products"]

# Unified Structure Function
def unified_product_structure(platform, data):
    """
    Creates a unified product structure for MongoDB storage.
    """
    return {
        "platform": platform,
        "product_name": data.get("product_name"),
        "brand": data.get("brand"),
        "price": data.get("price"),
        "features": data.get("features"),
        "customer_ratings": data.get("customer_ratings"),
        "reviews": data.get("reviews"),
        "delivery_details": data.get("delivery_details"),
        "seller_info": data.get("seller_info"),
    }

# Scraping Amazon
def scrape_amazon(search_term):
    search_url = f"https://www.amazon.in/s?k={quote_plus(search_term)}"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(search_url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    products = []
    items = soup.find_all("div", {"data-component-type": "s-search-result"})[:2]  # Top 2 results
    for item in items:
        product_name = item.find("span", class_="a-size-me dium").text.strip() if item.find("span", class_="a-size-medium") else None
        brand = None  
        price_whole = item.find("span", class_="a-price-whole")
        price = price_whole.text.strip() if price_whole else None
        features = {
            "fit": None,
            "fabric": None,
            "pattern": None,
            "collar_style": None,
            "sleeve_length": None,
            "color": None,
            "size_options": None,
        }
        products.append(unified_product_structure("Amazon", {
            "product_name": product_name,
            "brand": brand,
            "price": {"selling_price": price},
            "features": features,
            "customer_ratings": None,
            "reviews": [],
            "delivery_details": None,
            "seller_info": None,
        }))
    return products

# Scraping Flipkart
def scrape_flipkart(search_term):
    search_url = f"https://www.flipkart.com/search?q={quote_plus(search_term)}"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(search_url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    products = []
    items = soup.find_all("div", class_="_1AtVbE")[:2]  # Top 2 results
    for item in items:
        product_name = item.find("div", class_="_4rR01T").text.strip() if item.find("div", class_="_4rR01T") else None
        brand = product_name.split()[0] if product_name else None
        price = item.find("div", class_="_30jeq3").text.strip() if item.find("div", class_="_30jeq3") else None
        features = {
            "fit": None,
            "fabric": None,
            "pattern": None,
            "collar_style": None,
            "sleeve_length": None,
            "color": None,
            "size_options": None,
        }
        products.append(unified_product_structure("Flipkart", {
            "product_name": product_name,
            "brand": brand,
            "price": {"selling_price": price},
            "features": features,
            "customer_ratings": None,
            "reviews": [],
            "delivery_details": None,
            "seller_info": None,
        }))
    return products

# Scraping Snapdeal
def scrape_snapdeal(search_term):
    search_url = f"https://www.snapdeal.com/search?keyword={quote_plus(search_term)}"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(search_url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    products = []
    items = soup.find_all("div", class_="product-tuple-listing")[:2]  # Top 2 results
    for item in items:
        product_name = item.find("p", class_="product-title").text.strip() if item.find("p", class_="product-title") else None
        brand = None  # Snapdeal doesn't explicitly show brand
        price = item.find("span", class_="lfloat product-price").text.strip() if item.find("span", class_="lfloat product-price") else None
        features = {
            "fit": None,
            "fabric": None,
            "pattern": None,
            "collar_style": None,
            "sleeve_length": None,
            "color": None,
            "size_options": None,
        }
        products.append(unified_product_structure("Snapdeal", {
            "product_name": product_name,
            "brand": brand,
            "price": {"selling_price": price},
            "features": features,
            "customer_ratings": None,
            "reviews": [],
            "delivery_details": None,
            "seller_info": None,
        }))
    return products

# Main Function
def main():
    search_term = input("Enter a search term: ")
    amazon_products = scrape_amazon(search_term)
    flipkart_products = scrape_flipkart(search_term)
    snapdeal_products = scrape_snapdeal(search_term)

    all_products = amazon_products + flipkart_products + snapdeal_products
    if all_products:
        collection.insert_many(all_products)
        print("Data successfully saved to MongoDB.")
    else:
        print("No products found.")

if __name__ == "__main__":
    main()
