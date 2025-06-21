import { ApiClient } from '@/lib/api-client';

interface ChatbotMessage {
  content: string;
  projectName: string;
  conversationId?: string;
  role?: string;
}

interface ChatbotQuestion {
  question: string;
  projectName: string;
  sessionId: string;
}

export interface ChatbotResponse {
  message: {
    content: string;
  };
}

export class ChatbotService {
  static async createConversation(projectName: string) {
    try {
      const response = await ApiClient.post<{ conversationId: string }>('/chatbot/create-conversation', {
        projectName,
      });
      if (response.error) {
        throw new Error('Failed to create conversation');
      }
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  static async sendMessage(message: ChatbotMessage) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatbot/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token')}`,
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  static async sendMessageLegacy(message: ChatbotQuestion) {
    try {
      const response = await ApiClient.post<ChatbotResponse>('/chatbot/send-message-legacy', {
        messages: [{ role: 'user', content: message.question }],
        projectName: message.projectName,
        id: message.sessionId,
      });
      if (response.error) {
        return {
          answer:
            "I'm having trouble connecting to the project database right now. Please try again in a moment or refresh the page if the issue persists.",
        };
      }
      return {
        answer: response.data?.message.content,
      };
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      return {
        answer:
          "I'm having trouble connecting to the project database right now. Please try again in a moment or refresh the page if the issue persists.",
      };
    }
  }

  static async removeSession(sessionId: string) {
    try {
      await ApiClient.post<boolean>('/chatbot/remove-session', { sessionId });
    } catch (error) {
      console.error('Error removing session:', error);
    }
  }
}
