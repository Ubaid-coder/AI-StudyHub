// client/src/services/chat.service.ts
import axios from 'axios';

interface BackendChatResponse {
  data: {
    reply: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});



export const chatService = {
  async sendMessage(message: string): Promise<BackendChatResponse> { 
    try {
      // 3. Update the Axios post generic type
      const response = await api.post<BackendChatResponse>('/api/chat', {
        message,
      });
      return response.data; 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios Error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected Error:', error);
      }
      throw error;
    }
  },
};