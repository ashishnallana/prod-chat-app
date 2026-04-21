import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: string;
  sender_id: number;
  receiver_id: number;
  content: string;
  type: string;
  file_url: string | null;
  timestamp: string;
}

interface ChatState {
  messages: ChatMessage[];
  searchQuery: string;
  searchResults: { id: number; email: string }[];
}

const initialState: ChatState = {
  messages: [],
  searchQuery: '',
  searchResults: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setSearchResults: (state, action: PayloadAction<{ id: number; email: string }[]>) => {
      state.searchResults = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setMessages, addMessage, setSearchResults, setSearchQuery } = chatSlice.actions;
export default chatSlice.reducer;
