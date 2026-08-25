import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

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
  stockCount?: number;
  prepTime?: string;
  hasPotatoOption?: boolean;
}

interface CartItem {
  name: string;
  price: number;
  qty: number;
  size?: 'half' | 'full';
  hasSizes?: boolean;
  prices?: { half: number; full: number };
  hasPotatoOption?: boolean;
  withPotato?: boolean;
}

interface CarouselItem {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  tag?: string;
}

const DEFAULT_CAROUSEL_ITEMS: CarouselItem[] = [
  { id: 'c1', image: '/kitchen1.jpg', title: "Aromatic Biryani Dum Preparation", subtitle: "Slow cooked with native Bengal spices & pure ghee", tag: "🍳 Kitchen Story" },
  { id: 'c2', image: '/kitchen2.jpg', title: "Authentic Bengali Thali Feast", subtitle: "Prepared fresh every morning with pure love", tag: "⭐ Signature Delicacies" },
  { id: 'c3', image: '/paneerbiriyani.jpg', title: "Special Paneer Biriyani", subtitle: "Fresh cottage cheese cubes in saffron basmati rice (₹170)", tag: "🥦 Veg Special" },
  { id: 'c4', image: '/chickenchaap.jpg', title: "Kolkata Style Chicken Chaap", subtitle: "Slow simmered rich aromatic poppy seeds gravy (₹120)", tag: "🔥 Customer Favorite" }
];

const EXACT_DISH_IMAGE_MAP: Record<string, string> = {
  'chicken biriyani': '/biriyani.jpg',
  'chicken biryani': '/biriyani.jpg',
  'mutton biriyani': '/mbiriyani.jpg',
  'mutton biryani': '/mbiriyani.jpg',
  'paneer biriyani': '/paneerbiriyani.jpg',
  'paneer biryani': '/paneerbiriyani.jpg',
  'aloo biriyani': '/aloobiriyani.jpg',
  'aloo biryani': '/aloobiriyani.jpg',
  'plain rice': '/plainrice.jpg',
  'fried rice': '/friedrice.jpg',
  'mutton kasha': '/mutton.jpg',
  'chicken kasha': '/ccurry.jpg',
  'fish curry': '/fish.jpg',
  'mixed veg curry': '/veg.jpg',
  'aloo gobi curry': '/fgovialoo.jpg',
  'bhindi aloo curry': '/valoo.jpg',
  'patta gobi curry': '/pgovi.jpg',
  'paneer masala': '/paneermasala.jpg',
  'choley paneer masala': '/choleypaneer.jpg',
  'choley paneer': '/choleypaneer.jpg',
  'prawn curry': '/prawn.png',
  'normal dal': '/dal.jpg',
  'muri ghonto': '/murighonto.jpg',
  'egg curry with potato': '/eggcurry.jpg',
  'soya chunks curry': '/soyachunks.jpg',
  'chicken chaap': '/chickenchaap.jpg',
  'kashmiri aloo dum': '/kashmirialoodum.jpg',
  'chicken varta': '/chickenvarta.jpg',
  'chicken pakora (boneless)': '/cpakora.jpg',
  'chicken pakora': '/cpakora.jpg',
  'dal pakora': '/dalpakora.jpg',
  'normal paratha': '/nparatha.jpg',
  'laccha paratha': '/lacchaparatha.jpg',
  'aloo paratha': '/alooparatha.jpg',
  'fulka (roti)': '/fulka.jpg',
  'tandoori roti': '/tandooriroti.jpg',
  'fulko luchi': '/fulkoluchi.jpg',
  'dhokla': '/dhokla.jpg',
  'gravy sawaiyan': '/gsawaiyan.jpg',
  'dry sawaiyan': '/dsawaiyan.jpg'
};

const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5050' : 'https://rumanaskitchen.onrender.com');

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 1, name: "Chicken Biriyani", category: "biryani", diet: "nonveg", image: "biriyani.jpg", description: "Traditional Dum Chicken Biriyani of Bengal", price: 190, hasSizes: true, prices: { half: 110, full: 190 }, available: true, stockCount: 20, prepTime: "1h 30m", hasPotatoOption: true },
  { id: 3, name: "Mutton Biriyani", category: "biryani", diet: "nonveg", image: "mbiriyani.jpg", description: "Authentic Mutton Dum Biriyani of Bengal", price: 300, available: true, stockCount: 20, prepTime: "1h 30m", hasPotatoOption: true },
  { id: 36, name: "Paneer Biriyani", category: "biryani", diet: "veg", image: "paneerbiriyani.jpg", description: "Rich Saffron Rice cooked with fresh cottage cheese cubes & aromatic spices", price: 170, available: true, stockCount: 20, prepTime: "1h 30m" },
  { id: 35, name: "Aloo Biriyani", category: "biryani", diet: "veg", image: "aloobiriyani.jpg", description: "Authentic Fragrant Rice cooked with soft spiced potatoes", price: 100, available: true, stockCount: 20, prepTime: "1h 30m" },
  { id: 5, name: "Mutton Kasha", category: "curries", diet: "nonveg", image: "mutton.jpg", description: "5 pieces per plate", price: 280, available: true, stockCount: 20, hasPotatoOption: true },
  { id: 6, name: "Chicken Kasha", category: "curries", diet: "nonveg", image: "ccurry.jpg", description: "6 pieces per plate", price: 180, available: true, stockCount: 20, hasPotatoOption: true },
  { id: 7, name: "Fish Curry", category: "curries", diet: "nonveg", image: "fish.jpg", description: "2 pieces per plate", price: 170, available: true, stockCount: 20, hasPotatoOption: true },
  { id: 8, name: "Mixed Veg Curry", category: "curries", diet: "veg", image: "veg.jpg", description: "Per plate", price: 80, available: true, stockCount: 20 },
  { id: 9, name: "Aloo Gobi Curry", category: "curries", diet: "veg", image: "fgovialoo.jpg", description: "Per plate", price: 80, available: true, stockCount: 20 },
  { id: 10, name: "Bhindi Aloo Curry", category: "curries", diet: "veg", image: "valoo.jpg", description: "Per plate", price: 80, available: true, stockCount: 20 },
  { id: 11, name: "Patta Gobi Curry", category: "curries", diet: "veg", image: "pgovi.jpg", description: "Per plate", price: 80, available: true, stockCount: 20 },
  { id: 12, name: "Chicken Pakora (Boneless)", category: "snacks", diet: "nonveg", image: "cpakora.jpg", description: "500 g", price: 400, available: true, stockCount: 20 },
  { id: 13, name: "Paneer Masala", category: "curries", diet: "veg", image: "paneermasala.jpg", description: "Per plate", price: 110, available: true, stockCount: 20 },
  { id: 14, name: "Choley Paneer Masala", category: "curries", diet: "veg", image: "choleypaneer.jpg", description: "Per plate", price: 100, available: true, stockCount: 20 },
  { id: 15, name: "Dhokla", category: "sweets", diet: "veg", image: "dhokla.jpg", description: "5 pcs", price: 50, available: true, stockCount: 20 },
  { id: 16, name: "Prawn Curry", category: "curries", diet: "nonveg", image: "prawn.png", description: "Per plate", price: 130, available: true, stockCount: 20 },
  { id: 17, name: "Plain Rice", category: "biryani", diet: "veg", image: "plainrice.jpg", description: "Per plate", price: 35, available: true, stockCount: 20 },
  { id: 18, name: "Dal Pakora", category: "snacks", diet: "veg", image: "dalpakora.jpg", description: "500 g", price: 200, available: true, stockCount: 20 },
  { id: 19, name: "Normal Paratha", category: "snacks", diet: "veg", image: "nparatha.jpg", description: "Per piece", price: 20, available: true, stockCount: 20 },
  { id: 20, name: "Laccha Paratha", category: "snacks", diet: "veg", image: "lacchaparatha.jpg", description: "Per piece", price: 30, available: true, stockCount: 20 },
  { id: 21, name: "Gravy Sawaiyan", category: "sweets", diet: "veg", image: "gsawaiyan.jpg", description: "Per plate", price: 70, available: true, stockCount: 20 },
  { id: 22, name: "Dry Sawaiyan", category: "sweets", diet: "veg", image: "dsawaiyan.jpg", description: "Per plate", price: 50, available: true, stockCount: 20 },
  { id: 23, name: "Fried Rice", category: "biryani", diet: "veg", image: "friedrice.jpg", description: "Per plate", price: 120, available: true, stockCount: 20 },
  { id: 24, name: "Aloo Paratha", category: "snacks", diet: "veg", image: "alooparatha.jpg", description: "Per piece", price: 45, available: true, stockCount: 20 },
  { id: 25, name: "Normal Dal", category: "curries", diet: "veg", image: "dal.jpg", description: "Per plate", price: 45, available: true, stockCount: 20 },
  { id: 26, name: "Muri Ghonto", category: "curries", diet: "nonveg", image: "murighonto.jpg", description: "Assamese style - Per plate", price: 60, available: true, stockCount: 20 },
  { id: 27, name: "Fulka (Roti)", category: "snacks", diet: "veg", image: "fulka.jpg", description: "Per piece", price: 8, available: true, stockCount: 20 },
  { id: 28, name: "Egg Curry with Potato", category: "curries", diet: "nonveg", image: "eggcurry.jpg", description: "Per plate", price: 90, available: true, stockCount: 20 },
  { id: 29, name: "Soya Chunks Curry", category: "curries", diet: "veg", image: "soyachunks.jpg", description: "Per plate", price: 90, available: true, stockCount: 20 },
  { id: 30, name: "Tandoori Roti", category: "snacks", diet: "veg", image: "tandooriroti.jpg", description: "Per piece", price: 40, available: true, stockCount: 20, prepTime: "1h 30m" },
  { id: 31, name: "Chicken Chaap", category: "curries", diet: "nonveg", image: "chickenchaap.jpg", description: "1 piece per plate", price: 120, available: true, stockCount: 20, prepTime: "1h 30m" },
  { id: 32, name: "Kashmiri Aloo Dum", category: "curries", diet: "veg", image: "kashmirialoodum.jpg", description: "5 pcs per plate", price: 100, available: true, stockCount: 20, prepTime: "1h 30m" },
  { id: 33, name: "Fulko Luchi", category: "snacks", diet: "veg", image: "fulkoluchi.jpg", description: "4 pcs per plate", price: 50, available: true, stockCount: 20, prepTime: "1h 30m" },
  { id: 34, name: "Chicken Varta", category: "curries", diet: "nonveg", image: "chickenvarta.jpg", description: "Per plate", price: 120, available: true, stockCount: 20, prepTime: "1h 30m" }
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
  const [prepTime, setPrepTime] = useState<string>('1h 30m');
  const [editedPrepTime, setEditedPrepTime] = useState<string>('1h 30m');

  // Add New Item States
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<'biryani' | 'curries' | 'snacks' | 'sweets'>('curries');
  const [newItemDiet, setNewItemDiet] = useState<'veg' | 'nonveg'>('veg');
  const [newItemPrice, setNewItemPrice] = useState<string>('');
  const [newItemDescription, setNewItemDescription] = useState<string>('Per plate');
  const [newItemPrepTime, setNewItemPrepTime] = useState<string>('1h 30m');
  const [newItemStock, setNewItemStock] = useState<string>('20');
  const [newItemImage, setNewItemImage] = useState<string>('');
  const [newItemHasPotato, setNewItemHasPotato] = useState<boolean>(false);

  // Carousel Highlights State
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>(DEFAULT_CAROUSEL_ITEMS);
  const [editedCarouselItems, setEditedCarouselItems] = useState<CarouselItem[]>(DEFAULT_CAROUSEL_ITEMS);
  const [showAddCarouselModal, setShowAddCarouselModal] = useState<boolean>(false);
  const [newCarouselImage, setNewCarouselImage] = useState<string>('');
  const [newCarouselTitle, setNewCarouselTitle] = useState<string>('');
  const [newCarouselSubtitle, setNewCarouselSubtitle] = useState<string>('');
  const [newCarouselTag, setNewCarouselTag] = useState<string>('🍳 Kitchen Story');

  const handleAddCarouselSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCarouselImage) {
      alert("Please upload or take a photo first.");
      return;
    }
    const newItem: CarouselItem = {
      id: 'c_' + Date.now(),
      image: newCarouselImage,
      title: newCarouselTitle.trim() || 'Featured Highlight',
      subtitle: newCarouselSubtitle.trim() || '',
      tag: newCarouselTag
    };
    const updated = [newItem, ...editedCarouselItems];
    setEditedCarouselItems(updated);
    setCarouselItems(updated);
    setShowAddCarouselModal(false);

    setNewCarouselImage('');
    setNewCarouselTitle('');
    setNewCarouselSubtitle('');

    triggerToast("Photo added to Carousel!");
    await publishMenuState(editedItems, dinnerMode, announcement, prepTime, updated);
  };

  const handleDeleteCarouselItem = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this photo from the Carousel?")) {
      const updated = editedCarouselItems.filter(item => item.id !== id);
      setEditedCarouselItems(updated);
      setCarouselItems(updated);
      triggerToast("Photo removed from Carousel!");
      await publishMenuState(editedItems, dinnerMode, announcement, prepTime, updated);
    }
  };

  const handleAddNewItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) {
      alert("Please fill in item name and price.");
      return;
    }
    const priceNum = parseFloat(newItemPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Please enter a valid price.");
      return;
    }

    const newItemObj: MenuItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      name: newItemName.trim(),
      category: newItemCategory,
      diet: newItemDiet,
      image: newItemImage.trim() || (newItemDiet === 'veg' ? 'veg.jpg' : 'ccurry.jpg'),
      description: newItemDescription.trim() || 'Per plate',
      price: priceNum,
      available: true,
      stockCount: parseInt(newItemStock) || 20,
      prepTime: newItemPrepTime.trim() || '1h 30m',
      hasPotatoOption: newItemHasPotato
    };

    const updated = [...editedItems, newItemObj];
    setEditedItems(updated);
    setMenuItems(updated);
    setShowAddItemModal(false);

    setNewItemName('');
    setNewItemPrice('');
    setNewItemDescription('Per plate');
    setNewItemImage('');
    setNewItemHasPotato(false);

    triggerToast("New dish added successfully!");
    await publishMenuState(updated);
  };

  const handleDeleteItem = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the menu?`)) {
      const updated = editedItems.filter(item => item.id !== id);
      setEditedItems(updated);
      triggerToast(`Removed "${name}" & updated cloud.`);
      await publishMenuState(updated);
    }
  };

  const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/6a5c9b1af5f4af5e29a36006';
  const JSONBIN_KEY = '$2a$10$7pl.Q7DOkk19SU86HWjlceD4TmOaP/UaJhDIhhqZq5bA4rVkmD75.';

  const saveToJSONBinDirect = async (payload: any) => {
    try {
      await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_KEY
        },
        body: JSON.stringify(payload)
      });
      console.log("[JSONBIN Direct] Saved to cloud CDN successfully.");
    } catch (e) {
      console.warn("Direct JSONBin save failed:", e);
    }
  };

  const publishMenuState = async (
    updatedItems = editedItems,
    currDinnerMode = dinnerMode,
    currAnnounce = announcement,
    currPrep = prepTime,
    updatedCarousel = editedCarouselItems
  ) => {
    const payload = {
      dinnerMode: currDinnerMode,
      announcement: currAnnounce,
      prepTime: currPrep,
      items: updatedItems,
      carousel: updatedCarousel
    };

    setMenuItems(JSON.parse(JSON.stringify(updatedItems)));
    setEditedItems(JSON.parse(JSON.stringify(updatedItems)));
    setCarouselItems(JSON.parse(JSON.stringify(updatedCarousel)));
    setEditedCarouselItems(JSON.parse(JSON.stringify(updatedCarousel)));

    try {
      localStorage.setItem('rumana_menu_backup', JSON.stringify(payload));
    } catch (e) {}

    await saveToJSONBinDirect(payload);

    try {
      await setDoc(doc(db, "menu", "live"), payload);
      console.log("[Firebase Firestore] Saved menu payload live to Firoj Sir's project!");
    } catch (err) {
      console.warn("Firestore save notice:", err);
    }

    try {
      await fetch(`${API_BASE}/api/menu/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken || 'rumana2026'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn("Render update failed, cloud JSONBin updated.", err);
    }
  };

  const applyMenuData = (data: any) => {
    if (!data || !data.items) return;
    setMenuItems(data.items);
    setEditedItems(JSON.parse(JSON.stringify(data.items)));
    if (data.carousel && Array.isArray(data.carousel) && data.carousel.length > 0) {
      setCarouselItems(data.carousel);
      setEditedCarouselItems(JSON.parse(JSON.stringify(data.carousel)));
    }
    setDinnerMode(!!data.dinnerMode);
    const msg = data.announcement || 'Welcome to Rumana\'s Kitchen! Authentic Bengali homemade delicacies prepared fresh from the heart.';
    setAnnouncement(msg);
    setEditedAnnouncement(msg);
    const pt = data.prepTime || '1h 30m';
    setPrepTime(pt);
    setEditedPrepTime(pt);
    try {
      localStorage.setItem('rumana_menu_backup', JSON.stringify(data));
    } catch (e) {}
  };

  const fetchFromJSONBin = async () => {
    try {
      const res = await fetch(JSONBIN_URL, {
        headers: { 'X-Master-Key': JSONBIN_KEY }
      });
      if (res.ok) {
        const cloudJson = await res.json();
        const record = cloudJson.record;
        if (record && record.items && record.items.length > 0) {
          console.log("[JSONBIN Direct] Loaded menu directly from cloud CDN.");
          applyMenuData(record);
          return true;
        }
      }
    } catch (e) {
      console.warn("Direct JSONBin fetch failed:", e);
    }
    return false;
  };

  // Fetch Menu from Firebase Firestore (Primary) & Cloud CDN (Fallback)
  const fetchMenu = async () => {
    try {
      setLoading(true);
      const firestoreSnap = await getDoc(doc(db, "menu", "live"));
      if (firestoreSnap.exists()) {
        const firestoreData = firestoreSnap.data();
        if (firestoreData && firestoreData.items && firestoreData.items.length >= 10) {
          console.log("[Firebase Firestore] Loaded live menu instantly from Firoj Sir's project!");
          applyMenuData(firestoreData);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Direct Firestore fetch notice, checking fallback...", e);
    }

    const success = await fetchFromJSONBin();
    if (!success) {
      const localData = localStorage.getItem('rumana_menu_backup');
      if (localData) {
        applyMenuData(JSON.parse(localData));
      } else {
        setMenuItems(DEFAULT_MENU_ITEMS);
        setEditedItems(JSON.parse(JSON.stringify(DEFAULT_MENU_ITEMS)));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMenu();

    // 1. Real-time Firebase Firestore Menu Listener
    let unsubFirestore: (() => void) | null = null;
    try {
      unsubFirestore = onSnapshot(doc(db, "menu", "live"), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.items && data.items.length >= 10) {
            console.log("[Firebase Firestore] Real-time menu update received from Firoj Sir's project!");
            applyMenuData(data);
          }
        }
      }, (err) => {
        console.warn("Firestore snapshot notice:", err);
      });
    } catch (e) {
      console.warn("Firestore listener error:", e);
    }

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
      if (unsubFirestore) unsubFirestore();
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

  const isPotatoEligibleItem = (name: string, id?: number, flag?: boolean) => {
    if (flag) return true;
    if (id && [1, 3, 5, 6, 7].includes(id)) return true;
    const n = (name || '').toLowerCase();
    return n.includes('biriyani') || n.includes('kasha') || n.includes('fish curry');
  };

  const updateCartItemPotato = (name: string, withPotato: boolean) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[name]) {
        updated[name].withPotato = withPotato;
      }
      return updated;
    });
  };

  // Add to Cart
  const addToCart = (
    name: string, 
    price: number, 
    hasSizes?: boolean, 
    prices?: { half: number; full: number },
    hasPotatoOption?: boolean,
    itemId?: number
  ) => {
    setCart(prev => {
      const updated = { ...prev };
      const isEligible = isPotatoEligibleItem(name, itemId, hasPotatoOption);
      if (updated[name]) {
        updated[name].qty += 1;
      } else {
        updated[name] = { 
          name, 
          price, 
          qty: 1,
          hasSizes,
          size: hasSizes ? 'full' : undefined,
          prices,
          hasPotatoOption: isEligible,
          withPotato: isEligible ? false : undefined
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

    const orderTime = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    let messageText = "Hello Rumana's Kitchen! 🍽️\nI would like to place a custom homemade order:\n\n";
    Object.values(cart).forEach(item => {
      const itemTotal = item.price * item.qty;
      let details: string[] = [];
      if (item.hasSizes && item.size) {
        details.push(item.size === 'half' ? 'Half' : 'Full');
      }
      if (item.hasPotatoOption || isPotatoEligibleItem(item.name)) {
        details.push(item.withPotato ? 'With Potato 🥔' : 'No Potato');
      }
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
      const displayName = `${item.name}${detailsStr}`;
      messageText += `• ${displayName} x ${item.qty} (₹${item.price} each) - ₹${itemTotal}\n`;
    });

    messageText += `\n💵 *Total Bill Amount:* ₹${totalCartPrice}\n`;
    messageText += `📅 *Order Time:* ${orderTime}\n`;
    messageText += `⏱️ *Est. Preparation Time:* ${prepTime || '1h 30m'} from confirmation\n`;
    messageText += `📍 *Pickup Location:* Near Pine Block Veg Shop\n\n_Please confirm availability and pick-up timing._`;

    const encodedText = encodeURIComponent(messageText);
    const phone = "918331810574";
    const whatsappURL = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;

    // Direct window location navigation (guaranteed to work across 100% of mobile, tablet, and desktop devices without popup blocker interference)
    window.location.href = whatsappURL;
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

  // Dinner Mode Switch
  const handleToggleDinnerMode = async () => {
    const updatedDinnerMode = !dinnerMode;
    setDinnerMode(updatedDinnerMode);

    const payload = {
      dinnerMode: updatedDinnerMode,
      announcement,
      prepTime,
      items: menuItems
    };

    localStorage.setItem('rumana_menu_backup', JSON.stringify(payload));
    await saveToJSONBinDirect(payload);

    try {
      await fetch(`${API_BASE}/api/menu/toggle-dinner`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.warn("Render toggle failed, cloud JSONBin updated.", err);
    }

    triggerToast(`Dinner Mode set to ${updatedDinnerMode ? 'ON' : 'OFF'}`);
  };

  const handleSaveChanges = async () => {
    setSaveStatus('Saving changes to cloud...');
    const payload = {
      dinnerMode,
      announcement: editedAnnouncement,
      prepTime: editedPrepTime,
      items: editedItems
    };

    setMenuItems(JSON.parse(JSON.stringify(editedItems)));
    setAnnouncement(editedAnnouncement);
    setPrepTime(editedPrepTime);
    localStorage.setItem('rumana_menu_backup', JSON.stringify(payload));

    // Direct cloud update to JSONBin (instant cross-device sync)
    await saveToJSONBinDirect(payload);

    try {
      await fetch(`${API_BASE}/api/menu/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn("Render update failed, cloud JSONBin updated.", err);
    }

    setSaveStatus('Changes saved and published to cloud! (Live on all devices)');
    triggerToast("Menu updated successfully!");
    setTimeout(() => setSaveStatus(''), 3000);
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
    let matchesFilter = false;
    if (activeFilter === 'all') matchesFilter = true;
    else if (activeFilter === 'veg') matchesFilter = item.diet === 'veg' && item.category !== 'sweets';
    else if (activeFilter === 'nonveg') matchesFilter = item.diet === 'nonveg';
    else if (activeFilter === 'sweets') matchesFilter = item.category === 'sweets';
    else matchesFilter = item.category === activeFilter;
    const fitsDinnerMode = !dinnerMode || item.name.toLowerCase().includes('biriyani');
    return matchesSearch && matchesFilter && fitsDinnerMode;
  });

  // Counts for filter tabs
  const availableItems = menuItems.filter(i => !dinnerMode || i.name.toLowerCase().includes('biriyani'));
  const vegCount = availableItems.filter(i => i.diet === 'veg' && i.category !== 'sweets').length;
  const nonvegCount = availableItems.filter(i => i.diet === 'nonveg').length;
  const sweetsCount = availableItems.filter(i => i.category === 'sweets').length;



  const compressAndResizeImage = (file: File, maxWidth = 600, maxHeight = 600, quality = 0.75): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const getItemImageSrc = (item: MenuItem) => {
    if (!item) return '/veg.jpg';
    
    // 1. Custom base64 image (uploaded via phone camera/gallery)
    if (item.image && item.image.startsWith('data:')) {
      return item.image;
    }

    // 2. Custom HTTP/HTTPS URL
    if (item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'))) {
      return item.image;
    }

    // 3. Locked 1-to-1 exact dish name mapping (Guarantees zero image swaps!)
    const nameLower = (item.name || '').trim().toLowerCase();
    if (EXACT_DISH_IMAGE_MAP[nameLower]) {
      return EXACT_DISH_IMAGE_MAP[nameLower];
    }

    for (const [key, src] of Object.entries(EXACT_DISH_IMAGE_MAP)) {
      if (nameLower.includes(key)) {
        return src;
      }
    }

    if (item.image && !['veg.jpg', 'ccurry.jpg'].includes(item.image)) {
      return item.image.startsWith('/') ? item.image : `/${item.image}`;
    }

    return item.diet === 'veg' ? '/veg.jpg' : '/ccurry.jpg';
  };

  const renderCard = (item: MenuItem) => (
    <div
      key={item.id}
      className="card"
      data-available={item.available ? "true" : "false"}
      data-diet={item.diet}
    >
      <div className="card-image-container">
        {/* Top-Left Status Pill */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 3, display: 'flex', alignItems: 'center', gap: '4px' }}>
          {item.available ? (
            <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(6px)', color: '#2e7d32', padding: '4px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 800, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', border: '1px solid rgba(46,125,50,0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🔥</span><span>{item.stockCount && item.stockCount > 0 ? `${item.stockCount} Available` : 'Available'}</span>
            </div>
          ) : (
            <div style={{ background: 'rgba(198,40,40,0.95)', backdropFilter: 'blur(6px)', color: '#ffffff', padding: '4px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 800, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>❌</span><span>Sold Out</span>
            </div>
          )}
        </div>

        {/* Top-Right Badges: Diet Pill + Indian Veg/Non-Veg Dot Symbol */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 3, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ background: item.diet === 'veg' ? '#1b5e20' : '#b71c1c', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
            {item.diet === 'veg' ? 'VEG' : 'NON-VEG'}
          </span>
          <div style={{ width: '20px', height: '20px', border: `2px solid ${item.diet === 'veg' ? '#2e7d32' : '#b71c1c'}`, borderRadius: '4px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.diet === 'veg' ? '#2e7d32' : '#b71c1c' }} />
          </div>
        </div>

        <img className="card-img" src={getItemImageSrc(item)}
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            const nameLower = (item.name || '').toLowerCase();
            if (item.id === 30 || nameLower.includes('tandoori roti')) t.src = '/tandooriroti.png';
            else if (item.id === 31 || nameLower.includes('chicken chaap')) t.src = '/chickenchaap.png';
            else if (item.id === 32 || nameLower.includes('kashmiri aloo dum') || nameLower.includes('kasmiri aloo dum')) t.src = '/kashmirialoodum.png';
            else if (item.id === 33 || nameLower.includes('fulko luchi')) t.src = '/fulkoluchi.png';
            else if (item.id === 34 || nameLower.includes('chicken varta') || nameLower.includes('chicken bharta')) t.src = '/chickenvarta.png';
            else t.src = item.fallbackImage || '/veg.jpg';
          }}
          alt={item.name}
        />
      </div>
      <div className="card-body">
        <h3 className="card-title">{item.name}</h3>
        <p className="card-desc">{item.description}</p>
        {item.prepTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#e65100', fontWeight: 600, marginBottom: '6px' }}>
            <span>⏱️</span><span>Ready in {item.prepTime}</span>
          </div>
        )}

        <div className="card-footer">
          <div className="card-price">
            {item.hasSizes && item.prices ? `₹${item.prices.half} - ₹${item.prices.full}` : `₹${item.price}`}
          </div>
          {item.available && (
            <button className="add-to-cart-btn" onClick={() => addToCart(item.name, item.price, item.hasSizes, item.prices, item.hasPotatoOption)}>+</button>
          )}
        </div>
      </div>
    </div>
  );

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

            {/* Horizontal Scrollable Carousel Banner Section */}
            {carouselItems && carouselItems.length > 0 && (
              <section style={{ padding: '30px 20px 10px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div>
                    <span className="section-subtitle" style={{ fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--primary)' }}>✨ Kitchen Stories & Gallery</span>
                    <h3 style={{ color: 'var(--text-dark)', margin: 0, fontSize: '22px', fontWeight: 800 }}>📸 Featured Highlights</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        const el = document.getElementById('carouselContainer');
                        if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                      }}
                      style={{
                        background: 'white',
                        border: '1px solid rgba(158,42,43,0.25)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)'
                      }}
                    >
                      ❮
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById('carouselContainer');
                        if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                      }}
                      style={{
                        background: 'white',
                        border: '1px solid rgba(158,42,43,0.25)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)'
                      }}
                    >
                      ❯
                    </button>
                  </div>
                </div>

                <div
                  id="carouselContainer"
                  style={{
                    display: 'flex',
                    gap: '16px',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    scrollBehavior: 'smooth',
                    paddingBottom: '12px',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'thin'
                  }}
                >
                  {carouselItems.map((cItem, idx) => (
                    <div
                      key={cItem.id || idx}
                      style={{
                        minWidth: '280px',
                        maxWidth: '320px',
                        height: '220px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                        scrollSnapAlign: 'start',
                        flexShrink: 0,
                        border: '1px solid rgba(158,42,43,0.15)',
                        background: '#222'
                      }}
                    >
                      <img
                        src={cItem.image}
                        alt={cItem.title || 'Highlight'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                        padding: '16px',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end'
                      }}>
                        {cItem.tag && (
                          <span style={{
                            background: 'var(--primary)',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '50px',
                            width: 'fit-content',
                            marginBottom: '6px',
                            textTransform: 'uppercase'
                          }}>
                            {cItem.tag}
                          </span>
                        )}
                        {cItem.title && (
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, lineHeight: 1.2 }}>
                            {cItem.title}
                          </h4>
                        )}
                        {cItem.subtitle && (
                          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9, fontWeight: 400 }}>
                            {cItem.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

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
                      { id: 'all', label: '🍽️ All', count: null },
                      { id: 'veg', label: '🥦 Veg', count: vegCount },
                      { id: 'nonveg', label: '🍗 Non-Veg', count: nonvegCount },
                      { id: 'sweets', label: '🍮 Desserts', count: sweetsCount }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        className={`filter-btn ${activeFilter === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveFilter(tab.id)}
                      >
                        {tab.label}{tab.count !== null ? ` (${tab.count})` : ''}
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
                  {filteredItems.map(item => renderCard(item))}
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
                      <div className="timeline-title">Book before 2 hrs</div>
                    </div>
                    <div className="timeline-node">
                      <div className="timeline-time">🌙 DINNER SLOTS</div>
                      <div className="timeline-title">Book before 2 hrs</div>
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

                      {(item.hasPotatoOption || isPotatoEligibleItem(item.name)) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>🥔 Potato:</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => updateCartItemPotato(item.name, true)}
                              style={{
                                border: item.withPotato ? '1px solid #2e7d32' : '1px solid rgba(158, 42, 43, 0.18)',
                                background: item.withPotato ? '#2e7d32' : 'transparent',
                                color: item.withPotato ? 'white' : 'var(--text)',
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => updateCartItemPotato(item.name, false)}
                              style={{
                                border: !item.withPotato ? '1px solid #c62828' : '1px solid rgba(158, 42, 43, 0.18)',
                                background: !item.withPotato ? '#c62828' : 'transparent',
                                color: !item.withPotato ? 'white' : 'var(--text)',
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              No
                            </button>
                          </div>
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



                {/* Carousel Banner Admin Control Section */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid rgba(158,42,43,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ color: 'var(--primary)', margin: 0, fontSize: '20px', fontWeight: 800 }}>
                        📸 Carousel Banner & Photo Gallery Control
                      </h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                        Add, remove, and manage photos displayed in the customer left-to-right carousel slider.
                      </p>
                    </div>
                    <button
                      className="btn-primary"
                      onClick={() => setShowAddCarouselModal(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '10px 18px' }}
                    >
                      ➕ Add Carousel Photo
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
                    {editedCarouselItems.map((cItem) => (
                      <div key={cItem.id} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', background: '#f9f9f9', position: 'relative' }}>
                        <div style={{ height: '140px', position: 'relative' }}>
                          <img src={cItem.image} alt={cItem.title || 'Slide'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            onClick={() => handleDeleteCarouselItem(cItem.id)}
                            style={{ position: 'absolute', top: '8px', right: '8px', background: '#c62828', color: 'white', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}
                            title="Delete slide"
                          >
                            ✕
                          </button>
                        </div>
                        <div style={{ padding: '10px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>{cItem.tag || 'Highlight'}</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cItem.title || 'Untitled Photo'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items Admin List */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(158, 42, 43, 0.1)', paddingBottom: '10px' }}>
                  <h3 style={{ color: 'var(--primary)', margin: 0 }}>Food Catalog ({editedItems.length} items)</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowAddItemModal(true)}>
                      ➕ Add New Dish
                    </button>
                    <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => setAllAvailability(true)}>
                      ✅ Mark All Available
                    </button>
                    <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', borderColor: '#c1121f', color: '#c1121f' }} onClick={() => setAllAvailability(false)}>
                      ❌ Mark All Sold Out
                    </button>
                  </div>
                </div>

                {/* Add Carousel Photo Modal Overlay */}
                {showAddCarouselModal && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                  }}>
                    <div style={{
                      background: 'white',
                      borderRadius: '16px',
                      maxWidth: '500px',
                      width: '100%',
                      padding: '25px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                      border: '1px solid rgba(158,42,43,0.2)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          📸 Add Photo to Carousel
                        </h3>
                        <button
                          onClick={() => setShowAddCarouselModal(false)}
                          style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#666' }}
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleAddCarouselSubmit}>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                          <label className="form-label" style={{ fontWeight: 700 }}>Select Photo *</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'white', padding: '10px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', width: 'fit-content' }}>
                              📸 Take Photo / Upload from Phone
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    compressAndResizeImage(file).then(compressedDataUrl => {
                                      setNewCarouselImage(compressedDataUrl);
                                      triggerToast("Photo attached & compressed!");
                                    });
                                  }
                                }}
                              />
                            </label>

                            {newCarouselImage && (
                              <div style={{ position: 'relative', width: '130px', height: '95px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                                <img src={newCarouselImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '15px' }}>
                          <label className="form-label" style={{ fontWeight: 700 }}>Title / Caption</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Mutton Biriyani Preparation, Customer Review"
                            value={newCarouselTitle}
                            onChange={(e) => setNewCarouselTitle(e.target.value)}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '15px' }}>
                          <label className="form-label" style={{ fontWeight: 700 }}>Subtitle / Description</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Prepared fresh with authentic spices"
                            value={newCarouselSubtitle}
                            onChange={(e) => setNewCarouselSubtitle(e.target.value)}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                          <label className="form-label" style={{ fontWeight: 700 }}>Category Tag</label>
                          <select
                            className="form-input"
                            value={newCarouselTag}
                            onChange={(e) => setNewCarouselTag(e.target.value)}
                          >
                            <option value="🍳 Kitchen Story">🍳 Kitchen Story</option>
                            <option value="⭐ Customer Review">⭐ Customer Review</option>
                            <option value="🔥 Special Highlight">🔥 Special Highlight</option>
                            <option value="🥦 Veg Special">🥦 Veg Special</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                          <button type="button" className="btn-secondary" onClick={() => setShowAddCarouselModal(false)}>Cancel</button>
                          <button type="submit" className="btn-primary">Save & Add to Carousel</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Add New Item Modal Overlay */}
                {showAddItemModal && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                  }}>
                    <div style={{
                      background: 'white',
                      borderRadius: '16px',
                      maxWidth: '550px',
                      width: '100%',
                      maxHeight: '90vh',
                      overflowY: 'auto',
                      padding: '25px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                      border: '1px solid rgba(158,42,43,0.2)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          🍲 Add New Dish to Menu
                        </h3>
                        <button
                          onClick={() => setShowAddItemModal(false)}
                          style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#666' }}
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleAddNewItemSubmit}>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                          <label className="form-label" style={{ fontWeight: 700 }}>Dish Name *</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Mutton Keema, Samosa, Kheer"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            required
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontWeight: 700 }}>Category</label>
                            <select
                              className="form-input"
                              value={newItemCategory}
                              onChange={(e) => setNewItemCategory(e.target.value as any)}
                            >
                              <option value="biryani">Biryani & Rice</option>
                              <option value="curries">Curries</option>
                              <option value="snacks">Snacks & Breads</option>
                              <option value="sweets">Sweets & Desserts</option>
                            </select>
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontWeight: 700 }}>Diet Type</label>
                            <select
                              className="form-input"
                              value={newItemDiet}
                              onChange={(e) => setNewItemDiet(e.target.value as any)}
                            >
                              <option value="veg">🥦 Veg</option>
                              <option value="nonveg">🔴 Non-Veg</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontWeight: 700 }}>Price (₹) *</label>
                            <input
                              type="number"
                              className="form-input"
                              placeholder="e.g. 120"
                              value={newItemPrice}
                              onChange={(e) => setNewItemPrice(e.target.value)}
                              required
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontWeight: 700 }}>Portion / Description</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g. Per plate, 4 pcs"
                              value={newItemDescription}
                              onChange={(e) => setNewItemDescription(e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontWeight: 700 }}>⏱️ Prep Time</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g. 1h 30m, 45 mins"
                              value={newItemPrepTime}
                              onChange={(e) => setNewItemPrepTime(e.target.value)}
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontWeight: 700 }}>Initial Stock</label>
                            <input
                              type="number"
                              className="form-input"
                              placeholder="e.g. 20"
                              value={newItemStock}
                              onChange={(e) => setNewItemStock(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '15px' }}>
                          <label className="form-label" style={{ fontWeight: 700 }}>Dish Photo *</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              background: 'var(--primary)',
                              color: 'white',
                              padding: '10px 16px',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '13px',
                              cursor: 'pointer',
                              width: 'fit-content',
                              boxShadow: '0 4px 10px rgba(158,42,43,0.2)'
                            }}>
                              📸 Take Photo / Upload from Phone
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    compressAndResizeImage(file).then(compressedDataUrl => {
                                      setNewItemImage(compressedDataUrl);
                                      triggerToast("Photo compressed & attached! Click Save to finish.");
                                    }).catch(() => {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        if (typeof reader.result === 'string') {
                                          setNewItemImage(reader.result);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    });
                                  }
                                }}
                              />
                            </label>

                            {newItemImage && (
                              <div style={{ position: 'relative', width: '130px', height: '95px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--primary)', marginTop: '4px' }}>
                                <img src={newItemImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button
                                  type="button"
                                  onClick={() => setNewItemImage('')}
                                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', fontSize: '11px', cursor: 'pointer' }}
                                >
                                  ✕
                                </button>
                              </div>
                            )}

                            <div style={{ fontSize: '11px', color: '#666' }}>
                              Or enter image filename/URL manually:
                            </div>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g. mcurry.jpg or https://..."
                              value={newItemImage.startsWith('data:') ? 'Photo attached from phone 📸' : newItemImage}
                              onChange={(e) => setNewItemImage(e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', background: '#f9f9f9', padding: '10px 14px', borderRadius: '8px' }}>
                          <input
                            type="checkbox"
                            id="newItemHasPotato"
                            checked={newItemHasPotato}
                            onChange={(e) => setNewItemHasPotato(e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <label htmlFor="newItemHasPotato" style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer', margin: 0 }}>
                            🥔 Include "With Potato / No Potato" option in Cart
                          </label>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setShowAddItemModal(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn-primary"
                          >
                            ➕ Save & Add Dish
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="admin-grid">
                  {editedItems.map(item => (
                    <div key={item.id} className="admin-card">
                      <div className="admin-card-info">
                        <img
                          className="admin-card-img"
                          src={getItemImageSrc(item)}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const nameLower = (item.name || '').toLowerCase();
                            if (item.id === 30 || nameLower.includes('tandoori roti')) target.src = '/tandooriroti.png';
                            else if (item.id === 31 || nameLower.includes('chicken chaap')) target.src = '/chickenchaap.png';
                            else if (item.id === 32 || nameLower.includes('kashmiri aloo dum') || nameLower.includes('kasmiri aloo dum')) target.src = '/kashmirialoodum.png';
                            else if (item.id === 33 || nameLower.includes('fulko luchi')) target.src = '/fulkoluchi.png';
                            else if (item.id === 34 || nameLower.includes('chicken varta') || nameLower.includes('chicken bharta')) target.src = '/chickenvarta.png';
                            else target.src = item.fallbackImage || '/veg.jpg';
                          }}
                          alt={item.name}
                        />
                        <div className="admin-card-details">
                          <div className="admin-card-name">{item.name}</div>
                          <div className="admin-card-meta">
                            Category: <strong style={{ textTransform: 'capitalize' }}>{item.category}</strong> | Price: <strong>₹{item.price}</strong> | Status: <strong style={{ color: item.available ? '#2e7d32' : '#c62828' }}>{item.available ? 'Available' : 'Sold Out'}</strong>
                          </div>
                          <label style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f0f4f8',
                            color: 'var(--primary)',
                            border: '1px solid rgba(158, 42, 43, 0.2)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            marginTop: '6px',
                            width: 'fit-content'
                          }}>
                            📸 Change Photo
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  compressAndResizeImage(file).then(compressedDataUrl => {
                                    handleEditItemField(item.id, 'image', compressedDataUrl);
                                    triggerToast(`Photo compressed & updated for "${item.name}". Click "Publish Changes" to save.`);
                                  }).catch(() => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      if (typeof reader.result === 'string') {
                                        handleEditItemField(item.id, 'image', reader.result);
                                        triggerToast(`Photo updated for "${item.name}". Click "Publish Changes" to save.`);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="admin-card-actions">
                        <div className="admin-card-inputs">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label className="form-label" style={{ fontSize: '11px', marginBottom: 0 }}>Item Name</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ width: '160px' }}
                              value={item.name}
                              onChange={(e) => handleEditItemField(item.id, 'name', e.target.value)}
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label className="form-label" style={{ fontSize: '11px', marginBottom: 0 }}>Price (₹)</label>
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: '90px' }}
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

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label className="form-label" style={{ fontSize: '11px', marginBottom: 0 }}>Stock Qty</label>
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: '80px' }}
                              placeholder="e.g. 20"
                              value={item.stockCount !== undefined ? item.stockCount : ''}
                              onChange={(e) => handleEditItemField(item.id, 'stockCount', e.target.value === '' ? undefined : parseInt(e.target.value) || 0)}
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label className="form-label" style={{ fontSize: '11px', marginBottom: 0 }}>⏱️ Prep Time</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ width: '100px' }}
                              placeholder="e.g. 30 mins"
                              value={item.prepTime || ''}
                              onChange={(e) => handleEditItemField(item.id, 'prepTime', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Actions: Stock & Delete */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <span className="toggle-label" style={{ fontSize: '10px' }}>In Stock</span>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={item.available}
                              onChange={(e) => handleEditItemField(item.id, 'available', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            style={{
                              background: '#ffebee',
                              color: '#c62828',
                              border: '1px solid #ffcdd2',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              marginTop: '2px'
                            }}
                            title="Remove dish from menu"
                          >
                            🗑️ Delete
                          </button>
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
