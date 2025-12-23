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
      // Initialize Firebase or mock
      const firebase = initializeFirebase();
      if (!firebase) {
        throw new Error('Failed to initialize Firebase');
      }

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

      this.loadLanguage();
      setTimeout(this.hideAgeWarning, 10000);
      this.initialized = true;
      console.log('App initialized');
    } catch (error) {
      console.error('App init error', error);
    }
  }

  loadLanguage() {
    const savedLang = localStorage.getItem('vexachat_language') || 'en';
    this.changeLanguage(savedLang);
  }

  changeLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('vexachat_language', lang);
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('[data-lang]').forEach(el => {
      const key = el.getAttribute('data-lang');
      el.style.display = key === lang ? 'inline' : 'none';
    });
  }

  hideAgeWarning() {
    const warning = document.getElementById('ageWarning');
    if (warning) {
      warning.style.display = 'none';
    }
  }

  async loadUserProfile() {
    try {
      if (!this.currentUser) return;
      const profile = await profileService.getUserProfile(this.currentUser.uid).catch(()=>null);
      this.userProfile = profile || { displayName: this.currentUser.displayName || 'Guest' };
      return profile;
    } catch (e) { console.warn(e); }
  }

  renderAuthScreen() {
    const appElement = document.getElementById('app');
    appElement.innerHTML = `
      <div class="auth-container glass-card" style="max-width: 400px; margin: 100px auto; text-align: center;">
        <div class="vx-logo" style="font-size: 3rem; margin-bottom: 20px;">VX</div>
        <h2 style="margin-bottom: 30px; color: var(--primary-orange);">Welcome to VeXachat</h2>
        <button id="guestBtn" class="btn-primary" style="width:100%; margin-bottom:12px;">Continue as Guest</button>
      </div>
    `;
    document.getElementById('guestBtn').addEventListener('click', () => this.guestLogin());
  }

  renderApp() {
    const appElement = document.getElementById('app');
    appElement.innerHTML = `
      <header class="glass-header">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:12px; align-items:center;"><div class="vx-logo" style="width:40px;height:40px;background:var(--gradient-primary);border-radius:8px;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;">VX</div><h2 style="background:var(--gradient-primary);-webkit-background-clip:text;color:transparent;">VeXachat</h2></div>
          <div style="display:flex;gap:12px;align-items:center;"><img id="userAvatar" src="${this.userProfile?.photoURL||'https://api.dicebear.com/7.x/avataaars/svg?seed='+ (this.currentUser?.uid||'guest')}" style="width:40px;height:40px;border-radius:50%;border:2px solid var(--primary-orange);"></div>
        </div>
      </header>
      <div class="app-main" style="margin-top:80px;padding:20px;"><div id="mainContent"></div></div>
    `;
    this.showDiscover();
  }

  async showDiscover() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `<div style="max-width:1200px;margin:0 auto;"><h2 style="color:var(--primary-orange);">Discover Nearby People</h2><div id="discoverGrid">Loading...</div></div>`;
    const users = await profileService.getNearbyUsers().catch(()=>[]);
    const grid = document.getElementById('discoverGrid');
    if (!users || users.length===0) grid.innerHTML = '<p style="color:#666">No users found nearby</p>';
    else grid.innerHTML = users.map(u=>`<div class="glass-card" style="margin:8px;padding:12px;"><img src="${u.photoURL||'https://api.dicebear.com/7.x/avataaars/svg?seed='+u.id}" style="width:60px;height:60px;border-radius:50%;border:2px solid var(--primary-orange);margin-right:8px;"> <strong>${u.displayName||'User'}</strong> <div style="color:#666">${u.distance||'Nearby'}</div></div>`).join('');
  }

  async guestLogin() {
    const result = await authService.guestLogin();
    if (result.success) {
      this.currentUser = result.user;
      await this.loadUserProfile();
      this.renderApp();
    } else alert('Guest login failed');
  }

  async logout() {
    await authService.logout();
    this.renderAuthScreen();
  }
}

window.app = new VeXachatApp();
document.addEventListener('DOMContentLoaded', ()=> window.app.init());
