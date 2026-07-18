import os
import json
import copy
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for all routes (necessary for Vercel -> Render communication)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'menu_db.json')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'rumana123')

# Seed data
DEFAULT_MENU = {
    "dinnerMode": False,
    "announcement": "Welcome to Rumana's Kitchen! Authentic Bengali homemade delicacies prepared fresh from the heart.",
    "items": [
        {
            "id": 1,
            "name": "Chicken Biriyani",
            "category": "biryani",
            "diet": "nonveg",
            "image": "biriyani.jpg",
            "description": "Traditional Dum Chicken Biriyani of Bengal",
            "price": 200,
            "hasSizes": True,
            "prices": {
                "half": 100,
                "full": 200
            },
            "available": True
        },
        {
            "id": 3,
            "name": "Mutton Biriyani",
            "category": "biryani",
            "diet": "nonveg",
            "image": "mbiriyani.jpg",
            "description": "Authentic Mutton Dum Biriyani of Bengal",
            "price": 300,
            "hasSizes": True,
            "prices": {
                "half": 150,
                "full": 300
            },
            "available": True
        },
        {
            "id": 5,
            "name": "Mutton Curry",
            "category": "curries",
            "diet": "nonveg",
            "image": "mutton.jpg",
            "description": "5 pieces per plate",
            "price": 280,
            "available": True
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
            "available": True
        },
        {
            "id": 7,
            "name": "Fish Curry",
            "category": "curries",
            "diet": "nonveg",
            "image": "fish (1).jpg",
            "description": "2 pieces per plate",
            "price": 170,
            "available": True
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
        }
    ]
}

def migrate_and_merge(loaded_data):
    # Ensure dinnerMode and announcement exist
    if 'dinnerMode' not in loaded_data:
        loaded_data['dinnerMode'] = DEFAULT_MENU['dinnerMode']
    if 'announcement' not in loaded_data:
        loaded_data['announcement'] = DEFAULT_MENU['announcement']
        
    items = loaded_data.get('items', [])
    
    # 1. Remove ID 2 and ID 4 if they exist (old Half Biriyanis)
    items = [item for item in items if item.get('id') not in (2, 4)]
    
    # 2. Check if ID 1 and ID 3 have hasSizes. If not, update them to combined versions from DEFAULT_MENU
    default_biriyanis = {item['id']: item for item in DEFAULT_MENU['items'] if item['id'] in (1, 3)}
    for i, item in enumerate(items):
        item_id = item.get('id')
        if item_id in (1, 3) and not item.get('hasSizes'):
            items[i] = default_biriyanis[item_id]
            
    # 3. Add any other missing items from DEFAULT_MENU
    loaded_ids = {item.get('id') for item in items}
    for default_item in DEFAULT_MENU['items']:
        if default_item['id'] not in loaded_ids:
            items.append(default_item)
            
    # 4. Ensure all items have a stockCount (default to 20 if missing)
    for item in items:
        if 'stockCount' not in item or item['stockCount'] is None:
            item['stockCount'] = 20
            
    # Sort items by id
    items = sorted(items, key=lambda x: x.get('id', 999))
    loaded_data['items'] = items
    return loaded_data

def load_db():
    if not os.path.exists(DB_PATH):
        with open(DB_PATH, 'w') as f:
            json.dump(DEFAULT_MENU, f, indent=4)
        return DEFAULT_MENU
    try:
        with open(DB_PATH, 'r') as f:
            data = json.load(f)
        # Migrate and auto-heal
        original_data = copy.deepcopy(data)
        updated_data = migrate_and_merge(data)
        # If anything was modified, save it
        if updated_data != original_data:
            save_db(updated_data)
        return updated_data
    except Exception as e:
        print(f"Error loading/migrating DB: {e}")
        return DEFAULT_MENU

def save_db(data):
    with open(DB_PATH, 'w') as f:
        json.dump(data, f, indent=4)

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
