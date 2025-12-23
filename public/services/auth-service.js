import { getFirebase } from './firebase-config.js';

export class AuthService {
  constructor() {
    this.firebase = getFirebase();
    this.auth = this.firebase.auth;
    this.db = this.firebase.db;
  }

  async guestLogin() {
    try {
      const userCredential = await this.auth.signInAnonymously();
      const user = userCredential.user;
      const guestNumber = Math.floor(Math.random() * 9999);
      const displayName = `Guest_${guestNumber}`;
      await this.db.collection('users').doc(user.uid).set({
        uid: user.uid,
        displayName,
        isGuest: true,
        userId: `#VX-${guestNumber}`,
        createdAt: new Date()
      }, { merge: true });
      return { success: true, user: { uid: user.uid, displayName, isGuest: true, userId: `#VX-${guestNumber}` } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async emailLogin(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      await this.updateUserStatus(user.uid, true);
      return { success: true, user };
    } catch (error) { return { success: false, error: error.message }; }
  }

  async googleLogin() {
    try {
      const userCredential = await this.auth.signInWithPopup();
      const user = userCredential.user;
      const userDoc = await this.db.collection('users').doc(user.uid).get();
      if (!userDoc.exists) {
        await this.db.collection('users').doc(user.uid).set({ uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL, createdAt: new Date(), online: true, userId: `#VX-${Math.floor(1000 + Math.random() * 9000)}` });
      } else {
        await this.updateUserStatus(user.uid, true);
      }
      return { success: true, user };
    } catch (error) { return { success: false, error: error.message }; }
  }

  async updateUserStatus(uid, isOnline) {
    try { await this.db.collection('users').doc(uid).update({ online: isOnline, lastSeen: new Date() }); } catch (e) { }
  }

  async logout() {
    try { const user = this.auth._currentUser || null; if (user) await this.updateUserStatus(user.uid, false); await this.auth.signOut(); return { success: true }; } catch (e) { return { success: false, error: e.message }; }
  }

  getCurrentUser() { return this.auth._currentUser || this.auth._currentUser; }
  onAuthStateChanged(cb) { return this.auth.onAuthStateChanged(cb); }
}

export const authService = new AuthService();
