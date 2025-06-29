document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const apiKey = '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'; // SUA CHAVE DE API
    const openRouterApiUrl = 'https://openrouter.ai/api/v1/chat/completions';

    const circuloLogo = document.getElementById('circulo-logo');
    const centroInicial = document.getElementById('centro-inicial');
    const chatMessagesArea = document.getElementById('chat-messages-area');
    let chatIniciado = false;

    // Função para adicionar mensagem à área de chat
    function addMessageToChat(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'ia-message');
        messageElement.textContent = message;
        chatMessagesArea.appendChild(messageElement);
        chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight; // Auto-scroll para a última mensagem
    }

    // Função para iniciar o chat (esconder círculo, mostrar área de mensagens)
    function iniciarChatInterface() {
        if (!chatIniciado) {
            if (circuloLogo) {
                circuloLogo.classList.add('hidden');
            }
            if (centroInicial) {
                // Oculta a div pai do círculo para que não ocupe mais espaço flexível
                centroInicial.style.display = 'none';
            }
            if (chatMessagesArea) {
                chatMessagesArea.classList.add('visible');
            }
            chatIniciado = true;
        }
    }

    // Função para enviar mensagem para a API do OpenRouter
    async function sendMessageToOpenRouter(userMessage) {
        iniciarChatInterface(); // Garante que a interface do chat esteja ativa
        addMessageToChat(userMessage, 'user');
        userInput.value = ''; // Limpa o campo de entrada

        // Adiciona uma mensagem de "digitando..." pela IA (opcional)
        const typingMessage = addMessageToChat('A IA está digitando...', 'ia');

        try {
            const response = await fetch(openRouterApiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'openai/gpt-3.5-turbo',
                    messages: [
                        { role: 'user', content: userMessage }
                    ],
                }),
            });

            // Remove a mensagem de "digitando..."
            if (typingMessage && typingMessage.parentNode) {
                typingMessage.parentNode.removeChild(typingMessage);
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro da API OpenRouter:', errorData);
                addMessageToChat(`Erro ao contatar a IA: ${errorData.error?.message || response.statusText}`, 'ia');
                return;
            }

            const data = await response.json();
            const iaMessage = data.choices[0]?.message?.content.trim();

            if (iaMessage) {
                addMessageToChat(iaMessage, 'ia');
            } else {
                addMessageToChat('A IA não forneceu uma resposta válida.', 'ia');
            }

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            // Remove a mensagem de "digitando..." em caso de erro de rede também
            if (typingMessage && typingMessage.parentNode) {
                typingMessage.parentNode.removeChild(typingMessage);
            }
            addMessageToChat('Não foi possível conectar à IA. Verifique sua conexão ou a chave da API.', 'ia');
        }
    }

    // Event listener para o botão de enviar
    sendButton.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message) {
            sendMessageToOpenRouter(message);
        }
    });

    // Event listener para a tecla Enter no campo de entrada
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const message = userInput.value.trim();
            if (message) {
                sendMessageToOpenRouter(message);
            }
        }
    });

    // Adiciona um texto ou ícone ao círculo se desejar (opcional)
    if (circuloLogo) {
        // circuloLogo.textContent = '🤖'; // Exemplo com emoji
    }
});
