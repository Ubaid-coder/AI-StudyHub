import  api  from '@/lib/api';
import axios from 'axios';

interface BackendChatResponse {
  data: {
    reply: string;
  };
}


export const chatService = {
  async sendMessage(message: string): Promise<BackendChatResponse> { 
    try {
      // 3. Update the Axios post generic type
      const response = await api.post<BackendChatResponse>('/chat', {
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