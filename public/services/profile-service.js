import { getFirebase } from './firebase-config.js';
import { authService } from './auth-service.js';

export class ProfileService {
  constructor() {
    this.firebase = getFirebase();
    this.db = this.firebase.db;
    this.storage = this.firebase.storage;
  }

  async getUserProfile(uid = null) {
    const currentUser = authService.getCurrentUser();
    const userId = uid || (currentUser && currentUser.uid);
    if (!userId) throw new Error('User ID required');
    const userDoc = await this.db.collection('users').doc(userId).get();
    if (!userDoc.exists && !userDoc.data) return null;
    return { id: userId, ...(userDoc.data ? userDoc.data() : userDoc.data) };
  }

  async updateProfile(profileData) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    await this.db.collection('users').doc(currentUser.uid).update(Object.assign({}, profileData, { updatedAt: Date.now() }));
    if (profileData.displayName) { try { currentUser.displayName = profileData.displayName; } catch (e) {} }
    return { success: true };
  }

  async uploadProfilePicture(file) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    if (!file || !file.name) throw new Error('Invalid file');
    const storageRef = this.storage.ref(`profile_pictures/${currentUser.uid}/${file.name}`);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    await this.db.collection('users').doc(currentUser.uid).update({ photoURL: url, updatedAt: Date.now() });
    return url;
  }

  async getNearbyUsers(limit = 20) {
    const snapshot = await this.db.collection('users').where('online', '==', true).limit(limit).get();
    const users = [];
    const currentUser = authService.getCurrentUser();
    for (const doc of snapshot.docs) {
      const u = doc.data || doc.data();
      if (u.uid === (currentUser && currentUser.uid)) continue;
      u.distance = (Math.random() * 10).toFixed(1) + ' km';
      users.push(Object.assign({ id: doc.id }, u));
    }
    return users;
  }
}

export const profileService = new ProfileService();
