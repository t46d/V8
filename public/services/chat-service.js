import { getFirebase } from './firebase-config.js';
import { authService } from './auth-service.js';

export class ChatService {
  constructor() {
    this.firebase = getFirebase();
    this.db = this.firebase.db;
    this.auth = this.firebase.auth;
  }

  async startChat(otherUserId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    const chatId = [currentUser.uid, otherUserId].sort().join('_');
    await this.db.collection('chats').doc(chatId).set({ participants: [currentUser.uid, otherUserId], lastMessage: '', createdAt: new Date() }, { merge: true });
    return chatId;
  }

  async sendMessage(chatId, messageText) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    const userDoc = await this.db.collection('users').doc(currentUser.uid).get();
    const userData = userDoc.data ? userDoc.data() : {};
    const msgRef = await this.db.collection('chats').doc(chatId).collection('messages').add({ text: messageText, senderId: currentUser.uid, senderName: userData.displayName || 'User', timestamp: Date.now(), read: false, type: 'text' });
    await this.db.collection('chats').doc(chatId).update({ lastMessage: messageText, lastMessageTime: Date.now() });
    return msgRef.id;
  }

  async getChatHistory(chatId, limit = 50) {
    const snapshot = await this.db.collection('chats').doc(chatId).collection('messages').orderBy('timestamp', 'desc').limit(limit).get();
    const messages = (snapshot.docs || []).map(d => ({ id: d.id, ...(d.data || d.data()) }));
    return messages.reverse();
  }

  async getUserChats() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return [];
    const snapshot = await this.db.collection('chats').where('participants', 'array-contains', currentUser.uid).orderBy('lastMessageTime', 'desc').limit(20).get();
    const chats = [];
    for (const doc of snapshot.docs) {
      const chatData = doc.data;
      chats.push({ id: doc.id, ...chatData });
    }
    return chats;
  }
}

export const chatService = new ChatService();
