import './styles.css';
import { marked } from 'marked';


const DEFAULT_CONFIG = {
  apiUrl: 'http://localhost:3001',
  title: 'Sales Assistant',
  primaryColor: '#000000', 
  greeting: 'Hi! How can I help you today?',
};

// Generate a UUID v4 for session tracking
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class BotDaddy {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.isOpen = false;
    this.messages = [];
    this.sessionId = generateUUID();
    this.hasInteracted = false;
    this.currentTypingRow = null; 
    
    // Typewriter state
    this.typewriterQueue = [];
    this.isProcessingQueue = false;
    this.currentStreamText = '';
    this.currentStreamContentDiv = null;

    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._init());
    } else {
      this._init();
    }
  }

  async _init() {
    if (this.config.chatbotId) {
      try {
        const response = await fetch(`${this.config.apiUrl}/api/v1/chatbot/public/${this.config.chatbotId}`);
        if (response.ok) {
          const remoteConfig = await response.json();
          this.config = { 
            ...this.config, 
            ...remoteConfig,
            title: remoteConfig.name || this.config.title,
            primaryColor: remoteConfig.color || this.config.primaryColor
          };
        } else {
             console.error("Bot Daddy: Failed to load chatbot config");
        }
      } catch (e) {
        console.error("Bot Daddy: Error loading config", e);
      }
    }

    this.createStyles();
    this.createWidget();
    this.setupEventListeners();
    this.setupSessionLifecycle();
    
    this.addMessage({ type: 'bot', text: this.config.greeting });
  }

  setupSessionLifecycle() {
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.hasInteracted) {
        this.endSession();
      }
    });
  }

  async endSession() {
    if (!this.hasInteracted || !this.sessionId) return;

    try {
      const data = JSON.stringify({ sessionId: this.sessionId });
      const url = `${this.config.apiUrl}/api/v1/chat/session/end`;
      
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
      } else {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
          keepalive: true
        });
      }
    } catch (e) {
      console.error("Bot Daddy: Failed to end session", e);
    }
  }

  createStyles() {
    // Styles are injected via style-loader
  }

  getContrastColor(hexColor) {
    if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
    let hex = hexColor.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length !== 6) return '#ffffff';
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  }

  createWidget() {
    const container = document.createElement('div');
    container.className = 'bd-widget-container';
    
    const primaryColor = this.config.color || this.config.primaryColor;
    const contrastColor = this.getContrastColor(primaryColor);
    
    container.style.setProperty('--bd-primary', primaryColor);
    container.style.setProperty('--bd-on-primary', contrastColor);

    const icons = {
        close: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
        send: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
        msg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
    };

    container.innerHTML = `
      <div class="bd-chat-window">
        <div class="bd-header">
          <div class="bd-header-title">${this.config.title}</div>
          <button class="bd-header-close" aria-label="Close chat">
            ${icons.close}
          </button>
        </div>
        <div class="bd-messages"></div>
        <div class="bd-input-container">
            <div class="bd-input-wrapper">
                <textarea class="bd-input" placeholder="Message..." rows="1"></textarea>
                <button class="bd-send-btn" disabled aria-label="Send message">
                    ${icons.send}
                </button>
            </div>
        </div>
      </div>
      <button class="bd-toggle-btn">
        <div class="bd-icon bd-icon-msg">
          ${icons.msg}
        </div>
        <div class="bd-icon bd-icon-close" style="opacity: 0; transform: scale(0.5);">
          ${icons.close}
        </div>
      </button>
    `;

    document.body.appendChild(container);

    this.elements = {
      container,
      window: container.querySelector('.bd-chat-window'),
      messagesContainer: container.querySelector('.bd-messages'),
      input: container.querySelector('.bd-input'),
      sendBtn: container.querySelector('.bd-send-btn'),
      toggleBtn: container.querySelector('.bd-toggle-btn'),
      closeBtn: container.querySelector('.bd-header-close'),
      iconMsg: container.querySelector('.bd-icon-msg'),
      iconClose: container.querySelector('.bd-icon-close'),
    };
  }

  setupEventListeners() {
    this.elements.toggleBtn.addEventListener('click', () => this.toggle());
    this.elements.closeBtn.addEventListener('click', () => this.toggle());
    
    this.elements.input.addEventListener('input', (e) => {
        const target = e.target;
        target.style.height = 'auto'; 
        target.style.height = Math.min(target.scrollHeight, 120) + 'px';
        this.elements.sendBtn.disabled = !target.value.trim();
    });

    this.elements.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.elements.window.classList.add('open');
      this.elements.iconMsg.style.opacity = '0';
      this.elements.iconMsg.style.transform = 'scale(0.5)';
      this.elements.iconClose.style.opacity = '1';
      this.elements.iconClose.style.transform = 'scale(1)';
      setTimeout(() => this.elements.input.focus(), 100);
    } else {
      this.elements.window.classList.remove('open');
      this.elements.iconMsg.style.opacity = '1';
      this.elements.iconMsg.style.transform = 'scale(1)';
      this.elements.iconClose.style.opacity = '0';
      this.elements.iconClose.style.transform = 'scale(0.5)';
    }
  }

  getAvatarIcon(type) {
      if (type === 'bot') {
          return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path></svg>`;
      }
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
  }

  addMessage(msg, isTyping = false) {
    const row = document.createElement('div');
    row.className = `bd-message-row ${msg.type}`;
    
    const avatar = document.createElement('div');
    avatar.className = `bd-avatar ${msg.type}`;
    avatar.innerHTML = this.getAvatarIcon(msg.type);

    let content;
    if (isTyping) {
        content = document.createElement('div');
        content.className = 'bd-typing-bubble';
        content.innerHTML = `
            <div class="bd-dot"></div>
            <div class="bd-dot"></div>
            <div class="bd-dot"></div>
        `;
    } else {
        content = document.createElement('div');
        content.className = 'bd-message-content';
        
        if (msg.type === 'bot') {
            content.innerHTML = marked.parse(msg.text);
        } else {
            content.textContent = msg.text; 
        }
    }
    
    row.appendChild(avatar);
    row.appendChild(content);

    this.elements.messagesContainer.appendChild(row);
    this.scrollToBottom();
    
    return { row, content }; 
  }

  showTyping() {
      if (this.currentTypingRow) return;
      const { row } = this.addMessage({ type: 'bot' }, true);
      this.currentTypingRow = row;
      this.scrollToBottom();
  }

  removeTyping() {
      if (this.currentTypingRow) {
          this.currentTypingRow.remove();
          this.currentTypingRow = null;
      }
  }

  scrollToBottom() {
    const messages = this.elements.messagesContainer;
    messages.scrollTop = messages.scrollHeight;
  }

  async processTypewriter() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.typewriterQueue.length > 0) {
      if (!this.currentStreamContentDiv) {
          this.typewriterQueue = [];
          break;
      }

      const char = this.typewriterQueue.shift();
      this.currentStreamText += char;
      
      this.currentStreamContentDiv.innerHTML = marked.parse(this.currentStreamText);
      this.scrollToBottom();

      let delay = 15;
      if (this.typewriterQueue.length > 50) delay = 5;
      if (this.typewriterQueue.length > 100) delay = 2;
      
      await new Promise(r => setTimeout(r, delay));
    }

    this.isProcessingQueue = false;
  }

  async sendMessage() {
    const text = this.elements.input.value.trim();
    if (!text) return;

    this.elements.input.value = '';
    this.elements.input.style.height = 'auto'; 
    this.elements.sendBtn.disabled = true;
    this.hasInteracted = true;

    this.addMessage({ type: 'user', text });
    this.showTyping();

    try {
      const response = await fetch(`${this.config.apiUrl}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            query: text, 
            apiKey: this.config.apiKey,
            chatbotId: this.config.chatbotId,
            sessionId: this.sessionId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to connect to assistant');
      }

      // DO NOT REMOVE TYPING YET
      // We keep the typing row and bubbles until the first token arrives.
      
      const contentDiv = this.currentTypingRow.querySelector('.bd-typing-bubble');
      // Store references
      this.currentStreamContentDiv = contentDiv;
      this.currentStreamText = '';
      this.typewriterQueue = [];
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let isFirstToken = true; // Flag to track first token

      while (true) {
        const { done, value } = await reader.read();
        
        if (value) {
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
                
                const dataStr = trimmedLine.slice(6);
                if (dataStr === '[DONE]') continue;
                
                try {
                    const data = JSON.parse(dataStr);
                    if (data.text) {
                        // ON FIRST TOKEN: Swap class and clear dots
                        if (isFirstToken) {
                            contentDiv.className = 'bd-message-content';
                            contentDiv.innerHTML = ''; // Clear dots
                            this.currentTypingRow = null; // Typing is effectively done/converted
                            isFirstToken = false;
                        }

                        // Push characters to queue instead of rendering directly
                        const chars = data.text.split('');
                        this.typewriterQueue.push(...chars);
                        this.processTypewriter(); 
                    }
                    if (data.error) throw new Error(data.error);
                } catch (e) {
                    console.warn('Bot Daddy: Error parsing SSE data', e);
                }
            }
        }

        if (done) break;
      }
      
    } catch (error) {
      console.error('Bot Daddy Error:', error);
      this.removeTyping(); 
      this.addMessage({ type: 'error', text: error.message || 'Sorry, I encountered an error.' });
    } finally {
      this.elements.sendBtn.disabled = false;
    }
  }
}

window.BotDaddy = {
  init: (config) => new BotDaddy(config)
};
