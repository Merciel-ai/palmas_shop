import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      brand: "PALMAS",
      home: "HOME",
      about: "ABOUT",
      shop: "SHOP",
      dashboard: "DASHBOARD",
      login: "LOGIN",
      signup: "SIGN UP",
      logout: "LOGOUT",
      join: "JOIN",
      
      // Hero Section
      exclusiveAccess: "EXCLUSIVE ACCESS",
      madeBySociety: "MADE BY SOCIETY",
      joinMovement: "JOIN THE MOVEMENT",
      signIn: "SIGN IN",
      
      // Shop
      featuredProducts: "Featured Products",
      new: "NEW",
      limited: "LIMITED",
      negotiable: "NEGOTIABLE",
      addToCart: "ADD TO CART",
      negotiate: "NEGOTIATE",
      search: "Search exclusive pieces...",
      filter: "Filter",
      sortBy: "Sort By",
      newest: "Newest First",
      priceLowHigh: "Price: Low to High",
      priceHighLow: "Price: High to Low",
      popular: "Most Popular",
      
      // Cart
      shoppingCart: "Shopping Cart",
      cartEmpty: "Your cart is empty",
      continueShopping: "Continue Shopping",
      orderSummary: "Order Summary",
      subtotal: "Subtotal",
      shipping: "Shipping",
      free: "Free",
      total: "Total",
      proceedToPayment: "Proceed to Payment",
      
      // Orders
      myOrders: "My Orders",
      noOrders: "No orders yet",
      startShopping: "Start Shopping",
      orderId: "Order ID",
      status: "Status",
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      items: "Items",
      
      // Profile
      myWishlist: "My Wishlist",
      wishlistEmpty: "Your wishlist is empty",
      profile: "Profile",
      memberSince: "MEMBER SINCE",
      memberType: "Member Type",
      exclusive: "EXCLUSIVE",
      totalOrders: "Total Orders",
      totalSpent: "Total Spent",
      
      // Negotiation
      negotiatePrice: "Price Negotiation",
      proposePrice: "Propose price (CFA)",
      typeMessage: "Type your message...",
      send: "Send",
      propose: "Propose",
      waitingForReply: "Waiting for admin response...",
      acceptOffer: "Accept Last Offer & Add to Cart",
      
      // Admin
      adminAccess: "Admin Access",
      username: "Username",
      password: "Password",
      dashboard: "Dashboard",
      products: "Products",
      customers: "Customers",
      discounts: "Discounts",
      analytics: "Analytics",
      settings: "Settings",
      addProduct: "Add Product",
      editProduct: "Edit Product",
      deleteProduct: "Delete Product",
      
      // Footer
      support: "Support",
      legal: "Legal",
      social: "Social",
      faq: "FAQ",
      shipping: "Shipping",
      returns: "Returns",
      terms: "Terms",
      privacy: "Privacy",
      cookies: "Cookies",
      securePayment: "SECURE PAYMENT",
      worldwideShipping: "WORLDWIDE SHIPPING",
      premiumQuality: "PREMIUM QUALITY",
      allRightsReserved: "All rights reserved.",
      
      // Common
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      confirm: "Confirm",
      back: "Back",
      next: "Next",
      submit: "Submit"
    }
  },
  fr: {
    translation: {
      // Navigation
      brand: "PALMAS",
      home: "ACCUEIL",
      about: "À PROPOS",
      shop: "BOUTIQUE",
      dashboard: "TABLEAU DE BORD",
      login: "CONNEXION",
      signup: "S'INSCRIRE",
      logout: "DÉCONNEXION",
      join: "REJOINDRE",
      
      // Hero Section
      exclusiveAccess: "ACCÈS EXCLUSIF",
      madeBySociety: "FABRIQUÉ PAR LA SOCIÉTÉ",
      joinMovement: "REJOIGNEZ LE MOUVEMENT",
      signIn: "SE CONNECTER",
      
      // Shop
      featuredProducts: "Produits Vedettes",
      new: "NOUVEAU",
      limited: "LIMITÉ",
      negotiable: "NÉGOCIABLE",
      addToCart: "AJOUTER AU PANIER",
      negotiate: "NÉGOCIER",
      search: "Rechercher des pièces exclusives...",
      filter: "Filtrer",
      sortBy: "Trier par",
      newest: "Plus récents",
      priceLowHigh: "Prix: Croissant",
      priceHighLow: "Prix: Décroissant",
      popular: "Les plus populaires",
      
      // Cart
      shoppingCart: "Panier",
      cartEmpty: "Votre panier est vide",
      continueShopping: "Continuer les achats",
      orderSummary: "Résumé de la commande",
      subtotal: "Sous-total",
      shipping: "Livraison",
      free: "Gratuite",
      total: "Total",
      proceedToPayment: "Procéder au paiement",
      
      // Orders
      myOrders: "Mes Commandes",
      noOrders: "Aucune commande",
      startShopping: "Commencer à acheter",
      orderId: "ID Commande",
      status: "Statut",
      pending: "En attente",
      processing: "En traitement",
      shipped: "Expédié",
      delivered: "Livré",
      items: "Articles",
      
      // Profile
      myWishlist: "Ma Liste d'envies",
      wishlistEmpty: "Votre liste d'envies est vide",
      profile: "Profil",
      memberSince: "MEMBRE DEPUIS",
      memberType: "Type de membre",
      exclusive: "EXCLUSIF",
      totalOrders: "Total commandes",
      totalSpent: "Total dépensé",
      
      // Negotiation
      negotiatePrice: "Négociation de prix",
      proposePrice: "Proposer un prix (FCFA)",
      typeMessage: "Tapez votre message...",
      send: "Envoyer",
      propose: "Proposer",
      waitingForReply: "En attente de réponse de l'administrateur...",
      acceptOffer: "Accepter l'offre et ajouter au panier",
      
      // Admin
      adminAccess: "Accès Administrateur",
      username: "Nom d'utilisateur",
      password: "Mot de passe",
      dashboard: "Tableau de bord",
      products: "Produits",
      customers: "Clients",
      discounts: "Réductions",
      analytics: "Analytique",
      settings: "Paramètres",
      addProduct: "Ajouter un produit",
      editProduct: "Modifier le produit",
      deleteProduct: "Supprimer le produit",
      
      // Footer
      support: "Support",
      legal: "Légal",
      social: "Social",
      faq: "FAQ",
      shipping: "Livraison",
      returns: "Retours",
      terms: "Conditions",
      privacy: "Confidentialité",
      cookies: "Cookies",
      securePayment: "PAIEMENT SÉCURISÉ",
      worldwideShipping: "LIVRAISON MONDIALE",
      premiumQuality: "QUALITÉ PREMIUM",
      allRightsReserved: "Tous droits réservés.",
      
      // Common
      loading: "Chargement...",
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      close: "Fermer",
      confirm: "Confirmer",
      back: "Retour",
      next: "Suivant",
      submit: "Soumettre"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;