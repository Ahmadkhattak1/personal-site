
(() => {
    // Prevent multiple injections
    if (window.screenChatDemoInjected) return;
    window.screenChatDemoInjected = true;

    // ScreenChat Demo Script
    // Adapted from content.js for standalone web demo

    // State
    let container = null;
    let isCapturing = false;
    let conversationHistory = [];
    let lastCapturedUrl = null;
    let currentScreenshot = null;
    let chatMode = 'ask'; // Default to 'ask'
    let messageCount = 0; // Track user messages
    const MAX_MESSAGES = 3;

    let userId = localStorage.getItem('sc_demo_userId') || 'demo_' + Math.floor(Math.random() * 1000000);
    localStorage.setItem('sc_demo_userId', userId);

    let sessionId = 'session_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    let sessionUrl = window.location.hostname;

    // Backend URL
    const API_BASE_URL = 'https://screenchat-backend-production.up.railway.app';
    // const API_BASE_URL = 'http://localhost:3000'; // Dev override

    // Initialize
    function init() {
        const host = document.createElement('div');
        host.id = 'screenchat-demo-root';
        document.body.appendChild(host);

        // Create UI
        createUI(host);
    }

    // Create UI Structure
    function createUI(host) {
        container = document.createElement('div');
        container.className = 'sc-container';

        // Icon URL
        const iconUrl = 'assets/icon48.webp';

        container.innerHTML = `
            <div class="sc-header">
                <div class="sc-header-left">
                    <img src="${iconUrl}" class="sc-logo" alt="Logo">
                    <span class="sc-title">ScreenChat Demo</span>
                </div>
                <div class="sc-controls">
                    <button class="sc-btn-icon" id="sc-new-chat" title="New Chat">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <div class="sc-settings-wrapper">
                        <button class="sc-btn-icon" id="sc-settings-btn" title="Settings">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <div class="sc-settings-dropdown" id="sc-settings-dropdown">
                            <button class="sc-settings-item" id="sc-profile-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                Personalize
                            </button>
                            <button class="sc-settings-item" id="sc-history-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                                History
                            </button>
                            <button class="sc-settings-item" id="sc-position-toggle">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 16l-4-4m0 0l4-4m-4 4h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                <span id="sc-position-label">Move to left</span>
                            </button>
                        </div>
                    </div>
                    <button class="sc-btn-icon" id="sc-minimize" title="Minimize">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 12H6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Upsell View -->
            <div class="sc-upsell-view" id="sc-upsell-view">
                <div class="sc-header">
                    <div class="sc-header-left">
                         <span class="sc-title" id="sc-upsell-header-title">Pro Feature</span>
                    </div>
                    <button class="sc-btn-icon" id="sc-upsell-close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    </button>
                </div>
                <div class="sc-upsell-content">
                    <svg class="sc-upsell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h3 class="sc-upsell-title" id="sc-upsell-title">Unlock Full History</h3>
                    <p class="sc-upsell-desc" id="sc-upsell-desc">Save your chats and personalize your AI experience with the full browser extension.</p>
                    <a href="#install" class="sc-upsell-btn" id="sc-upsell-btn">
                        Get ScreenChat for Browser
                    </a>
                </div>
            </div>

            <div class="sc-messages" id="sc-messages">
                <div class="sc-message ai">
                <div class="sc-bubble">
                        👋 Hi! This is a live demo of ScreenChat. 
                        <br><br>
                        I can see this page! Ask me about the design, content, or anything else.
                    </div>
                </div>
            </div>

            <div class="sc-input-area">
                 <div class="sc-mode-toggle" id="sc-mode-toggle">
                    <button class="sc-mode-btn" data-mode="agent" title="Execute tasks (Demo: Simulation only)">Agent</button>
                    <button class="sc-mode-btn active" data-mode="ask" title="Ask questions about this page">Ask</button>
                </div>
                <div class="sc-input-row">
                    <div class="sc-input-wrapper">
                        <textarea class="sc-textarea" id="sc-chat-input" placeholder="Ask me anything about this page..." rows="1"></textarea>
                    </div>
                    
                    <button class="sc-send-btn" id="sc-send" title="Send (Enter)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="sc-resize-handle" id="sc-resize-handle"></div>
            
            <!-- Launcher Icon (Visible only when minimized) -->
            <svg class="sc-launcher-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/>
            </svg>
        `;

        container.style.setProperty('--icon-url', `url(${iconUrl})`);
        host.appendChild(container);

        setupEventListeners(host);
    }

    function setupEventListeners(host) {
        const minimizeBtn = host.querySelector('#sc-minimize');
        const newChatBtn = host.querySelector('#sc-new-chat');
        const sendBtn = host.querySelector('#sc-send');
        const textarea = host.querySelector('#sc-chat-input');
        const messagesArea = host.querySelector('#sc-messages');
        const settingsBtn = host.querySelector('#sc-settings-btn');
        const settingsDropdown = host.querySelector('#sc-settings-dropdown');
        const positionToggleBtn = host.querySelector('#sc-position-toggle');
        const positionLabel = host.querySelector('#sc-position-label');

        // Upsell Elements
        const profileBtn = host.querySelector('#sc-profile-btn');
        const historyBtn = host.querySelector('#sc-history-btn');
        const upsellView = host.querySelector('#sc-upsell-view');
        const upsellClose = host.querySelector('#sc-upsell-close');
        const upsellTitle = host.querySelector('#sc-upsell-title');
        const upsellDesc = host.querySelector('#sc-upsell-desc');
        const upsellHeaderTitle = host.querySelector('#sc-upsell-header-title');
        const upsellBtn = host.querySelector('#sc-upsell-btn');

        // Helper: Show Upsell
        const showUpsell = (feature) => {
            if (feature === 'personalize') {
                upsellHeaderTitle.textContent = 'Personalization';
                upsellTitle.textContent = 'Tailor Your Experience';
                upsellDesc.textContent = 'Teach the AI about you, your preferences, and your work style with the full extension.';
            } else if (feature === 'history') {
                upsellHeaderTitle.textContent = 'Chat History';
                upsellTitle.textContent = 'Save Your Conversations';
                upsellDesc.textContent = 'Access past chats, solutions, and research anytime with the full extension.';
            } else if (feature === 'auth') {
                upsellHeaderTitle.textContent = 'Sign In';
                upsellTitle.textContent = 'Install to Continue';
                upsellDesc.textContent = 'To continue effective chatting and use advanced features, please install the extension.';
            } else if (feature === 'limit') {
                upsellHeaderTitle.textContent = 'Demo Limit Reached';
                upsellTitle.textContent = 'Unlimited Chatting';
                upsellDesc.textContent = 'You have reached the free demo limit. Install the extension for unlimited chats and more features.';
            } else if (feature === 'agent') {
                upsellHeaderTitle.textContent = 'Agent Mode';
                upsellTitle.textContent = 'Autonomous AI Agent';
                upsellDesc.textContent = 'Let the AI perform actions and browse the web for you. This advanced feature is available in the full extension.';
            }

            // Close dropdown if open
            if (settingsDropdown) settingsDropdown.classList.remove('visible');

            upsellView.classList.add('visible');
        }

        if (upsellClose) {
            upsellClose.addEventListener('click', () => {
                upsellView.classList.remove('visible');
            });
        }

        if (upsellBtn) {
            upsellBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Scroll to install section
                window.scrollTo({ top: 0, behavior: 'smooth' });
                upsellView.classList.remove('visible');
            });
        }

        // Settings Buttons -> Upsell
        if (profileBtn) profileBtn.addEventListener('click', () => showUpsell('personalize'));
        if (historyBtn) historyBtn.addEventListener('click', () => showUpsell('history'));

        // Settings Toggle
        if (settingsBtn && settingsDropdown) {
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                settingsDropdown.classList.toggle('visible');
            });
            document.addEventListener('click', () => settingsDropdown.classList.remove('visible'));
        }

        // Mode Toggle (Restricted for demo)
        const modeToggle = host.querySelector('#sc-mode-toggle');
        if (modeToggle) {
            const modeButtons = modeToggle.querySelectorAll('.sc-mode-btn');
            modeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const requestedMode = btn.dataset.mode;
                    if (requestedMode === 'agent') {
                        showUpsell('agent');
                        return;
                    }
                    chatMode = requestedMode;
                    modeButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    textarea.placeholder = 'Ask me anything about this page...';
                });
            });
        }

        // Position Toggle
        if (positionToggleBtn) {
            positionToggleBtn.addEventListener('click', () => {
                const root = document.getElementById('screenchat-demo-root');
                const isLeft = root.classList.toggle('sc-left');
                positionLabel.textContent = isLeft ? 'Move to right' : 'Move to left';
            });
        }

        // Minimize
        const toggleMinimize = (e) => {
            if (e) e.stopPropagation();
            container.classList.toggle('minimized');
        };
        minimizeBtn.addEventListener('click', toggleMinimize);
        container.addEventListener('click', (e) => {
            if (container.classList.contains('minimized')) toggleMinimize();
        });

        // Auto-resize textarea
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        });

        // Send Handler
        const handleSend = async () => {
            const text = textarea.value.trim();
            if (!text) return;

            // Check usage limit
            if (messageCount >= MAX_MESSAGES) {
                showUpsell('limit');
                return;
            }

            textarea.value = '';
            textarea.style.height = 'auto';

            addMessage(text, 'user');
            conversationHistory.push({ role: "user", content: text });
            messageCount++; // Increment usage

            // Capture Screenshot
            let screenshotDataUrl = null;
            try {
                // Determine if we need a screenshot (simple heuristic)
                if (!currentScreenshot || /\b(screen|page|design|look|see)\b/i.test(text)) {

                    // Hide chat for capture
                    container.style.visibility = 'hidden';
                    await new Promise(r => setTimeout(r, 100)); // wait for hide

                    // Use html2canvas
                    if (window.html2canvas) {
                        const canvas = await html2canvas(document.body, {
                            ignoreElements: (element) => element.id === 'screenchat-demo-root',
                            logging: false,
                            useCORS: true,
                            scale: 1 // Keep it light
                        });
                        screenshotDataUrl = canvas.toDataURL('image/jpeg', 0.6);
                        currentScreenshot = screenshotDataUrl;
                    }

                    container.style.visibility = 'visible';
                } else {
                    screenshotDataUrl = currentScreenshot; // Reuse last
                }
            } catch (e) {
                console.error("Capture failed", e);
                container.style.visibility = 'visible';
            }

            // Show loading
            const loadingId = addLoadingMessage();

            // Prepare Payload
            // Minimal context for demo
            const contextMsg = `[Page: ${window.location.href}]\n[Title: ${document.title}]`;

            const messagesPayload = conversationHistory.map((m, idx) => {
                if (idx === conversationHistory.length - 1 && m.role === 'user') {
                    return { role: 'user', content: `${contextMsg}\n\n${m.content}` };
                }
                return m;
            });

            try {
                const response = await fetch(`${API_BASE_URL}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: messagesPayload,
                        image: screenshotDataUrl,
                        userId: userId,
                        sessionId: sessionId,
                        sessionUrl: sessionUrl,
                        mode: 'ask', // Force ask mode for demo safety? Or allow 'agent' but it won't execute much.
                        screenshotType: 'viewport'
                    })
                });

                const data = await response.json();
                removeMessage(loadingId);

                // Parse reply
                let replyText = data.reply;
                try {
                    const parsed = JSON.parse(data.reply);
                    replyText = parsed.message || data.reply;
                } catch (e) { }

                addMessage(replyText, 'ai');
                conversationHistory.push({ role: "assistant", content: replyText });

            } catch (err) {
                removeMessage(loadingId);
                addMessage(`Demo Error: ${err.message}. Is the backend running?`, 'ai');
            }
        };

        sendBtn.addEventListener('click', handleSend);
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        // New Chat
        newChatBtn.addEventListener('click', () => {
            sessionId = 'session_' + Date.now();
            conversationHistory = [];
            currentScreenshot = null;
            messagesArea.innerHTML = `
                <div class="sc-message ai">
                    <div class="sc-bubble">
                        Session reset. What's on your mind?
                    </div>
                </div>
            `;
        });
    }

    // Helpers
    function addMessage(text, type) {
        const messagesArea = container.querySelector('#sc-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `sc-message ${type}`;

        // Basic formatting
        let formatted = text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        msgDiv.innerHTML = `
            <div class="sc-bubble">${formatted}</div>
            <div class="sc-timestamp">Just now</div>
        `;
        messagesArea.appendChild(msgDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    function addLoadingMessage() {
        const messagesArea = container.querySelector('#sc-messages');
        const id = 'loading-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.id = id;
        msgDiv.className = 'sc-message ai';
        msgDiv.innerHTML = `
            <div class="sc-bubble" style="font-style: italic; color: #666;">
                Thinking... <span class="typing-dots">...</span>
            </div>
        `;
        messagesArea.appendChild(msgDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
        return id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // Run
    // Check if we are on the right page? Or just run.
    init();

})();
