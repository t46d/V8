import { getFirebase } from './firebase-config.js';
import { authService } from './auth-service.js';

export class ProfileService {
  constructor() {
    this.firebase = getFirebase();
    this.db = this.firebase.db;
    this.storage = this.firebase.storage;
  }

  // Get user profile
  async getUserProfile(uid = null) {
    const currentUser = authService.getCurrentUser();
    const userId = uid || currentUser?.uid;
    
    if (!userId) {
      throw new Error('User ID required');
    }

    const userDoc = await this.db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  }

  // Update profile
  async updateProfile(profileData) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const updates = {
      ...profileData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Update in Firestore
    await this.db.collection('users').doc(currentUser.uid).update(updates);

    // Update Firebase Auth display name if provided
    if (profileData.displayName) {
      await currentUser.updateProfile({
        displayName: profileData.displayName
      });
    }

    return { success: true };
  }

  // Upload profile picture
  async uploadProfilePicture(file) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size must be less than 5MB');
    }

    // Create unique filename
    const timestamp = Date.now();
    const fileName = `profile_${timestamp}_${file.name}`;
    const storagePath = `profile_pictures/${currentUser.uid}/${fileName}`;

    // Upload to Firebase Storage
    const storageRef = this.storage.ref(storagePath);
    await storageRef.put(file);

    // Get download URL
    const downloadURL = await storageRef.getDownloadURL();

    // Update user profile with new photo URL
    await this.db.collection('users').doc(currentUser.uid).update({
      photoURL: downloadURL,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return downloadURL;
  }

  // Add social media link
  async addSocialLink(platform, url) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    await this.db.collection('users').doc(currentUser.uid).update({
      [`socialLinks.${platform}`]: url,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  }

  // Delete account
  async deleteAccount() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Confirm deletion
    if (!confirm('Are you sure? This will permanently delete your account and all data.')) {
      return { success: false, message: 'Cancelled' };
    }

    try {
      const userId = currentUser.uid;

      // Delete user data from Firestore
      await this.db.collection('users').doc(userId).delete();

      // Delete profile pictures from Storage
      const storageRef = this.storage.ref(`profile_pictures/${userId}`);
      try {
        const listResult = await storageRef.listAll();
        const deletePromises = listResult.items.map(item => item.delete());
        await Promise.all(deletePromises);
      } catch (storageError) {
        console.warn('Could not delete storage files:', storageError);
      }

      // Delete user from Firebase Auth
      await currentUser.delete();

      return { success: true, message: 'Account deleted successfully' };
    } catch (error) {
      console.error('Delete account error:', error);
      throw new Error('Failed to delete account: ' + error.message);
    }
  }

  // Get nearby users (simplified version)
  async getNearbyUsers(radius = 50, limit = 20) {
    // In a real app, you would use geospatial queries
    // This is a simplified version
    
    const snapshot = await this.db.collection('users')
      .where('online', '==', true)
      .limit(limit)
      .get();

    const users = [];
    snapshot.forEach(doc => {
      const user = doc.data();
      const currentUser = authService.getCurrentUser();
      
      if (user.uid !== currentUser?.uid) {
        // Add random distance for demo
        user.distance = (Math.random() * 10).toFixed(1) + ' km';
        users.push({
          id: doc.id,
          ...user
        });
      }
    });

    return users;
  }
}

// Create singleton instance
export const profileService = new ProfileService();
