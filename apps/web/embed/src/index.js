import './styles.css';

const DEFAULT_CONFIG = {
  apiUrl: 'http://localhost:3001',
  title: 'Sales Assistant',
  primaryColor: '#2563eb',
  greeting: 'Hi! How can I help you today?',
};

class BotDaddy {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.isOpen = false;
    this.isTyping = false;
    this.messages = [];
    
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._init());
    } else {
      this._init();
    }
  }

  _init() {
    this.createStyles();
    this.createWidget();
    this.setupEventListeners();
    
    // Add greeting
    this.addMessage({ type: 'bot', text: this.config.greeting });
  }

  createStyles() {
    // Styles are injected via style-loader -> inserted into head
  }

  createWidget() {
    const container = document.createElement('div');
    container.className = 'bd-widget-container';
    
    container.innerHTML = `
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
      <button class="bd-toggle-btn">
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

    this.addMessage({ type: 'user', text });
    this.setTyping(true);

    try {
      const response = await fetch(`${this.config.apiUrl}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: text }),
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
}

window.BotDaddy = {
  init: (config) => new BotDaddy(config)
};


