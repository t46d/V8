import { getFirebase } from './firebase-config.js';
import { authService } from './auth-service.js';

export class ChatService {
  constructor() {
    this.firebase = getFirebase();
    this.db = this.firebase.db;
    this.auth = this.firebase.auth;
    this.currentChatId = null;
    this.unsubscribe = null;
  }

  // Start a new chat or get existing chat
  async startChat(otherUserId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const chatId = [currentUser.uid, otherUserId].sort().join('_');
    
    // Create or update chat document
    await this.db.collection('chats').doc(chatId).set({
      participants: [currentUser.uid, otherUserId],
      lastMessage: '',
      lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    this.currentChatId = chatId;
    return chatId;
  }

  // Send message
  async sendMessage(chatId, messageText) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Get user data for sender name
    const userDoc = await this.db.collection('users').doc(currentUser.uid).get();
    const userData = userDoc.data();

    // Add message to subcollection
    const messageRef = await this.db.collection('chats').doc(chatId)
      .collection('messages').add({
        text: messageText,
        senderId: currentUser.uid,
        senderName: userData.displayName || 'User',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        read: false,
        type: 'text'
      });

    // Update chat metadata
    await this.db.collection('chats').doc(chatId).update({
      lastMessage: messageText,
      lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return messageRef.id;
  }

  // Listen to messages in real-time
  subscribeToMessages(chatId, callback) {
    // Unsubscribe from previous listener
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    this.unsubscribe = this.db.collection('chats').doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot((snapshot) => {
        const messages = [];
        snapshot.forEach(doc => {
          messages.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(messages);
      });

    return this.unsubscribe;
  }

  // Get chat history
  async getChatHistory(chatId, limit = 50) {
    const snapshot = await this.db.collection('chats').doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const messages = [];
    snapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return messages.reverse();
  }

  // Get user's chats
  async getUserChats() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      return [];
    }

    const snapshot = await this.db.collection('chats')
      .where('participants', 'array-contains', currentUser.uid)
      .orderBy('lastMessageTime', 'desc')
      .limit(20)
      .get();

    const chats = [];
    for (const doc of snapshot.docs) {
      const chatData = doc.data();
      const otherUserId = chatData.participants.find(id => id !== currentUser.uid);
      
      if (otherUserId) {
        const userDoc = await this.db.collection('users').doc(otherUserId).get();
        if (userDoc.exists) {
          chats.push({
            id: doc.id,
            ...chatData,
            otherUser: userDoc.data()
          });
        }
      }
    }

    return chats;
  }

  // Mark messages as read
  async markAsRead(chatId, messageIds) {
    const batch = this.db.batch();
    
    messageIds.forEach(messageId => {
      const messageRef = this.db.collection('chats').doc(chatId)
        .collection('messages').doc(messageId);
      batch.update(messageRef, { read: true });
    });

    await batch.commit();
  }
}

// Create singleton instance
export const chatService = new ChatService();
