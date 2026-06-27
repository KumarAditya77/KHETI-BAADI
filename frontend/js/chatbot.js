// DOM Elements
const chatbotContainer = document.querySelector('.chatbot-container');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-btn');
const toggleButton = document.getElementById('chatbot-toggle');
const minimizeButton = document.querySelector('.minimize-btn');
const suggestionButtons = document.querySelectorAll('.suggestion-btn');

let isChatOpen = false;

// Toggle chat
function toggleChat() {
    isChatOpen = !isChatOpen;
    chatbotContainer.classList.toggle('visible');
    if (isChatOpen) userInput.focus();
}

function formatMarkdown(text) {
    if (!text) return "";
    
    // Escape HTML first to prevent XSS
    let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
        
    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    // Italic: *text*
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    
    // Bullet points: * item or - item at the start of a line
    html = html.replace(/^\s*[\*\-]\s+(.*)$/gmi, "<li>$1</li>");
    
    // Newlines to br
    html = html.replace(/\n/g, "<br>");
    
    return html;
}

// Add message
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    const formattedContent = isUser 
        ? content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") 
        : formatMarkdown(content);

    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${isUser ? "user" : "robot"}"></i>
        </div>
        <div class="message-content">${formattedContent}</div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

// Typing indicator
function showTypingIndicator() {
    const div = document.createElement("div");
    div.id = "typing";
    div.className = "message bot-message";
    div.innerHTML = `<div class="message-content">Typing...</div>`;
    chatMessages.appendChild(div);
}

function removeTypingIndicator() {
    const el = document.getElementById("typing");
    if (el) el.remove();
}

// 🚀 BACKEND CALL (FINAL FIXED)
async function sendMessageToAI(message) {

    addMessage(message, true);
    showTypingIndicator();

    const langSelector = document.getElementById('lang-selector');
    const languageMap = {
        en: 'English',
        hi: 'Hindi',
        pa: 'Punjabi',
        bn: 'Bengali'
    };
    const langCode = langSelector ? langSelector.value : 'en';
    const language = languageMap[langCode] || 'English';

    try {
        const response = await fetch("http://localhost:3000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message, language })
        });

        const data = await response.json();
        console.log("BACKEND RESPONSE:", data);

        removeTypingIndicator();

        // ❌ backend error
        if (!response.ok) {
            addMessage(`⚠️ Server error (${response.status})`, false);
            return;
        }

        if (data.error) {
            addMessage(`⚠️ ${data.error}`, false);
            return;
        }

        // ❌ empty reply
        if (!data.reply) {
            addMessage("⚠️ No response from AI", false);
            return;
        }

        // ✅ success
        addMessage(data.reply, false);

    } catch (error) {
        removeTypingIndicator();
        addMessage("⚠️ Cannot connect to backend", false);
        console.error("FETCH ERROR:", error);
    }
}

// Input handler
function handleUserInput() {
    const msg = userInput.value.trim();
    if (!msg) return;

    userInput.value = "";
    sendMessageToAI(msg);
}

// Events
if (toggleButton) toggleButton.addEventListener('click', toggleChat);
if (minimizeButton) minimizeButton.addEventListener('click', toggleChat);

const openChatbotNav = document.getElementById('open-chatbot');
if (openChatbotNav) {
    openChatbotNav.addEventListener('click', (e) => {
        e.preventDefault();
        toggleChat();
    });
}

if (sendButton) sendButton.addEventListener('click', handleUserInput);

if (userInput) {
    userInput.addEventListener('keypress', (e) => {
        if (e.key === "Enter") handleUserInput();
    });
}

// Suggestions
suggestionButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        userInput.value = btn.textContent;
        handleUserInput();
    });
});

// Welcome message
window.addEventListener('load', () => {
    // Add a small delay for better UX
    setTimeout(() => {
        addMessage(
            "🌾 Namaste! I'm your Kheti Baadi AI Assistant. Ask me anything about farming.",
            false
        );
    }, 800);
});