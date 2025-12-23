// Firebase Configuration
// REPLACE THESE VALUES WITH YOUR FIREBASE CONFIG
export const firebaseConfig = {
  apiKey: "AIzaSyC...YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Firebase Services
let app;
let auth;
let db;
let storage;

export const initializeFirebase = () => {
  try {
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.app();
    }
    
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    
    console.log("✅ Firebase initialized successfully");
    return { app, auth, db, storage };
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
    return null;
  }
};

export const getFirebase = () => {
  if (!app) {
    return initializeFirebase();
  }
  return { app, auth, db, storage };
};
