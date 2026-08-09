import os
import json
import copy
import base64
import requests as req_lib
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for all routes (necessary for Vercel -> Render communication)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'menu_db.json')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'rumana123')

# JSONBin.io persistent cloud storage (survives Render server restarts)
JSONBIN_MASTER_KEY = '$2a$10$7pl.Q7DOkk19SU86HWjlceD4TmOaP/UaJhDIhhqZq5bA4rVkmD75.'
JSONBIN_BIN_ID = '6a5c9b1af5f4af5e29a36006'
JSONBIN_URL = f'https://api.jsonbin.io/v3/b/{JSONBIN_BIN_ID}'
JSONBIN_HEADERS = {
    'X-Master-Key': JSONBIN_MASTER_KEY,
    'Content-Type': 'application/json'
}

# Seed data
DEFAULT_MENU = {
    "dinnerMode": False,
    "announcement": "Welcome to Rumana's Kitchen! Authentic Bengali homemade delicacies prepared fresh from the heart.",
    "prepTime": "1h 30m",
    "items": [
        {
            "id": 1,
            "name": "Chicken Biriyani",
            "category": "biryani",
            "diet": "nonveg",
            "image": "biriyani.jpg",
            "description": "Traditional Dum Chicken Biriyani of Bengal",
            "price": 190,
            "hasSizes": True,
            "prices": {
                "half": 110,
                "full": 190
            },
            "available": True,
            "hasPotatoOption": True
        },
        {
            "id": 3,
            "name": "Mutton Biriyani",
            "category": "biryani",
            "diet": "nonveg",
            "image": "mbiriyani.jpg",
            "description": "Authentic Mutton Dum Biriyani of Bengal",
            "price": 300,
            "available": True,
            "hasPotatoOption": True
        },
        {
            "id": 5,
            "name": "Mutton Curry",
            "category": "curries",
            "diet": "nonveg",
            "image": "mutton.jpg",
            "description": "5 pieces per plate",
            "price": 280,
            "available": True,
            "hasPotatoOption": True
        },
        {
            "id": 6,
            "name": "Chicken Curry",
            "category": "curries",
            "diet": "nonveg",
            "image": "ccurry.jpg",
            "fallbackImage": "ccurry.jpg",
            "description": "6 pieces per plate",
            "price": 180,
            "available": True,
            "hasPotatoOption": True
        },
        {
            "id": 7,
            "name": "Fish Curry",
            "category": "curries",
            "diet": "nonveg",
            "image": "fish (1).jpg",
            "description": "2 pieces per plate",
            "price": 170,
            "available": True,
            "hasPotatoOption": True
        },
        {
            "id": 8,
            "name": "Mixed Veg Curry",
            "category": "curries",
            "diet": "veg",
            "image": "veg.jpg",
            "description": "Per plate",
            "price": 80,
            "available": True
        },
        {
            "id": 9,
            "name": "Aloo Gobi Curry",
            "category": "curries",
            "diet": "veg",
            "image": "fgovialoo.jpg",
            "fallbackImage": "fgovialoo.jpg",
            "description": "Per plate",
            "price": 80,
            "available": True
        },
        {
            "id": 10,
            "name": "Bhindi Aloo Curry",
            "category": "curries",
            "diet": "veg",
            "image": "valoo.jpg",
            "fallbackImage": "valoo.jpg",
            "description": "Per plate",
            "price": 80,
            "available": True
        },
        {
            "id": 11,
            "name": "Patta Gobi Curry",
            "category": "curries",
            "diet": "veg",
            "image": "pgovi.jpg",
            "fallbackImage": "pgovi.jpg",
            "description": "Per plate",
            "price": 80,
            "available": True
        },
        {
            "id": 12,
            "name": "Chicken Pakora (Boneless)",
            "category": "snacks",
            "diet": "nonveg",
            "image": "cpakora.jpg",
            "fallbackImage": "cpakora.jpg",
            "description": "500 g",
            "price": 400,
            "available": True
        },
        {
            "id": 13,
            "name": "Paneer Masala",
            "category": "curries",
            "diet": "veg",
            "image": "paneer.jpg",
            "description": "Per plate",
            "price": 110,
            "available": True
        },
        {
            "id": 14,
            "name": "Choley Paneer Masala",
            "category": "curries",
            "diet": "veg",
            "image": "npaneer.jpg",
            "description": "Per plate",
            "price": 100,
            "available": True
        },
        {
            "id": 15,
            "name": "Dhokla",
            "category": "sweets",
            "diet": "veg",
            "image": "dhokla.jpg",
            "fallbackImage": "dhokla.jpg",
            "description": "5 pcs",
            "price": 50,
            "available": True
        },
        {
            "id": 16,
            "name": "Prawn Curry",
            "category": "curries",
            "diet": "nonveg",
            "image": "prawn.png",
            "description": "Per plate",
            "price": 130,
            "available": True
        },
        {
            "id": 17,
            "name": "Plain Rice",
            "category": "biryani",
            "diet": "veg",
            "image": "price.jpg",
            "fallbackImage": "price.jpg",
            "description": "Per plate",
            "price": 60,
            "available": True
        },
        {
            "id": 18,
            "name": "Dal Pakora",
            "category": "snacks",
            "diet": "veg",
            "image": "dalpakora.jpg",
            "fallbackImage": "dalpakora.jpg",
            "description": "500 g",
            "price": 200,
            "available": True
        },
        {
            "id": 19,
            "name": "Normal Paratha",
            "category": "snacks",
            "diet": "veg",
            "image": "nparatha.jpg",
            "description": "Per piece",
            "price": 20,
            "available": True
        },
        {
            "id": 20,
            "name": "Laccha Paratha",
            "category": "snacks",
            "diet": "veg",
            "image": "paratha.jpg",
            "description": "Per piece",
            "price": 30,
            "available": True
        },
        {
            "id": 21,
            "name": "Gravy Sawaiyan",
            "category": "sweets",
            "diet": "veg",
            "image": "gsawaiyan.jpg",
            "description": "Per plate",
            "price": 70,
            "available": True
        },
        {
            "id": 22,
            "name": "Dry Sawaiyan",
            "category": "sweets",
            "diet": "veg",
            "image": "sawaiyan.jpg",
            "description": "Per plate",
            "price": 50,
            "available": True
        },
        {
            "id": 23,
            "name": "Fried Rice",
            "category": "biryani",
            "diet": "veg",
            "image": "friedrice.jpg",
            "description": "Per plate",
            "price": 120,
            "available": True
        },
        {
            "id": 24,
            "name": "Aloo Paratha",
            "category": "snacks",
            "diet": "veg",
            "image": "alooparatha.jpg",
            "fallbackImage": "alooparatha.jpg",
            "description": "Per piece",
            "price": 45,
            "available": True
        },
        {
            "id": 25,
            "name": "Normal Dal",
            "category": "curries",
            "diet": "veg",
            "image": "dal.jpg",
            "fallbackImage": "dal.jpg",
            "description": "Per plate",
            "price": 45,
            "available": True
        },
        {
            "id": 26,
            "name": "Muri Ghonto",
            "category": "curries",
            "diet": "nonveg",
            "image": "murighonto.jpg",
            "fallbackImage": "murighonto.jpg",
            "description": "Assamese style - Per plate",
            "price": 60,
            "available": True
        },
        {
            "id": 27,
            "name": "Fulka (Roti)",
            "category": "snacks",
            "diet": "veg",
            "image": "fulka.jpg",
            "fallbackImage": "fulka.jpg",
            "description": "Per piece",
            "price": 8,
            "available": True
        },
        {
            "id": 28,
            "name": "Egg Curry with Potato",
            "category": "curries",
            "diet": "nonveg",
            "image": "eggcurry.jpg",
            "fallbackImage": "eggcurry.jpg",
            "description": "Per plate",
            "price": 90,
            "available": True
        },
        {
            "id": 29,
            "name": "Soya Chunks Curry",
            "category": "curries",
            "diet": "veg",
            "image": "soyachunks.jpg",
            "fallbackImage": "soyachunks.jpg",
            "description": "Per plate",
            "price": 90,
            "available": True
        },
        {
            "id": 30,
            "name": "Tandoori Roti",
            "category": "snacks",
            "diet": "veg",
            "image": "tandooriroti.jpg",
            "description": "Per piece",
            "price": 40,
            "available": True,
            "stockCount": 20,
            "prepTime": "1h 30m"
        },
        {
            "id": 31,
            "name": "Chicken Chaap",
            "category": "curries",
            "diet": "nonveg",
            "image": "chickenchaap.jpg",
            "description": "1 piece per plate",
            "price": 120,
            "available": True,
            "stockCount": 20,
            "prepTime": "1h 30m"
        },
        {
            "id": 32,
            "name": "Kashmiri Aloo Dum",
            "category": "curries",
            "diet": "veg",
            "image": "kashmirialoodum.jpg",
            "description": "5 pcs per plate",
            "price": 100,
            "available": True,
            "stockCount": 20,
            "prepTime": "1h 30m"
        },
        {
            "id": 33,
            "name": "Fulko Luchi",
            "category": "snacks",
            "diet": "veg",
            "image": "fulkoluchi.jpg",
            "description": "4 pcs per plate",
            "price": 50,
            "available": True,
            "stockCount": 20,
            "prepTime": "1h 30m"
        },
        {
            "id": 34,
            "name": "Chicken Varta",
            "category": "curries",
            "diet": "nonveg",
            "image": "chickenvarta.jpg",
            "description": "Per plate",
            "price": 120,
            "available": True,
            "stockCount": 20,
            "prepTime": "1h 30m"
        }
    ]
}

def migrate_and_merge(loaded_data):
    # Ensure dinnerMode and announcement exist
    if 'dinnerMode' not in loaded_data:
        loaded_data['dinnerMode'] = DEFAULT_MENU['dinnerMode']
    if 'announcement' not in loaded_data:
        loaded_data['announcement'] = DEFAULT_MENU['announcement']
    if 'prepTime' not in loaded_data:
        loaded_data['prepTime'] = DEFAULT_MENU.get('prepTime', '1h 30m')
        
    items = loaded_data.get('items', [])
    
    # 1. Remove ID 2 and ID 4 if they exist (old Half Biriyanis)
    items = [item for item in items if item.get('id') not in (2, 4)]
    
    # 2. Check if ID 1 (Chicken Biriyani) has hasSizes. If not, update to combined version from DEFAULT_MENU
    for i, item in enumerate(items):
        if item.get('id') == 1 and not item.get('hasSizes'):
            items[i] = DEFAULT_MENU['items'][0]
            
    # 3. Add any other missing items from DEFAULT_MENU
    loaded_ids = {item.get('id') for item in items}
    for default_item in DEFAULT_MENU['items']:
        if default_item['id'] not in loaded_ids:
            items.append(default_item)
            
    # 4. Ensure all items have a stockCount and prepTime (defaults if missing)
    for item in items:
        if 'stockCount' not in item or item['stockCount'] is None:
            item['stockCount'] = 20
        if 'prepTime' not in item or not item['prepTime']:
            item['prepTime'] = '1h 30m'
            
    # Sort items by id
    items = sorted(items, key=lambda x: x.get('id', 999))
    loaded_data['items'] = items
    return loaded_data

_cached_db = None

def load_db():
    global _cached_db
    if _cached_db is not None:
        return _cached_db

    # 1. Always attempt to load from JSONBin cloud storage (Source of Truth across Render sleeps)
    cloud_data = load_cloud_state()
    if cloud_data and isinstance(cloud_data, dict) and 'items' in cloud_data and len(cloud_data['items']) > 0:
        migrated = migrate_and_merge(cloud_data)
        _cached_db = migrated
        try:
            with open(DB_PATH, 'w') as f:
                json.dump(migrated, f, indent=4)
        except Exception:
            pass
        print(f"[DB INIT] Loaded {len(migrated.get('items', []))} items from JSONBin cloud storage.")
        return migrated

    # 2. Fallback to local DB file if JSONBin cloud is unreachable
    if os.path.exists(DB_PATH):
        try:
            with open(DB_PATH, 'r') as f:
                data = json.load(f)
            migrated = migrate_and_merge(data)
            _cached_db = migrated
            return migrated
        except Exception as e:
            print(f"Error loading local DB: {e}")

    # 3. Fallback to DEFAULT_MENU seed
    migrated = migrate_and_merge(copy.deepcopy(DEFAULT_MENU))
    _cached_db = migrated
    return migrated

def save_db(data):
    global _cached_db
    _cached_db = copy.deepcopy(data)
    # Save to local file
    try:
        with open(DB_PATH, 'w') as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        print(f"Local save error: {e}")
    # Save to JSONBin cloud (persistent across server restarts)
    save_cloud_state(data)

def load_cloud_state():
    """Load menu state from JSONBin.io (persists across Render server restarts)."""
    try:
        resp = req_lib.get(JSONBIN_URL, headers=JSONBIN_HEADERS, timeout=8)
        if resp.status_code == 200:
            data = resp.json().get('record', {})
            if data and 'items' in data:
                print("[JSONBIN] Loaded menu state from cloud storage.")
                return data
    except Exception as e:
        print(f"[JSONBIN] Failed to load from cloud: {e}")
    return None

def save_cloud_state(data):
    """Save menu state to JSONBin.io for persistence across restarts."""
    try:
        resp = req_lib.put(JSONBIN_URL, headers=JSONBIN_HEADERS, json=data, timeout=8)
        if resp.status_code == 200:
            print("[JSONBIN] Menu state saved to cloud storage.")
        else:
            print(f"[JSONBIN] Cloud save failed: {resp.status_code} {resp.text[:100]}")
    except Exception as e:
        print(f"[JSONBIN] Failed to save to cloud: {e}")

def check_auth():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return False
    # Format: Bearer password_string
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return False
    return parts[1] == ADMIN_PASSWORD

# Routes
@app.route('/api/menu', methods=['GET'])
def get_menu():
    return jsonify(load_db())

@app.route('/api/auth/verify', methods=['POST'])
def verify_password():
    data = request.json or {}
    password = data.get('password')
    if password == ADMIN_PASSWORD:
        return jsonify({"success": True, "token": ADMIN_PASSWORD})
    return jsonify({"success": False, "error": "Incorrect password"}), 401

@app.route('/api/menu/update', methods=['POST'])
def update_menu():
    if not check_auth():
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    if not data or 'items' not in data:
        return jsonify({"error": "Invalid format"}), 400
        
    save_db(data)
    return jsonify({"success": True, "message": "Menu updated successfully!"})

@app.route('/api/menu/toggle-dinner', methods=['POST'])
def toggle_dinner():
    if not check_auth():
        return jsonify({"error": "Unauthorized"}), 401
    
    db_data = load_db()
    db_data['dinnerMode'] = not db_data.get('dinnerMode', False)
    save_db(db_data)
    return jsonify({"success": True, "dinnerMode": db_data['dinnerMode']})

@app.route('/api/menu/item/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    if not check_auth():
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.json or {}
    db_data = load_db()
    
    found = False
    for item in db_data.get('items', []):
        if item['id'] == item_id:
            # Update fields
            if 'name' in data:
                item['name'] = data['name']
            if 'price' in data:
                item['price'] = int(data['price'])
            if 'description' in data:
                item['description'] = data['description']
            if 'available' in data:
                item['available'] = bool(data['available'])
            found = True
            break
            
    if not found:
        return jsonify({"error": "Item not found"}), 404
        
    save_db(db_data)
    return jsonify({"success": True, "message": "Item updated successfully!"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5050))
    app.run(host='0.0.0.0', port=port, debug=True)
