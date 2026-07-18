import os
import json
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
    "items": [
        {
            "id": 1,
            "name": "Chicken Biriyani (Full)",
            "category": "biryani",
            "diet": "nonveg",
            "image": "biriyani.jpg",
            "description": "Traditional Dum Chicken Biriyani of Bengal",
            "price": 200,
            "available": True
        },
        {
            "id": 2,
            "name": "Chicken Biriyani (Half)",
            "category": "biryani",
            "diet": "nonveg",
            "image": "biriyani.jpg",
            "description": "Traditional Dum Chicken Biriyani of Bengal",
            "price": 150,
            "available": True
        },
        {
            "id": 3,
            "name": "Mutton Biriyani (Full)",
            "category": "biryani",
            "diet": "nonveg",
            "image": "mbiriyani.jpg",
            "description": "Authentic Mutton Dum Biriyani of Bengal",
            "price": 300,
            "available": True
        },
        {
            "id": 4,
            "name": "Mutton Biriyani (Half)",
            "category": "biryani",
            "diet": "nonveg",
            "image": "mbiriyani.jpg",
            "description": "Authentic Mutton Dum Biriyani of Bengal",
            "price": 220,
            "available": True
        },
        {
            "id": 5,
            "name": "Mutton Kasha",
            "category": "curries",
            "diet": "nonveg",
            "image": "mutton.jpg",
            "description": "5 pieces per plate",
            "price": 280,
            "available": True
        },
        {
            "id": 6,
            "name": "Chicken Kasha",
            "category": "curries",
            "diet": "nonveg",
            "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
            "fallbackImage": "mutton.jpg",
            "description": "6 pieces per plate",
            "price": 180,
            "available": True
        },
        {
            "id": 7,
            "name": "Fish Curry",
            "category": "curries",
            "diet": "nonveg",
            "image": "fish.jpg",
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
            "image": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
            "fallbackImage": "veg.jpg",
            "description": "Per plate",
            "price": 80,
            "available": True
        },
        {
            "id": 10,
            "name": "Bhindi Aloo Curry",
            "category": "curries",
            "diet": "veg",
            "image": "https://images.unsplash.com/photo-1645177625150-fe803e0cae79?auto=format&fit=crop&w=600&q=80",
            "fallbackImage": "veg.jpg",
            "description": "Per plate",
            "price": 80,
            "available": True
        },
        {
            "id": 11,
            "name": "Patta Gobi Curry",
            "category": "curries",
            "diet": "veg",
            "image": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
            "fallbackImage": "veg.jpg",
            "description": "Per plate",
            "price": 80,
            "available": True
        },
        {
            "id": 12,
            "name": "Chicken Pakora (Boneless)",
            "category": "snacks",
            "diet": "nonveg",
            "image": "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80",
            "fallbackImage": "biriyani.jpg",
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
            "image": "paneer.jpg",
            "description": "Per plate",
            "price": 100,
            "available": True
        },
        {
            "id": 15,
            "name": "Dhokla",
            "category": "snacks",
            "diet": "veg",
            "image": "https://upload.wikimedia.org/wikipedia/commons/9/90/Khaman_dhokla.jpg",
            "fallbackImage": "veg.jpg",
            "description": "5 pcs",
            "price": 50,
            "available": True
        },
        {
            "id": 16,
            "name": "Fried Rice",
            "category": "biryani",
            "diet": "veg",
            "image": "friedrice.jpg",
            "description": "Per plate",
            "price": 120,
            "available": True
        },
        {
            "id": 17,
            "name": "Plain Rice",
            "category": "biryani",
            "diet": "veg",
            "image": "https://upload.wikimedia.org/wikipedia/commons/2/2c/Steamed_rice_in_bowl_01.jpg",
            "fallbackImage": "friedrice.jpg",
            "description": "Per plate",
            "price": 60,
            "available": True
        },
        {
            "id": 18,
            "name": "Dal Pakora",
            "category": "snacks",
            "diet": "veg",
            "image": "https://upload.wikimedia.org/wikipedia/commons/3/3d/Onion_Pakora_01.jpg",
            "fallbackImage": "veg.jpg",
            "description": "500 g",
            "price": 200,
            "available": True
        },
        {
            "id": 19,
            "name": "Normal Paratha",
            "category": "snacks",
            "diet": "veg",
            "image": "paratha.jpg",
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
            "image": "sawaiyan.jpg",
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
        }
    ]
}

def load_db():
    if not os.path.exists(DB_PATH):
        with open(DB_PATH, 'w') as f:
            json.dump(DEFAULT_MENU, f, indent=4)
        return DEFAULT_MENU
    try:
        with open(DB_PATH, 'r') as f:
            return json.load(f)
    except Exception:
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
