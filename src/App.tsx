import React, { useState, useEffect } from 'react';

// Interfaces
interface MenuItem {
  id: number;
  name: string;
  category: string;
  diet: string;
  image: string;
  fallbackImage?: string;
  description: string;
  price: number;
  available: boolean;
  hasSizes?: boolean;
  prices?: { half: number; full: number };
}

interface CartItem {
  name: string;
  price: number;
  qty: number;
  size?: 'half' | 'full';
  hasSizes?: boolean;
  prices?: { half: number; full: number };
}

const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5050' : 'https://YOUR_BACKEND_RENDER_URL_HERE.onrender.com');

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 1, name: "Chicken Biriyani", category: "biryani", diet: "nonveg", image: "biriyani.jpg", description: "Traditional Dum Chicken Biriyani of Bengal", price: 200, hasSizes: true, prices: { half: 150, full: 200 }, available: true },
  { id: 3, name: "Mutton Biriyani", category: "biryani", diet: "nonveg", image: "mutton.jpg", description: "Authentic Mutton Dum Biriyani of Bengal", price: 300, hasSizes: true, prices: { half: 220, full: 300 }, available: true },
  { id: 5, name: "Mutton Kasha", category: "curries", diet: "nonveg", image: "mutton.jpg", description: "5 pieces per plate", price: 280, available: true },
  { id: 6, name: "Chicken Kasha", category: "curries", diet: "nonveg", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80", fallbackImage: "mutton.jpg", description: "6 pieces per plate", price: 180, available: true },
  { id: 7, name: "Fish Curry", category: "curries", diet: "nonveg", image: "fish.jpg", description: "2 pieces per plate", price: 170, available: true },
  { id: 8, name: "Mixed Veg Curry", category: "curries", diet: "veg", image: "veg.jpg", description: "Per plate", price: 80, available: true },
  { id: 9, name: "Aloo Gobi Curry", category: "curries", diet: "veg", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80", fallbackImage: "veg.jpg", description: "Per plate", price: 80, available: true },
  { id: 10, name: "Bhindi Aloo Curry", category: "curries", diet: "veg", image: "https://images.unsplash.com/photo-1645177625150-fe803e0cae79?auto=format&fit=crop&w=600&q=80", fallbackImage: "veg.jpg", description: "Per plate", price: 80, available: true },
  { id: 11, name: "Patta Gobi Curry", category: "curries", diet: "veg", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80", fallbackImage: "veg.jpg", description: "Per plate", price: 80, available: true },
  { id: 12, name: "Chicken Pakora (Boneless)", category: "snacks", diet: "nonveg", image: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80", fallbackImage: "biriyani.jpg", description: "500 g", price: 400, available: true },
  { id: 13, name: "Paneer Masala", category: "curries", diet: "veg", image: "paneer.jpg", description: "Per plate", price: 110, available: true },
  { id: 14, name: "Choley Paneer Masala", category: "curries", diet: "veg", image: "paneer.jpg", description: "Per plate", price: 100, available: true },
  { id: 15, name: "Dhokla", category: "snacks", diet: "veg", image: "https://upload.wikimedia.org/wikipedia/commons/9/90/Khaman_dhokla.jpg", fallbackImage: "veg.jpg", description: "5 pcs", price: 50, available: true },
  { id: 16, name: "Prawn Curry", category: "curries", diet: "nonveg", image: "prawn.png", description: "Per plate", price: 130, available: true },
  { id: 17, name: "Plain Rice", category: "biryani", diet: "veg", image: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Steamed_rice_in_bowl_01.jpg", fallbackImage: "friedrice.jpg", description: "Per plate", price: 60, available: true },
  { id: 18, name: "Dal Pakora", category: "snacks", diet: "veg", image: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Onion_Pakora_01.jpg", fallbackImage: "veg.jpg", description: "500 g", price: 200, available: true },
  { id: 19, name: "Normal Paratha", category: "snacks", diet: "veg", image: "paratha.jpg", description: "Per piece", price: 20, available: true },
  { id: 20, name: "Laccha Paratha", category: "snacks", diet: "veg", image: "paratha.jpg", description: "Per piece", price: 30, available: true },
  { id: 21, name: "Gravy Sawaiyan", category: "sweets", diet: "veg", image: "sawaiyan.jpg", description: "Per plate", price: 70, available: true },
  { id: 22, name: "Dry Sawaiyan", category: "sweets", diet: "veg", image: "sawaiyan.jpg", description: "Per plate", price: 50, available: true }
];

export default function App() {
  const [currentView, setCurrentView] = useState<'customer' | 'admin'>('customer');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [dinnerMode, setDinnerMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Search and Filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Shopping Cart
  const [cart, setCart] = useState<{ [key: string]: CartItem }>({});
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Toast
  const [toastText, setToastText] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  // Slideshow
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const slideshowImages = [
    'biriyani.jpg',
    'mutton.jpg',
    'fish.jpg',
    'paneer.jpg',
    'friedrice.jpg',
    'sawaiyan.jpg',
    'veg.jpg'
  ];

  // Admin Dashboard States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [editedItems, setEditedItems] = useState<MenuItem[]>([]);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [announcement, setAnnouncement] = useState<string>('Welcome to Rumana\'s Kitchen! Authentic Bengali homemade delicacies prepared fresh from the heart.');
  const [editedAnnouncement, setEditedAnnouncement] = useState<string>('Welcome to Rumana\'s Kitchen! Authentic Bengali homemade delicacies prepared fresh from the heart.');

  // Fetch Menu from Backend
  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/menu`);
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data.items);
        setEditedItems(JSON.parse(JSON.stringify(data.items))); // Deep clone
        setDinnerMode(data.dinnerMode);
        const msg = data.announcement || 'Welcome to Rumana\'s Kitchen! Authentic Bengali homemade delicacies prepared fresh from the heart.';
        setAnnouncement(msg);
        setEditedAnnouncement(msg);
      } else {
        throw new Error("HTTP error " + res.status);
      }
    } catch (err) {
      console.error("Failed to fetch menu from Render backend: ", err);
      triggerToast("Connecting with menu failsafe...");
      // Local fallback for client-side demo
      const localData = localStorage.getItem('rumana_menu_backup');
      if (localData) {
        const data = JSON.parse(localData);
        setMenuItems(data.items);
        setEditedItems(JSON.parse(JSON.stringify(data.items)));
        setDinnerMode(data.dinnerMode);
        const msg = data.announcement || 'Welcome to Rumana\'s Kitchen! Authentic Bengali homemade delicacies prepared fresh from the heart.';
        setAnnouncement(msg);
        setEditedAnnouncement(msg);
      } else {
        setMenuItems(DEFAULT_MENU_ITEMS);
        setEditedItems(JSON.parse(JSON.stringify(DEFAULT_MENU_ITEMS)));
        setDinnerMode(false);
        const localAnnounce = localStorage.getItem('rumana_announcement_backup') || 'Welcome to Rumana\'s Kitchen! Authentic Bengali homemade delicacies prepared fresh from the heart.';
        setAnnouncement(localAnnounce);
        setEditedAnnouncement(localAnnounce);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
    // Auto-restore admin session if present
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAdminAuthenticated(true);
    }

    const handleRoutingChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (hash === '#admin' || path === '/admin' || path === '/admin/') {
        setCurrentView('admin');
      } else {
        setCurrentView('customer');
      }
    };

    handleRoutingChange();
    window.addEventListener('hashchange', handleRoutingChange);
    window.addEventListener('popstate', handleRoutingChange);
    return () => {
      window.removeEventListener('hashchange', handleRoutingChange);
      window.removeEventListener('popstate', handleRoutingChange);
    };
  }, []);

  // Ken Burns Slideshow Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slideshowImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (text: string) => {
    setToastText(text);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  // Add to Cart
  const addToCart = (name: string, price: number, hasSizes?: boolean, prices?: { half: number; full: number }) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[name]) {
        updated[name].qty += 1;
      } else {
        updated[name] = { 
          name, 
          price, 
          qty: 1,
          hasSizes,
          size: hasSizes ? 'full' : undefined,
          prices
        };
      }
      return updated;
    });
    triggerToast(`${name} added to cart!`);
  };

  // Update Cart Item Size
  const updateCartItemSize = (name: string, newSize: 'half' | 'full') => {
    setCart(prev => {
      const updated = { ...prev };
      const item = updated[name];
      if (item && item.prices) {
        item.size = newSize;
        item.price = item.prices[newSize];
      }
      return updated;
    });
  };

  // Change Quantity in Cart
  const changeQty = (name: string, amount: number) => {
    setCart(prev => {
      const updated = { ...prev };
      if (!updated[name]) return prev;
      updated[name].qty += amount;
      if (updated[name].qty <= 0) {
        delete updated[name];
      }
      return updated;
    });
  };

  // Cart helper quantities
  const totalCartCount = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  const totalCartPrice = Object.values(cart).reduce((sum, item) => sum + (item.price * item.qty), 0);

  // WhatsApp Order Checkouts
  const handleCheckout = () => {
    if (totalCartCount === 0) {
      triggerToast("Your cart is empty! Please add some dishes to your cart first.");
      return;
    }

    let messageText = "Hello Rumana's Kitchen! 🍽️\nI would like to place a custom homemade order:\n\n";
    Object.values(cart).forEach(item => {
      const itemTotal = item.price * item.qty;
      const displayName = item.hasSizes && item.size
        ? `${item.name} (${item.size === 'half' ? 'Half' : 'Full'})`
        : item.name;
      messageText += `• ${displayName} x ${item.qty} (₹${item.price} each) - ₹${itemTotal}\n`;
    });

    messageText += `\n💵 *Total Bill Amount:* ₹${totalCartPrice}\n`;
    messageText += `⏰ *Pickup Location:* Near Pine Block Veg Shop\n\n_Please confirm availability and pick-up timing._`;

    const encodedText = encodeURIComponent(messageText);
    const whatsappURL = `https://wa.me/918331810574?text=${encodedText}`;
    window.open(whatsappURL, '_blank');
  };

  // Copy UPI Address
  const handleCopyUpi = () => {
    navigator.clipboard.writeText("rumanafiroj91@oksbi").then(() => {
      triggerToast("UPI ID copied to clipboard!");
    });
  };

  // Admin Logins
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      if (res.ok) {
        const data = await res.json();
        setAdminToken(data.token);
        localStorage.setItem('admin_token', data.token);
        setIsAdminAuthenticated(true);
        setPasswordInput('');
      } else {
        setAuthError('Incorrect password. Please try again.');
      }
    } catch (err) {
      // Local fallback for offline/preview testing
      if (passwordInput === 'rumana123') {
        setAdminToken('rumana123');
        localStorage.setItem('admin_token', 'rumana123');
        setIsAdminAuthenticated(true);
        setPasswordInput('');
      } else {
        setAuthError('Authentication server offline. Try password "rumana123".');
      }
    }
  };

  // Admin Logouts
  const handleAdminLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAdminAuthenticated(false);
    setAdminToken('');
  };

  // Dinner Mode API Switch
  const handleToggleDinnerMode = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/menu/toggle-dinner`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDinnerMode(data.dinnerMode);
        triggerToast(`Dinner Mode set to ${data.dinnerMode ? 'ON' : 'OFF'}`);
      }
    } catch (err) {
      // Offline edit fallback
      const updatedDinnerMode = !dinnerMode;
      setDinnerMode(updatedDinnerMode);
      // Backup state in localStorage
      const backupData = { dinnerMode: updatedDinnerMode, items: menuItems };
      localStorage.setItem('rumana_menu_backup', JSON.stringify(backupData));
      triggerToast(`Local Toggle: Dinner Mode ${updatedDinnerMode ? 'ON' : 'OFF'}`);
    }
  };

  const handleSaveChanges = async () => {
    setSaveStatus('Saving changes...');
    try {
      const res = await fetch(`${API_BASE}/api/menu/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dinnerMode,
          announcement: editedAnnouncement,
          items: editedItems
        })
      });
      if (res.ok) {
        setMenuItems(JSON.parse(JSON.stringify(editedItems)));
        setAnnouncement(editedAnnouncement);
        setSaveStatus('Changes saved and published successfully!');
        triggerToast("Menu updated successfully!");
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('Error saving changes. Server responded with error.');
      }
    } catch (err) {
      // Local backup fallback
      setMenuItems(JSON.parse(JSON.stringify(editedItems)));
      setAnnouncement(editedAnnouncement);
      const backupData = { dinnerMode, announcement: editedAnnouncement, items: editedItems };
      localStorage.setItem('rumana_menu_backup', JSON.stringify(backupData));
      localStorage.setItem('rumana_announcement_backup', editedAnnouncement);
      setSaveStatus('Server offline. Changes saved locally in your browser.');
      triggerToast("Changes saved locally.");
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Update item field in edited list
  const handleEditItemField = (id: number, field: keyof MenuItem, value: any) => {
    setEditedItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const setAllAvailability = (status: boolean) => {
    setEditedItems(prev => prev.map(item => ({ ...item, available: status })));
    triggerToast(status ? "All items set to Available" : "All items set to Sold Out");
  };

  const navigateToHome = () => {
    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/') {
      window.history.pushState({}, '', '/');
      // Trigger manual state updates since pushState doesn't trigger popstate automatically
      setCurrentView('customer');
    } else {
      window.location.hash = '';
    }
  };

  // Filter Logic
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
    const fitsDinnerMode = !dinnerMode || item.name.toLowerCase().includes('biriyani');
    return matchesSearch && matchesFilter && fitsDinnerMode;
  });

  return (
    <div>
      {/* Dynamic Nav Header */}
      <nav style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        background: 'rgba(255, 253, 251, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(158, 42, 43, 0.1)',
        zIndex: 100,
        padding: '12px 5%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.25rem', cursor: 'pointer' }} onClick={navigateToHome}>
          🍳 Rumana's Kitchen
        </div>
        <div>
          {currentView === 'admin' && (
            <button className="btn-secondary" onClick={navigateToHome}>
              🍽️ Back to Menu
            </button>
          )}
        </div>
      </nav>

      <div style={{ paddingTop: '60px' }}>
        {currentView === 'customer' ? (
          /* =======================================================================
             CUSTOMER INTERFACE VIEW
             ======================================================================= */
          <div>
            {/* Hero Slider banner */}
            <header>
              <div className="hero-slideshow-container">
                {slideshowImages.map((img, index) => (
                  <div
                    key={index}
                    className={`slide ${index === currentSlide ? 'active' : ''}`}
                    style={{ backgroundImage: `url(${img})` }}
                  />
                ))}
              </div>
              <div className="hero-overlay"></div>
              <div className="hero-content">
                <span className="hero-badge">Fresh • Homemade • Delicious</span>
                <h1 className="hero-title">Rumana's Kitchen</h1>
                <p className="hero-subtitle">
                  {dinnerMode
                    ? "Dinner Special: Fresh authentic Biriyani straight from our Bengal-Sundarbans pots!"
                    : "Bringing the authentic flavours of Minakhan, where Bengal meets the Sundarbans."}
                </p>
                <div className="hero-details">
                  <div className="hero-detail-item">
                    <span>📍</span> Pickup near Pine Block
                  </div>
                  <div className="hero-detail-item">
                    <span>🍱</span> Home Cooked with Love
                  </div>
                </div>
                <a href="#menu" className="btn-primary">Explore Menu</a>
              </div>
            </header>

            {/* Menu Section */}
            <section id="menu">
              <div className="section-header" style={{ marginBottom: '20px' }}>
                <span className="section-subtitle">
                  {dinnerMode ? "Dinner Special Menu" : "Specially Curated"}
                </span>
                <h2 className="section-title">
                  {dinnerMode ? "Biriyani Specialties Only" : "Our Culinary Menu"}
                </h2>
              </div>

              {/* Centered Available counter */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '25px'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(43, 147, 72, 0.1)',
                  color: '#2b9348',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 700
                }}>
                  <div className="pulse-dot" />
                  {dinnerMode
                    ? `${menuItems.filter(item => item.available && item.name.toLowerCase().includes('biriyani')).length} Biriyani Specialties Online`
                    : `${menuItems.filter(item => item.available).length} / ${menuItems.length} Dishes Available Today`
                  }
                </div>
              </div>

              {/* Dynamic Scrolling Announcement Banner */}
              {announcement && (
                <div style={{
                  background: '#ffffff',
                  color: 'var(--text)',
                  border: '1px solid rgba(158, 42, 43, 0.18)',
                  padding: '10px 0',
                  fontWeight: 600,
                  fontSize: '14px',
                  overflow: 'hidden',
                  position: 'relative',
                  width: '100%',
                  borderRadius: '30px',
                  boxShadow: '0 4px 12px rgba(158, 42, 43, 0.05)',
                  marginBottom: '35px'
                }}>
                  <div className="scrolling-marquee">
                    <span>📢 {announcement}</span>
                  </div>
                </div>
              )}

              {/* Filter controls (hide if Dinner Mode forces Biriyani only) */}
              {!dinnerMode && (
                <div className="menu-controls">
                  <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search for your favorite dish..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="filter-tabs">
                    {[
                      { id: 'all', label: 'All Specialties' },
                      { id: 'biryani', label: 'Biryani & Rice' },
                      { id: 'curries', label: 'Rich Curries' },
                      { id: 'snacks', label: 'Crunchy Snacks' },
                      { id: 'sweets', label: 'Desserts & Sweets' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        className={`filter-btn ${activeFilter === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveFilter(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid cards */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                  Loading delicious menu items...
                </div>
              ) : (
                <div className="menu-grid">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      className="card"
                      data-available={item.available ? "true" : "false"}
                    >
                      <div className="card-image-container">
                        <div className="card-badges">
                          <span className={`badge ${item.diet === 'veg' ? 'badge-veg' : 'badge-nonveg'}`}>
                            {item.diet === 'veg' ? 'Veg' : 'Non-Veg'}
                          </span>
                          <span className="badge badge-category">
                            {item.category}
                          </span>
                          <span className={`badge ${item.available ? 'badge-available' : 'badge-unavailable'}`}>
                            {item.available ? '✅ Available' : '❌ Not Available'}
                          </span>
                        </div>
                        <img
                          className="card-img"
                          src={item.image}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (item.fallbackImage) {
                              target.src = item.fallbackImage;
                            } else {
                              target.src = 'veg.jpg';
                            }
                          }}
                          alt={item.name}
                        />
                      </div>
                      <div className="card-body">
                        <h3 className="card-title">{item.name}</h3>
                        <p className="card-desc">{item.description}</p>
                        
                        <div className="card-footer">
                          <div className="card-price">
                            {item.hasSizes && item.prices 
                              ? `${item.prices.half} - ₹${item.prices.full}` 
                              : item.price
                            }
                          </div>
                          {item.available && (
                            <button
                              className="add-to-cart-btn"
                              onClick={() => addToCart(item.name, item.price, item.hasSizes, item.prices)}
                            >
                              +
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredItems.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No items match your search. Try adjusting filters or search term!
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* About Us */}
            <section id="about" style={{ background: 'transparent' }}>
              <div className="about-container">
                <div className="about-img-frame">
                  <img className="about-img" src="veg.jpg" alt="Rumana cooking" />
                </div>
                <div>
                  <span className="about-badge">Our Story</span>
                  <h2 className="about-title">Flavors Prepared Directly from the Heart</h2>
                  <p className="about-text">
                    At Rumana's Kitchen, we believe that food is a celebration of local values. Every dish is cooked with carefully chosen fresh ingredients, native recipes, and a gentle homemade touch.
                    <br /><br />
                    We bring you authentic Minakhan spice layers, aromatic biryanis, slow-roasted rich curries, and traditional snacks. From our kitchen to your table, we promise pure hygiene, authenticity, and unforgettable taste.
                  </p>
                </div>
              </div>
            </section>

            {/* How It Works & Payment Info */}
            <section id="payment">
              <div className="section-header">
                <span className="section-subtitle">How It Works</span>
                <h2 className="section-title">Order Concierge & Payment</h2>
              </div>

              <div className="service-grid">
                <div className="concierge-card">
                  <div className="card-icon">📲</div>
                  <h3>WhatsApp Orders Only</h3>
                  <p className="about-text" style={{ marginBottom: '15px' }}>
                    All orders are strictly prepared on prior reservation. We accept slots based on the schedule below.
                  </p>
                  <div className="timeline-container">
                    <div className="timeline-node">
                      <div className="timeline-time">☀️ LUNCH SLOTS</div>
                      <div className="timeline-title">Reserve Previous Day: 10:00 PM – 11:00 PM</div>
                    </div>
                    <div className="timeline-node">
                      <div className="timeline-time">🌙 DINNER SLOTS</div>
                      <div className="timeline-title">Reserve Same Day: 10:00 AM – 11:00 AM</div>
                    </div>
                  </div>
                  <p className="about-text" style={{ fontSize: '14px', marginTop: '10px' }}>
                    ⚡ Confirmations are completed on WhatsApp only after receipt of payment screenshot.<br />
                    📍 Strict Pickup Only: Near Pine Block Veg Shop. (No Home Delivery).<br />
                    📧 Email: <a href="mailto:rizwangazi2018@gmail.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>rizwangazi2018@gmail.com</a>
                  </p>
                  <button onClick={handleCheckout} className="btn-whatsapp">
                    💬 Open Chat & Order
                  </button>
                </div>

                <div className="payment-card">
                  <div className="card-icon">💳</div>
                  <h3>Secure UPI Payment</h3>
                  <p className="about-text">Scan the QR using any UPI app (GPay, PhonePe, Paytm, etc.)</p>
                  <div className="qr-container">
                    <img className="qr-image" src="upi_qr.png" alt="UPI Payment QR" />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>UPI Address</span>
                  <div className="upi-box">
                    <span className="upi-id" id="upiId">rumanafiroj91@oksbi</span>
                    <button className="copy-btn" onClick={handleCopyUpi} title="Copy Address">📋</button>
                  </div>
                  <p className="about-text" style={{ fontSize: '13px', marginTop: '20px', fontStyle: 'italic' }}>
                    📸 Please take a snapshot of the completed transaction page and send it via WhatsApp to confirm the order.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer>
              <h2 className="footer-logo">Rumana's Kitchen</h2>
              <p className="footer-text">Made with pure love, cleanliness, and the finest local ingredients. Relishing your beautiful moments with taste.</p>
              <hr className="footer-divider" />
              <p className="footer-copy">© 2026 Rumana's Kitchen. All Rights Reserved.</p>
            </footer>

            {/* Shopping Cart Drawer */}
            <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`} id="cartDrawer">
              <div className="cart-header">
                <span className="cart-drawer-title">🛒 Your Selected Delicacies</span>
                <button className="cart-close" onClick={() => setIsCartOpen(false)}>✕</button>
              </div>
              <div className="cart-items" id="cartItems">
                {Object.values(cart).map(item => (
                  <div key={item.name} className="cart-item">
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-price">₹{item.price} each</span>
                      
                      {item.hasSizes && item.prices && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                          {(['half', 'full'] as const).map(sz => {
                            const isActive = item.size === sz;
                            return (
                              <button
                                key={sz}
                                onClick={() => updateCartItemSize(item.name, sz)}
                                style={{
                                  border: isActive ? '1px solid var(--primary)' : '1px solid rgba(158, 42, 43, 0.18)',
                                  background: isActive ? 'var(--primary)' : 'transparent',
                                  color: isActive ? 'white' : 'var(--text)',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  cursor: 'pointer',
                                  textTransform: 'capitalize',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="cart-item-qty">
                      <button className="qty-btn" onClick={() => changeQty(item.name, -1)}>-</button>
                      <span className="qty-num">{item.qty}</span>
                      <button className="qty-btn" onClick={() => changeQty(item.name, 1)}>+</button>
                    </div>
                  </div>
                ))}
                {totalCartCount === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Your cart is empty. Add some delicacies!
                  </div>
                )}
              </div>
              <div className="cart-footer-btn-container">
                <div className="cart-total-info">
                  <span className="cart-total-label">Total Payable</span>
                  <span className="cart-total-amount" id="cartTotal">₹{totalCartPrice}</span>
                </div>
                <button className="cart-checkout-btn" onClick={handleCheckout} disabled={totalCartCount === 0}>
                  💬 Order via WhatsApp
                </button>
              </div>
            </div>

            {/* Floating cart trigger */}
            {totalCartCount > 0 && (
              <div className="cart-badge" id="cartBadge" onClick={() => setIsCartOpen(true)}>
                <span>🛒</span>
                <div className="cart-badge-count" id="cartCount">{totalCartCount}</div>
              </div>
            )}
          </div>
        ) : (
          /* =======================================================================
             ADMIN INTERFACE PANEL
             ======================================================================= */
          <div className="admin-container">
            {!isAdminAuthenticated ? (
              /* Admin Login Form */
              <div className="admin-login-card">
                <div className="card-icon" style={{ fontSize: '3rem' }}>🔐</div>
                <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Admin Login</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '30px' }}>
                  Enter password to access Management Console
                </p>
                <form onSubmit={handleAdminLogin}>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      required
                    />
                  </div>
                  {authError && (
                    <div style={{ color: 'var(--primary)', fontSize: '13px', marginBottom: '20px', fontWeight: 600 }}>
                      ❌ {authError}
                    </div>
                  )}
                  <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                    Verify & Access
                  </button>
                </form>
              </div>
            ) : (
              /* Authenticated Admin Dashboard */
              <div>
                <div className="admin-header">
                  <div className="admin-title-desc">
                    <h2 style={{ color: 'var(--primary)' }}>Kitchen Management Console</h2>
                    <span className="admin-subtitle">Add, edit, or toggle items on the customer menu.</span>
                  </div>
                  <div className="admin-controls">
                    <button className="btn-secondary" onClick={handleAdminLogout}>
                      🚪 Logout
                    </button>
                    <button className="btn-primary" onClick={handleSaveChanges}>
                      🚀 Publish Changes
                    </button>
                  </div>
                </div>

                {saveStatus && (
                  <div style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    background: saveStatus.includes('successfully') ? '#e8f5e9' : '#ffebee',
                    color: saveStatus.includes('successfully') ? '#2e7d32' : '#c62828',
                    marginBottom: '20px',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}>
                    {saveStatus}
                  </div>
                )}

                {/* Global Toggle for Dinner Mode */}
                <div className="dinner-toggle-banner">
                  <div className="dinner-banner-text">
                    <h3>🌙 Dinner Mode (Biriyani Only)</h3>
                    <p>When enabled, all customer categories and items are hidden, showing ONLY Chicken and Mutton Biriyani specialties.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="toggle-label">{dinnerMode ? 'ACTIVE (Biriyani Only)' : 'INACTIVE (Full Menu)'}</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={dinnerMode}
                        onChange={handleToggleDinnerMode}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                {/* Dynamic Announcement Setting */}
                <div className="dinner-toggle-banner" style={{ marginTop: '20px', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                  <div className="dinner-banner-text" style={{ width: '100%' }}>
                    <h3>📢 Dynamic Scrolling Announcement Message</h3>
                    <p>Type your message below. It will scroll dynamically at the top of the customer's explore menu. (Leave blank to hide).</p>
                  </div>
                  <textarea
                    className="form-input"
                    style={{ width: '100%', minHeight: '60px', padding: '10px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' }}
                    placeholder="E.g., Sunday Special Dhokla is available today! Place your orders before 12 PM."
                    value={editedAnnouncement}
                    onChange={(e) => setEditedAnnouncement(e.target.value)}
                  />
                </div>

                {/* Items Admin List */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(158, 42, 43, 0.1)', paddingBottom: '10px' }}>
                  <h3 style={{ color: 'var(--primary)', margin: 0 }}>Food Catalog ({editedItems.length} items)</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => setAllAvailability(true)}>
                      ✅ Mark All Available
                    </button>
                    <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', borderColor: '#c1121f', color: '#c1121f' }} onClick={() => setAllAvailability(false)}>
                      ❌ Mark All Sold Out
                    </button>
                  </div>
                </div>
                <div className="admin-grid">
                  {editedItems.map(item => (
                    <div key={item.id} className="admin-card">
                      <div className="admin-card-info">
                        <img
                          className="admin-card-img"
                          src={item.image}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (item.fallbackImage) {
                              target.src = item.fallbackImage;
                            } else {
                              target.src = 'veg.jpg';
                            }
                          }}
                          alt={item.name}
                        />
                        <div className="admin-card-details">
                          <div className="admin-card-name">{item.name}</div>
                          <div className="admin-card-meta">
                            Category: <strong style={{ textTransform: 'capitalize' }}>{item.category}</strong> | Price: <strong>₹{item.price}</strong> | Status: <strong style={{ color: item.available ? '#2e7d32' : '#c62828' }}>{item.available ? 'Available' : 'Sold Out'}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="admin-card-actions">
                        <div className="admin-card-inputs">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label className="form-label" style={{ fontSize: '11px', marginBottom: 0 }}>Item Name</label>
                            <input
                              type="text"
                              className="form-input input-name"
                              value={item.name}
                              onChange={(e) => handleEditItemField(item.id, 'name', e.target.value)}
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label className="form-label" style={{ fontSize: '11px', marginBottom: 0 }}>Price (₹)</label>
                            <input
                              type="number"
                              className="form-input input-price"
                              value={item.price}
                              onChange={(e) => handleEditItemField(item.id, 'price', parseInt(e.target.value) || 0)}
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label className="form-label" style={{ fontSize: '11px', marginBottom: 0 }}>Description / Qty</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ width: '220px' }}
                              value={item.description}
                              onChange={(e) => handleEditItemField(item.id, 'description', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Availability Toggle */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span className="toggle-label" style={{ fontSize: '10px' }}>In Stock</span>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={item.available}
                              onChange={(e) => handleEditItemField(item.id, 'available', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Toast Notification */}
      <div className={`toast ${showToast ? 'show' : ''}`} id="toast">
        {toastText}
      </div>
    </div>
  );
}
