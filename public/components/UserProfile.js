export default class UserProfile {
  constructor(container) {
    this.container = container;
  }

  render(profile = {}) {
    this.container.innerHTML = `
      <div class="user-profile glass-card" style="max-width:480px; margin:0 auto;">
        <img src="${profile.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}" class="profile-pic" alt="avatar">
        <h3>${profile.displayName || 'Unnamed'}</h3>
        <p>${profile.bio || ''}</p>
        <div style="display:flex; gap:8px; margin-top:12px;">
          <button class="btn-primary">Edit</button>
          <button class="btn-secondary" id="logoutBtn">Logout</button>
        </div>
      </div>
    `;

    const logoutBtn = this.container.querySelector('#logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => window.app && window.app.logout && window.app.logout());
  }
}
