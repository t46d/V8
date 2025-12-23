import { getFirebase } from './firebase-config.js';

export class AuthService {
  constructor() {
    this.firebase = getFirebase();
    this.auth = this.firebase.auth;
    this.db = this.firebase.db;
  }

  // Guest Login (Anonymous)
  async guestLogin() {
    try {
      const userCredential = await this.auth.signInAnonymously();
      const user = userCredential.user;
      
      // Generate guest username
      const guestNumber = Math.floor(Math.random() * 9999);
      const displayName = `Guest_${guestNumber}`;
      
      // Create user document in Firestore
      await this.db.collection('users').doc(user.uid).set({
        uid: user.uid,
        displayName: displayName,
        isGuest: true,
        userId: `#VX-${guestNumber}`,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        online: true,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      return {
        success: true,
        user: {
          uid: user.uid,
          displayName: displayName,
          isGuest: true,
          userId: `#VX-${guestNumber}`
        }
      };
    } catch (error) {
      console.error('Guest login error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Email/Password Login
  async emailLogin(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update user status
      await this.updateUserStatus(user.uid, true);
      
      return {
        success: true,
        user: user
      };
    } catch (error) {
      console.error('Email login error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Google Login
  async googleLogin() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const userCredential = await this.auth.signInWithPopup(provider);
      const user = userCredential.user;
      
      // Check if user exists in Firestore
      const userDoc = await this.db.collection('users').doc(user.uid).get();
      
      if (!userDoc.exists) {
        // Create new user document
        await this.db.collection('users').doc(user.uid).set({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          online: true,
          lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
          userId: `#VX-${Math.floor(1000 + Math.random() * 9000)}`
        });
      } else {
        // Update existing user
        await this.updateUserStatus(user.uid, true);
      }
      
      return {
        success: true,
        user: user
      };
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update user online status
  async updateUserStatus(uid, isOnline) {
    try {
      await this.db.collection('users').doc(uid).update({
        online: isOnline,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Update status error:', error);
    }
  }

  // Logout
  async logout() {
    try {
      const user = this.auth.currentUser;
      if (user) {
        await this.updateUserStatus(user.uid, false);
      }
      await this.auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check current user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Auth state listener
  onAuthStateChanged(callback) {
    return this.auth.onAuthStateChanged(callback);
  }
}

// Create singleton instance
export const authService = new AuthService();
