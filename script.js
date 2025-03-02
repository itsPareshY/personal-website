'use strict';

// Security utility functions
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
};

const isValidInput = (input, maxLength = 100) => {
    return typeof input === 'string' && 
           input.trim().length > 0 && 
           input.length <= maxLength &&
           !/[<>{}]/g.test(input); // Basic XSS protection
};

// Rate limiting utility
const createRateLimiter = (limit, interval) => {
    const requests = new Map();
    
    return (key) => {
        const now = Date.now();
        const windowStart = now - interval;
        
        // Clean old entries
        requests.forEach((timestamp, reqKey) => {
            if (timestamp < windowStart) requests.delete(reqKey);
        });
        
        // Check current requests
        const currentCount = Array.from(requests.values())
            .filter(timestamp => timestamp > windowStart)
            .length;
            
        if (currentCount >= limit) return false;
        
        requests.set(key, now);
        return true;
    };
};

// Initialize rate limiters
const messageRateLimiter = createRateLimiter(5, 10000); // 5 messages per 10 seconds
const formRateLimiter = createRateLimiter(2, 60000);   // 2 form submissions per minute

document.addEventListener('DOMContentLoaded', () => {
    // Form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Rate limiting
            if (!formRateLimiter('submit')) {
                alert('Please wait a moment before submitting again.');
                return;
            }

            const name = document.getElementById('name')?.value.trim() ?? '';
            const email = document.getElementById('email')?.value.trim() ?? '';
            const message = document.getElementById('message')?.value.trim() ?? '';

            // Enhanced validation
            if (!isValidInput(name, 100) || !isValidInput(email, 100) || !isValidInput(message, 1000)) {
                alert('Please check your input and try again.');
                return;
            }

            // Email validation
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }

            // Since this is a static site, show success message
            alert('Thank you for your message! This is a static site, so no message was actually sent.');
            contactForm.reset();
        });
    }

    // Chatbot functionality
    const elements = {
        chatBubble: document.getElementById('chatBubble'),
        chatWindow: document.getElementById('chatWindow'),
        closeChat: document.getElementById('closeChat'),
        userInput: document.getElementById('userInput'),
        sendMessage: document.getElementById('sendMessage'),
        chatMessages: document.getElementById('chatMessages')
    };

    // Validate all elements exist
    if (!Object.values(elements).every(Boolean)) {
        console.error('Some chat elements are missing');
        return;
    }

    // Chat window toggle with security checks
    const toggleChat = () => {
        if (elements.chatWindow) {
            elements.chatWindow.style.display = 
                elements.chatWindow.style.display === 'none' || 
                elements.chatWindow.style.display === '' ? 'flex' : 'none';
        }
    };

    elements.chatBubble?.addEventListener('click', toggleChat);
    elements.closeChat?.addEventListener('click', toggleChat);

    // Secure message handling
    const addMessage = (text, sender) => {
        if (!isValidInput(text, 500) || !['user', 'bot'].includes(sender)) {
            console.error('Invalid message format');
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text; // Safe from XSS

        if (elements.chatMessages) {
            elements.chatMessages.appendChild(messageDiv);
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

            // Limit number of messages
            while (elements.chatMessages.children.length > 50) {
                elements.chatMessages.removeChild(elements.chatMessages.firstChild);
            }
        }
    };

    // Send message with rate limiting
    const sendUserMessage = () => {
        if (!messageRateLimiter('message')) {
            addMessage("Please wait a moment before sending more messages.", 'bot');
            return;
        }

        const message = elements.userInput?.value.trim() ?? '';
        
        if (isValidInput(message, 500)) {
            const sanitizedMessage = sanitizeInput(message);
            addMessage(sanitizedMessage, 'user');
            
            if (elements.userInput) {
                elements.userInput.value = '';
            }

            // Simulate bot response
            setTimeout(() => {
                const botResponse = getBotResponse(sanitizedMessage);
                addMessage(botResponse, 'bot');
            }, 1000);
        }
    };

    // Event listeners
    elements.sendMessage?.addEventListener('click', sendUserMessage);
    elements.userInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendUserMessage();
        }
    });

    // Secure bot responses
    const getBotResponse = (message) => {
        if (!isValidInput(message)) return "I couldn't understand that message.";
        
        message = message.toLowerCase();
        const responses = new Map([
            ['hello', "Hello! How can I help you today?"],
            ['hi', "Hello! How can I help you today?"],
            ['name', "I'm a chatbot assistant for Paresh's website!"],
            ['contact', "You can use the contact form above to get in touch."],
            ['about', "I help visitors navigate this website."],
            ['portfolio', "Check out the portfolio section above!"]
        ]);

        for (const [key, response] of responses) {
            if (message.includes(key)) {
                return response;
            }
        }
        
        return "I'm not sure about that. Please use the contact form for specific inquiries.";
    };

    // Welcome message
    setTimeout(() => {
        addMessage("👋 Hi there! How can I help you today?", 'bot');
    }, 1000);
});
