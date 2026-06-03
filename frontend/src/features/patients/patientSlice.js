import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/api'

export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/patients', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải danh sách bệnh nhân'
      )
    }
  }
)

export const fetchPatientById = createAsyncThunk(
  'patients/fetchPatientById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/${id}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải thông tin bệnh nhân'
      )
    }
  }
)

export const createPatient = createAsyncThunk(
  'patients/createPatient',
  async (patientData, { rejectWithValue }) => {
    try {
      const response = await api.post('/patients', patientData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Tạo bệnh nhân thất bại'
      )
    }
  }
)

export const updatePatient = createAsyncThunk(
  'patients/updatePatient',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/patients/${id}`, data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Cập nhật bệnh nhân thất bại'
      )
    }
  }
)

export const deletePatient = createAsyncThunk(
  'patients/deletePatient',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/patients/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Xóa bệnh nhân thất bại'
      )
    }
  }
)

export const addDocument = createAsyncThunk(
  'patients/addDocument',
  async ({ patientId, documentData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/patients/${patientId}/documents`, documentData)
      return { patientId, document: response.data.data }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Thêm tài liệu thất bại'
      )
    }
  }
)

export const removeDocument = createAsyncThunk(
  'patients/removeDocument',
  async ({ patientId, documentId }, { rejectWithValue }) => {
    try {
      await api.delete(`/patients/${patientId}/documents/${documentId}`)
      return { patientId, documentId }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Xóa tài liệu thất bại'
      )
    }
  }
)

export const addTag = createAsyncThunk(
  'patients/addTag',
  async ({ patientId, tag }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/patients/${patientId}/tags`, tag)
      return { patientId, tag: response.data.data }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Thêm tag thất bại'
      )
    }
  }
)

export const removeTag = createAsyncThunk(
  'patients/removeTag',
  async ({ patientId, tagName }, { rejectWithValue }) => {
    try {
      await api.delete(`/patients/${patientId}/tags/${encodeURIComponent(tagName)}`)
      return { patientId, tagName }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Xóa tag thất bại'
      )
    }
  }
)

export const fetchMedicalHistory = createAsyncThunk(
  'patients/fetchMedicalHistory',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/${patientId}/medical-history`)
      return { patientId, records: response.data.data }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải lịch sử y tế'
      )
    }
  }
)

export const fetchPatientStats = createAsyncThunk(
  'patients/fetchPatientStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/patients/stats')
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải thống kê'
      )
    }
  }
)

const initialState = {
  patients: [],
  currentPatient: null,
  medicalHistory: [],
  stats: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  filters: {
    search: '',
    gender: '',
    isActive: true,
    tag: '',
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
}

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    clearCurrentPatient: (state) => {
      state.currentPatient = null
      state.medicalHistory = []
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPatients
      .addCase(fetchPatients.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.isLoading = false
        state.patients = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // fetchPatientById
      .addCase(fetchPatientById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentPatient = action.payload
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // createPatient
      .addCase(createPatient.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.patients.unshift(action.payload)
        state.pagination.total += 1
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })

      // updatePatient
      .addCase(updatePatient.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.currentPatient = action.payload
        const index = state.patients.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.patients[index] = action.payload
        }
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })

      // deletePatient
      .addCase(deletePatient.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.patients = state.patients.filter(p => p.id !== action.payload)
        state.pagination.total -= 1
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })

      // addDocument
      .addCase(addDocument.fulfilled, (state, action) => {
        if (state.currentPatient && state.currentPatient.id === action.payload.patientId) {
          state.currentPatient.documents.push(action.payload.document)
        }
      })

      // removeDocument
      .addCase(removeDocument.fulfilled, (state, action) => {
        if (state.currentPatient && state.currentPatient.id === action.payload.patientId) {
          state.currentPatient.documents = state.currentPatient.documents.filter(
            d => d.id !== action.payload.documentId
          )
        }
      })

      // addTag
      .addCase(addTag.fulfilled, (state, action) => {
        if (state.currentPatient && state.currentPatient.id === action.payload.patientId) {
          state.currentPatient.tags.push(action.payload.tag)
        }
      })

      // removeTag
      .addCase(removeTag.fulfilled, (state, action) => {
        if (state.currentPatient && state.currentPatient.id === action.payload.patientId) {
          state.currentPatient.tags = state.currentPatient.tags.filter(
            t => t.name !== action.payload.tagName
          )
        }
      })

      // fetchMedicalHistory
      .addCase(fetchMedicalHistory.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchMedicalHistory.fulfilled, (state, action) => {
        state.isLoading = false
        state.medicalHistory = action.payload.records
      })
      .addCase(fetchMedicalHistory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // fetchPatientStats
      .addCase(fetchPatientStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
  },
})

export const { setFilters, resetFilters, clearCurrentPatient, clearError } = patientSlice.actions
export default patientSlice.reducer
