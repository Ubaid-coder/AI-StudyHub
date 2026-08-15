export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text:string;
  timestamp: string;
 
}

// Success response from POST /api/chat
export interface ChatApiResponse {
  id: string;
  sender: "gemini";
  text:string;
  timestamp: string;
}