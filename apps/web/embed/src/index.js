import './styles.css';

const DEFAULT_CONFIG = {
  apiUrl: 'http://localhost:3001',
  // userId: null, // Removed legacy authentication
  title: 'Sales Assistant',
  primaryColor: '#2563eb',
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
    this.isTyping = false;
    this.messages = [];
    this.sessionId = generateUUID(); // Generate unique session ID
    this.hasInteracted = false; // Track if user has sent any messages
    
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
    // Merge remote config if chatbotId is present
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
    
    // Add greeting
    this.addMessage({ type: 'bot', text: this.config.greeting });
  }

  setupSessionLifecycle() {
    // End session when page is about to unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Also end session when page becomes hidden (mobile tab switch, etc.)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.hasInteracted) {
        this.endSession();
      }
    });
  }

  async endSession() {
    // Only end session if user has actually interacted
    if (!this.hasInteracted || !this.sessionId) return;

    try {
      // Use sendBeacon for reliable delivery during page unload
      const data = JSON.stringify({ sessionId: this.sessionId });
      const url = `${this.config.apiUrl}/api/v1/chat/session/end`;
      
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
      } else {
        // Fallback for browsers without sendBeacon
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
          keepalive: true
        });
      }
    } catch (e) {
      // Silently fail - session end is best-effort
      console.error("Bot Daddy: Failed to end session", e);
    }
  }

  createStyles() {
    // Styles are injected via style-loader -> inserted into head
  }

  createWidget() {
    const container = document.createElement('div');
    container.className = 'bd-widget-container';
    
    // Dynamic styles for header and button based on config.color
    const primaryColor = this.config.color || this.config.primaryColor;
    const textColor = this.getContrastColor(primaryColor);

    container.innerHTML = `
      <style>
        .bd-header { background: ${primaryColor} !important; color: ${textColor} !important; }
        .bd-header-title { color: ${textColor} !important; }
        .bd-header-close { color: ${textColor} !important; }
        .bd-send-btn:not(:disabled) { background-color: ${primaryColor} !important; color: ${textColor} !important; }
        .bd-toggle-btn { background-color: ${primaryColor} !important; color: ${textColor} !important; }
         /* Add a slight tint for user messages if desired, or keep default */
      </style>
      <div class="bd-chat-window">
        <div class="bd-header">
          <div class="bd-header-title">${this.config.title}</div>
          <button class="bd-header-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="bd-messages">
          <div class="bd-typing">
            <div class="bd-dot"></div>
            <div class="bd-dot"></div>
            <div class="bd-dot"></div>
          </div>
        </div>
        <div class="bd-input-area">
          <input type="text" class="bd-input" placeholder="Type your message..." />
          <button class="bd-send-btn" disabled>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
      <button class="bd-toggle-btn" style="background-color: ${primaryColor} !important;">
        <div class="bd-icon bd-icon-msg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <div class="bd-icon bd-icon-close" style="opacity: 0; transform: scale(0.5);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </div>
      </button>
    `;

    document.body.appendChild(container);

    this.elements = {
      container,
      window: container.querySelector('.bd-chat-window'),
      messagesContainer: container.querySelector('.bd-messages'),
      typingIndicator: container.querySelector('.bd-typing'),
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
      this.elements.sendBtn.disabled = !e.target.value.trim();
    });

    this.elements.input.addEventListener('keypress', (e) => {
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

  addMessage(msg) {
    const div = document.createElement('div');
    div.className = `bd-message ${msg.type}`;
    div.textContent = msg.text;
    
    // Inline style for user message background if we want it to match theme
    if (msg.type === 'user') {
         const primaryColor = this.config.color || this.config.primaryColor;
         div.style.backgroundColor = primaryColor;
         div.style.color = this.getContrastColor(primaryColor);
    }

    this.elements.messagesContainer.insertBefore(div, this.elements.typingIndicator);
    this.scrollToBottom();
  }

  setTyping(typing) {
    this.isTyping = typing;
    if (typing) {
      this.elements.typingIndicator.classList.add('active');
    } else {
      this.elements.typingIndicator.classList.remove('active');
    }
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
  }

  async sendMessage() {
    const text = this.elements.input.value.trim();
    if (!text) return;

    this.elements.input.value = '';
    this.elements.sendBtn.disabled = true;
    this.hasInteracted = true; // Mark that user has interacted

    this.addMessage({ type: 'user', text });
    this.setTyping(true);

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
            sessionId: this.sessionId // Include session ID for tracking
        }),
      });

      if (!response.ok) {
        throw new Error('Network error');
      }

      const data = await response.json();
      
      this.setTyping(false);
      
      if (data.answer) {
        this.addMessage({ type: 'bot', text: data.answer });
      } else if (data.error) {
        this.addMessage({ type: 'error', text: data.error });
      } else {
        // Fallback
        this.addMessage({ type: 'bot', text: "Received an empty response." });
      }
      
    } catch (error) {
      console.error('Bot Daddy Error:', error);
      this.setTyping(false);
      this.addMessage({ type: 'error', text: 'Sorry, I encounted an error. Is the server running?' });
    }
  }

  getContrastColor(hexColor) {
    // Basic hex validation/normalization
    if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
    
    let hex = hexColor.replace('#', '');
    
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    if (hex.length !== 6) return '#ffffff';

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate luminance
    // Formula: L = 0.299*R + 0.587*G + 0.114*B
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    return (yiq >= 128) ? '#000000' : '#ffffff';
  }
}

window.BotDaddy = {
  init: (config) => new BotDaddy(config)
};

