// Utility function for sanitizing input
const sanitizeInput = (input) => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
};

// Form validation
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            // Basic validation
            if (!name || !email || !message) {
                alert('Please fill in all fields');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }

            // Since this is a static site, we'll just show a success message
            alert('Thank you for your message! This is a static site, so no message was actually sent.');
            contactForm.reset();
        });
    }

    // Chatbot functionality
    const chatBubble = document.getElementById('chatBubble');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const userInput = document.getElementById('userInput');
    const sendMessage = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');

    if (!chatBubble || !chatWindow || !closeChat || !userInput || !sendMessage || !chatMessages) {
        console.error('Some chat elements are missing');
        return;
    }

    // Toggle chat window
    chatBubble.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'none' || chatWindow.style.display === '' ? 'flex' : 'none';
    });

    closeChat.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });

    // Send message function
    const sendUserMessage = () => {
        const message = userInput.value.trim();
        if (message && message.length <= 500) { // Limit message length
            const sanitizedMessage = sanitizeInput(message);
            addMessage(sanitizedMessage, 'user');
            userInput.value = '';
            // Simulate bot response
            setTimeout(() => {
                const botResponse = getBotResponse(sanitizedMessage);
                addMessage(botResponse, 'bot');
            }, 1000);
        }
    };

    // Event listeners for sending messages
    sendMessage.addEventListener('click', sendUserMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default to handle submission manually
            sendUserMessage();
        }
    });

    // Add message to chat
    const addMessage = (text, sender) => {
        if (typeof text !== 'string' || typeof sender !== 'string') {
            console.error('Invalid message format');
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text; // Using textContent for automatic escaping
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Limit number of messages to prevent memory issues
        while (chatMessages.children.length > 50) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
    };

    // Simple bot responses
    const getBotResponse = (message) => {
        message = message.toLowerCase();
        // Using a map for responses instead of if-else
        const responses = new Map([
            ['hello', "Hello! How can I help you today?"],
            ['hi', "Hello! How can I help you today?"],
            ['name', "I'm a chatbot assistant for Paresh Yadav's website!"],
            ['contact', "You can contact Paresh through the contact form above or send an email directly."],
            ['about', "Paresh is a passionate individual with a love for technology and creativity."],
            ['portfolio', "You can check out Paresh's portfolio section above to see his projects!"]
        ]);

        // Find matching response
        for (const [key, response] of responses) {
            if (message.includes(key)) {
                return response;
            }
        }
        return "I'm not sure about that. Could you please be more specific or use the contact form for detailed inquiries?";
    };

    // Welcome message
    setTimeout(() => {
        addMessage("👋 Hi there! How can I help you today?", 'bot');
    }, 1000);
});
