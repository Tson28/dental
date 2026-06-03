import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/api'

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Đăng nhập thất bại'
      )
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('[REGISTER THUNK] Sending:', JSON.stringify(userData, null, 2));
      const response = await api.post('/auth/register', userData)
      console.log('[REGISTER THUNK] Response:', JSON.stringify(response.data, null, 2));
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Đăng ký thất bại'
      )
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout')
      return null
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Đăng xuất thất bại'
      )
    }
  }
)

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile')
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy thông tin profile'
      )
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/profile', updateData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Cập nhật profile thất bại'
      )
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/password', passwordData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Đổi mật khẩu thất bại'
      )
    }
  }
)

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
    },
    clearError: (state) => {
      state.error = null
    },
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload?.data?.user || action.payload?.user
        state.accessToken = action.payload?.data?.accessToken || action.payload?.accessToken
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.error = action.payload
      })
      
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload?.data?.user || action.payload?.user
        state.accessToken = action.payload?.data?.accessToken || action.payload?.accessToken
        state.refreshToken = action.payload?.data?.refreshToken || action.payload?.refreshToken
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.accessToken = null
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.accessToken = null
        state.refreshToken = null
      })
      
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload?.data || action.payload
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload?.data || action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { setCredentials, clearError, resetAuth } = authSlice.actions
export default authSlice.reducer
