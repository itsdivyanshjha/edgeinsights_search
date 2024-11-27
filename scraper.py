import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
from urllib.parse import quote_plus
import sys
import json

# MongoDB Setup
client = MongoClient("your_mongodb_connection_string")
db = client["flipkarttest"]
collection = db["edgeinsighttest"]

# Unified Structure Function
def unified_product_structure(platform, data):
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
        "url": data.get("url"),
    }

# Scraper for Amazon
def scrape_amazon(search_term):
    search_url = f"https://www.amazon.in/s?k={quote_plus(search_term)}"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(search_url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    products = []
    items = soup.find_all("div", {"data-component-type": "s-search-result"})[:4]
    for item in items:
        product_name = item.find("span", class_="a-size-medium").text.strip() if item.find("span", class_="a-size-medium") else None
        price_whole = item.find("span", class_="a-price-whole")
        price = price_whole.text.strip() if price_whole else None
        url = "https://www.amazon.in" + item.find("a", class_="a-link-normal")["href"] if item.find("a", class_="a-link-normal") else None
        products.append(unified_product_structure("Amazon", {
            "product_name": product_name,
            "brand": None,
            "price": {"selling_price": price},
            "features": {},
            "customer_ratings": None,
            "reviews": [],
            "delivery_details": None,
            "seller_info": None,
            "url": url,
        }))
    return products

# Scraper for Flipkart
def scrape_flipkart(search_term):
    search_url = f"https://www.flipkart.com/search?q={quote_plus(search_term)}"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(search_url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    products = []
    items = soup.find_all("div", class_="_1AtVbE")[:4]
    for item in items:
        product_name = item.find("div", class_="_4rR01T").text.strip() if item.find("div", class_="_4rR01T") else None
        price = item.find("div", class_="_30jeq3").text.strip() if item.find("div", class_="_30jeq3") else None
        url = item.find("a", class_="_1fQZEK")["href"] if item.find("a", class_="_1fQZEK") else None
        products.append(unified_product_structure("Flipkart", {
            "product_name": product_name,
            "brand": product_name.split()[0] if product_name else None,
            "price": {"selling_price": price},
            "features": {},
            "customer_ratings": None,
            "reviews": [],
            "delivery_details": None,
            "seller_info": None,
            "url": f"https://www.flipkart.com{url}" if url else None,
        }))
    return products

# Scraper for Snapdeal
def scrape_snapdeal(search_term):
    search_url = f"https://www.snapdeal.com/search?keyword={quote_plus(search_term)}"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(search_url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    products = []
    items = soup.find_all("div", class_="product-tuple-listing")[:4]
    for item in items:
        product_name = item.find("p", class_="product-title").text.strip() if item.find("p", class_="product-title") else None
        price = item.find("span", class_="lfloat product-price").text.strip() if item.find("span", class_="lfloat product-price") else None
        url = item.find("a", class_="dp-widget-link")["href"] if item.find("a", class_="dp-widget-link") else None
        products.append(unified_product_structure("Snapdeal", {
            "product_name": product_name,
            "brand": None,
            "price": {"selling_price": price},
            "features": {},
            "customer_ratings": None,
            "reviews": [],
            "delivery_details": None,
            "seller_info": None,
            "url": url,
        }))
    return products

if __name__ == "__main__":
    search_term = sys.argv[1]
    amazon = scrape_amazon(search_term)
    flipkart = scrape_flipkart(search_term)
    snapdeal = scrape_snapdeal(search_term)

    all_products = amazon + flipkart + snapdeal
    print(json.dumps(all_products))
