export default class ChatWindow {
  constructor(container) {
    this.container = container;
  }

  render(messages = []) {
    this.container.innerHTML = `
      <div class="chat-window glass-card">
        <div class="messages" style="max-height:400px; overflow:auto; margin-bottom:10px;">
          ${messages.map(m => `<div><strong>${m.senderName || 'User'}:</strong> ${m.text}</div>`).join('')}
        </div>
        <div style="display:flex; gap:8px;">
          <input id="chatInput" style="flex:1; padding:8px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); background:transparent; color:inherit;" placeholder="Type a message...">
          <button id="sendBtn" class="btn-primary">Send</button>
        </div>
      </div>
    `;

    const sendBtn = this.container.querySelector('#sendBtn');
    const input = this.container.querySelector('#chatInput');
    sendBtn.addEventListener('click', () => {
      const ev = new CustomEvent('chat:send', { detail: { text: input.value } });
      window.dispatchEvent(ev);
      input.value = '';
    });
  }
}
