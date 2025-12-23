// Firebase Configuration with fallback mock implementation for local testing
// Replace with real config to use Firebase services in production.
export const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// If real `firebase` SDK is present (when using Firebase), use it.
// Otherwise, provide a simple in-memory mock implementation for development.
let app;
let auth;
let db;
let storage;

// Minimal in-memory Firestore mock
class InMemoryFirestore {
  constructor() {
    this._data = new Map(); // collection -> Map(docId -> {data, subcollections})
  }

  collection(name) {
    if (!this._data.has(name)) this._data.set(name, new Map());
    const col = this._data.get(name);
    const self = this;
    return {
      doc(docId) {
        return {
          async set(data, options) {
            if (!docId) throw new Error('docId required for set in mock');
            const existing = col.get(docId) || {};
            const newData = options && options.merge ? Object.assign({}, existing.data || {}, data) : data;
            col.set(docId, { data: newData, sub: new Map() });
            return Promise.resolve();
          },
          async get() {
            const doc = col.get(docId);
            return Promise.resolve({ exists: !!doc, data: () => (doc ? doc.data : undefined) });
          },
          async update(data) {
            const doc = col.get(docId) || { data: {} };
            doc.data = Object.assign({}, doc.data || {}, data);
            col.set(docId, doc);
            return Promise.resolve();
          },
          async delete() {
            col.delete(docId);
            return Promise.resolve();
          },
          collection(subName) {
            const parent = col.get(docId) || { data: {}, sub: new Map() };
            if (!parent.sub.has(subName)) parent.sub.set(subName, new Map());
            const subcol = parent.sub.get(subName);
            return {
              async add(data) {
                const id = 'm_' + Math.random().toString(36).slice(2, 9);
                subcol.set(id, { data });
                return Promise.resolve({ id });
              },
              async orderBy() { return { limit: () => ({ get: async () => ({ docs: [] }) }) }; }
            };
          }
        };
      },
      async where(field, op, value) {
        // Support simple where('online','==', true) and array-contains
        const docs = [];
        for (const [id, rec] of col.entries()) {
          const data = rec.data || {};
          let ok = false;
          if (op === '==') ok = data[field] === value;
          if (op === 'array-contains') ok = Array.isArray(data[field]) && data[field].includes(value);
          if (ok) docs.push({ id, data });
        }
        return {
          orderBy() { return { limit: (n) => ({ get: async () => ({ docs }) }) }; },
          limit(n) { return { get: async () => ({ docs }) }; },
          async get() { return { docs }; }
        };
      },
      async orderBy() { return { limit: (n) => ({ get: async () => ({ docs: [] }) }) }; },
      async get() {
        const docs = [];
        for (const [id, rec] of col.entries()) docs.push({ id, data: rec.data });
        return { docs };
      }
    };
  }
}

// Minimal in-memory Auth mock
class InMemoryAuth {
  constructor() {
    this._currentUser = null;
    this._listeners = [];
  }

  _emit(user) {
    this._currentUser = user;
    this._listeners.forEach(cb => cb(user));
  }

  onAuthStateChanged(cb) {
    this._listeners.push(cb);
    // call immediately with current user
    setTimeout(() => cb(this._currentUser), 0);
    return () => { this._listeners = this._listeners.filter(f => f !== cb); };
  }

  async signInAnonymously() {
    const user = { uid: 'guest_' + Math.random().toString(36).slice(2,7) };
    this._emit(user);
    return Promise.resolve({ user });
  }

  async signInWithEmailAndPassword(email, password) {
    const user = { uid: 'user_' + Math.random().toString(36).slice(2,7), email };
    this._emit(user);
    return Promise.resolve({ user });
  }

  async signOut() {
    this._emit(null);
    return Promise.resolve();
  }
}

// Minimal storage mock
class InMemoryStorage {
  constructor() {
    this._files = new Map();
  }
  ref(path) {
    const self = this;
    return {
      async put(file) {
        self._files.set(path, { file });
        return Promise.resolve();
      },
      async getDownloadURL() {
        return Promise.resolve('https://example.com/' + encodeURIComponent(path));
      },
      async listAll() {
        return { items: [] };
      }
    };
  }
}

export const initializeFirebase = () => {
  if (typeof window !== 'undefined' && window.firebase) {
    try {
      if (!window.firebase.apps.length) app = window.firebase.initializeApp(firebaseConfig);
      else app = window.firebase.app();
      auth = window.firebase.auth();
      db = window.firebase.firestore();
      storage = window.firebase.storage();
      return { app, auth, db, storage };
    } catch (e) {
      console.warn('Firebase present but failed to init, falling back to mock.', e);
    }
  }

  // Fallback mock
  if (!db) db = new InMemoryFirestore();
  if (!auth) auth = new InMemoryAuth();
  if (!storage) storage = new InMemoryStorage();
  console.log('⚠️ Using mock Firebase services (development)');
  return { app: {}, auth, db, storage };
};

export const getFirebase = () => {
  if (!db || !auth || !storage) return initializeFirebase();
  return { app, auth, db, storage };

};
