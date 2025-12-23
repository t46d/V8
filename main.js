import { initializeFirebase } from './services/firebase-config.js';
import { authService } from './services/auth-service.js';
import { chatService } from './services/chat-service.js';
import { profileService } from './services/profile-service.js';

class VeXachatApp {
  constructor() {
    this.currentUser = null;
    this.currentLanguage = 'en';
    this.initialized = false;
  }

  async init() {
    try {
      // Initialize Firebase
      const firebase = initializeFirebase();
      if (!firebase) {
        throw new Error('Failed to initialize Firebase');
      }

      // Set up auth state listener
      authService.onAuthStateChanged(async (user) => {
        if (user) {
          this.currentUser = user;
          await this.loadUserProfile();
          this.renderApp();
        } else {
          this.currentUser = null;
          this.renderAuthScreen();
        }
      });

      // Load saved language
      this.loadLanguage();
      
      // Auto-hide age warning
      setTimeout(this.hideAgeWarning, 10000);

      this.initialized = true;
      console.log('✅ VeXachat app initialized');
    } catch (error) {
      console.error('❌ App initialization error:', error);
      this.showError('Failed to initialize application');
    }
  }

  // Language System
  loadLanguage() {
    const savedLang = localStorage.getItem('vexachat_language') || 'en';
    this.changeLanguage(savedLang);
  }

  changeLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('vexachat_language', lang);
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.textContent.includes(lang.toUpperCase())) {
        btn.classList.add('active');
      }
    });
    
    // Update all translatable elements
    document.querySelectorAll('[data-lang]').forEach(element => {
      const langKey = element.getAttribute('data-lang');
      element.style.display = langKey === lang ? 'inline' : 'none';
    });
  }

  // UI Methods
  hideAgeWarning() {
    const warning = document.getElementById('ageWarning');
    if (warning) {
      warning.style.animation = 'fadeOut 0.5s ease forwards';
      setTimeout(() => {
        warning.style.display = 'none';
      }, 500);
    }
  }

  async loadUserProfile() {
    try {
      if (!this.currentUser) return;
      
      const profile = await profileService.getUserProfile(this.currentUser.uid);
      this.userProfile = profile;
      return profile;
    } catch (error) {
      console.error('Load profile error:', error);
      return null;
    }
  }

  // Render Methods
  renderAuthScreen() {
    const appElement = document.getElementById('app');
    appElement.innerHTML = `
      <div class="auth-container glass-card" style="max-width: 400px; margin: 100px auto; text-align: center;">
        <div class="vx-logo" style="font-size: 3rem; margin-bottom: 20px;">VX</div>
        <h2 style="margin-bottom: 30px; color: var(--primary-orange);">Welcome to VeXachat</h2>
        
        <button onclick="app.guestLogin()" class="btn-primary" style="width: 100%; margin-bottom: 15px;">
          <i class="fas fa-user-clock"></i> Continue as Guest
        </button>
        
        <button onclick="app.googleLogin()" class="btn-secondary" style="width: 100%; margin-bottom: 15px;">
          <i class="fab fa-google"></i> Sign in with Google
        </button>
        
        <div style="margin-top: 20px; color: #666;">
          <p>By continuing, you confirm you are 18+</p>
        </div>
      </div>
    `;
  }

  renderApp() {
    const appElement = document.getElementById('app');
    appElement.innerHTML = `
      <header class="glass-header">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div class="vx-logo" style="width: 40px; height: 40px; background: var(--gradient-primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">VX</div>
            <h2 style="background: var(--gradient-primary); -webkit-background-clip: text; background-clip: text; color: transparent;">VeXachat</h2>
          </div>
          
          <div style="display: flex; align-items: center; gap: 20px;">
            <button onclick="app.showDiscover()" class="nav-btn">
              <i class="fas fa-compass"></i> Discover
            </button>
            <button onclick="app.showChat()" class="nav-btn">
              <i class="fas fa-comments"></i> Messages
            </button>
            <div class="user-avatar" onclick="app.showProfile()" style="cursor: pointer;">
              <img id="userAvatar" src="${this.userProfile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + this.currentUser?.uid}" 
                   style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--primary-orange);">
            </div>
          </div>
        </div>
      </header>
      
      <div class="app-main" style="margin-top: 80px; padding: 20px;">
        <div id="mainContent">
          <!-- Content will be loaded here -->
        </div>
      </div>
    `;
    
    this.showDiscover();
  }

  async showDiscover() {
    const content = document.getElementById('mainContent');
    if (!content) return;
    
    content.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="margin-bottom: 20px; color: var(--primary-orange);">
          <i class="fas fa-users"></i> Discover Nearby People
        </h2>
        
        <button onclick="app.refreshDiscover()" class="btn-primary" style="margin-bottom: 30px;">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
        
        <div id="discoverGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
          Loading...
        </div>
      </div>
    `;
    
    await this.loadDiscoverUsers();
  }

  async loadDiscoverUsers() {
    try {
      const users = await profileService.getNearbyUsers();
      const grid = document.getElementById('discoverGrid');
      
      if (users.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #666;">No users found nearby</p>';
        return;
      }
      
      grid.innerHTML = users.map(user => `
        <div class="glass-card">
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
            <img src="${user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.uid}" 
                 style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid var(--primary-orange);">
            <div>
              <h4>${user.displayName || 'User'}</h4>
              <p style="color: var(--secondary-cyan); font-size: 0.9rem;">
                <i class="fas fa-map-marker-alt"></i> ${user.distance || 'Nearby'}
              </p>
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            <button onclick="app.likeUser('${user.id}')" class="btn-primary" style="flex: 1;">
              <i class="fas fa-heart"></i> Like
            </button>
            <button onclick="app.startChat('${user.id}')" class="btn-secondary" style="flex: 1;">
              <i class="fas fa-comment"></i> Chat
            </button>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Load discover error:', error);
      document.getElementById('discoverGrid').innerHTML = `
        <div style="text-align: center; color: #ff0000;">
          <p>Error loading users: ${error.message}</p>
        </div>
      `;
    }
  }

  // Action Methods
  async guestLogin() {
    const result = await authService.guestLogin();
    if (result.success) {
      this.currentUser = result.user;
      this.userProfile = result.user;
      this.renderApp();
    } else {
      this.showError(result.error);
    }
  }

  async googleLogin() {
    const result = await authService.googleLogin();
    if (result.success) {
      this.currentUser = result.user;
      await this.loadUserProfile();
      this.renderApp();
    } else {
      this.showError(result.error);
    }
  }

  async startChat(userId) {
    try {
      const chatId = await chatService.startChat(userId);
      this.showChatWindow(chatId);
    } catch (error) {
      this.showError('Failed to start chat: ' + error.message);
    }
  }

  showError(message) {
    alert('Error: ' + message);
  }
}

// Create global app instance
window.app = new VeXachatApp();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
