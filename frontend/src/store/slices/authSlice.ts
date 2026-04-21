import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

interface AuthState {
  token: str | null;
  email: str | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  email: typeof window !== 'undefined' ? localStorage.getItem('user_email') : null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials: any, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return { token: response.data.access_token, email: credentials.email };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Login failed');
  }
});

export const signup = createAsyncThunk('auth/signup', async (credentials: any, { rejectWithValue }) => {
  try {
    await api.post('/auth/signup', credentials);
    return credentials.email;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Signup failed');
  }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (data: any, { rejectWithValue }) => {
  try {
    await api.post('/auth/verify-otp', data);
    return true;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'OTP Verification failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.email = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user_email');
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<{token: string, email: string}>) => {
      state.loading = false;
      state.token = action.payload.token;
      state.email = action.payload.email;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user_email', action.payload.email);
    });
    builder.addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    
    // Signup
    builder.addCase(signup.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(signup.fulfilled, (state, action) => {
      state.loading = false;
      state.email = action.payload; // Just store email for OTP step
    });
    builder.addCase(signup.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // Verify OTP
    builder.addCase(verifyOtp.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(verifyOtp.fulfilled, (state) => { state.loading = false; });
    builder.addCase(verifyOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
