import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

export interface User {
  id: number;
  email: string;
  is_verified: boolean;
}

export interface Message {
  id: string;
  sender_id: number;
  receiver_id: number;
  content: string;
  type: string;
  timestamp: string;
}

interface ChatState {
  searchResults: User[];
  activeChatUser: User | null;
  messages: Message[];
  loading: boolean;
}

const initialState: ChatState = {
  searchResults: [],
  activeChatUser: null,
  messages: [],
  loading: false,
};

// Search users
export const searchUsers = createAsyncThunk('chat/searchUsers', async (email: string) => {
  const response = await api.get(`/auth/users/search?email=${email}`);
  return response.data as User[];
});

// Fetch historical messages 
export const fetchHistory = createAsyncThunk('chat/history', async (userId: number, { getState }) => {
  const state: any = getState();
  const token = state.auth.token;
  let currentUserId = 0;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUserId = parseInt(payload.sub);
    } catch(e) {}
  }
  const response = await api.get(`/chat/history/${userId}?current_user_id=${currentUserId}`);
  return response.data as Message[];
});

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChatUser(state, action: PayloadAction<User>) {
      state.activeChatUser = action.payload;
      state.messages = []; // reset messages when switching chat
    },
    addMessage(state, action: PayloadAction<Message>) {
      const msg = action.payload;
      // Only append visibly if it belongs to the active chat
      if (state.activeChatUser) {
        if (msg.sender_id === state.activeChatUser.id || msg.receiver_id === state.activeChatUser.id) {
          state.messages.push(msg);
        }
      }
    }
  },
  extraReducers: (builder) => {
    // Search
    builder.addCase(searchUsers.fulfilled, (state, action) => {
      state.searchResults = action.payload;
    });
    // History
    builder.addCase(fetchHistory.pending, (state) => {
       state.loading = true;
    });
    builder.addCase(fetchHistory.fulfilled, (state, action) => {
      state.loading = false;
      state.messages = action.payload;
    });
  },
});

export const { setActiveChatUser, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
