import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../components/ui/table'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '../../components/ui/dialog'
import { Textarea } from '../../components/ui/textarea'
import { useToast } from '../../components/ui/use-toast'
import {
  fetchPatients, createPatient, updatePatient, deletePatient,
  setFilters, fetchPatientStats,
} from '../../features/patients/patientSlice'
import {
  Search, Plus, Edit, Trash2, User, Phone,
  Mail, Calendar, X, ChevronLeft, ChevronRight,
  Users, UserCheck, UserX, Activity,
} from 'lucide-react'

const TAG_COLORS = [
  { name: 'default', bg: 'bg-gray-100', text: 'text-gray-700' },
  { name: 'vip', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  { name: 'urgent', bg: 'bg-red-100', text: 'text-red-700' },
  { name: 'new', bg: 'bg-blue-100', text: 'text-blue-700' },
  { name: 'followup', bg: 'bg-green-100', text: 'text-green-700' },
  { name: 'pediatric', bg: 'bg-purple-100', text: 'text-purple-700' },
]

const getTagColor = (color) => {
  const found = TAG_COLORS.find(t => t.name === color)
  return found ? `${found.bg} ${found.text}` : 'bg-gray-100 text-gray-700'
}

const createPatientSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100, 'Họ tên không được quá 100 ký tự'),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  phone: z.string().optional().refine(val => !val || /^[0-9]{10,11}$/.test(val), 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')).optional().nullable(),
  address: z.object({
    street: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    district: z.string().optional().nullable(),
    ward: z.string().optional().nullable(),
  }).optional().nullable(),
  insuranceNumber: z.string().max(50).optional().nullable(),
  bloodType: z.enum(['A', 'B', 'AB', 'O', 'unknown']).optional().default('unknown'),
  allergies: z.array(z.string()).optional().default([]),
  notes: z.string().max(1000).optional().nullable(),
})

const PatientListPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { patients, pagination, filters, stats, isLoading, isSubmitting } = useSelector(
    (state) => state.patients
  )

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [allergyInput, setAllergyInput] = useState('')
  const [statusTab, setStatusTab] = useState('active')

  const createForm = useForm({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      email: '',
      address: { street: '', city: '', district: '', ward: '' },
      insuranceNumber: '',
      bloodType: 'unknown',
      allergies: [],
      notes: '',
    },
  })

  const editForm = useForm({
    resolver: zodResolver(createPatientSchema),
  })

  useEffect(() => {
    loadPatients()
    if (stats === null) {
      dispatch(fetchPatientStats())
    }
  }, [])

  useEffect(() => {
    loadPatients()
  }, [filters])

  const loadPatients = useCallback(() => {
    const params = {
      page: pagination.page || 1,
      limit: 10,
      search: filters.search || undefined,
      gender: filters.gender || undefined,
      isActive: statusTab === 'active' ? true : statusTab === 'inactive' ? false : undefined,
      tag: filters.tag || undefined,
    }
    dispatch(fetchPatients(params))
  }, [dispatch, filters, pagination.page, statusTab])

  const handleSearch = (value) => {
    dispatch(setFilters({ search: value }))
  }

  const handleGenderFilter = (value) => {
    dispatch(setFilters({ gender: value }))
  }

  const handleCreatePatient = async (data) => {
    try {
      const payload = {
        ...data,
        email: data.email || null,
        allergies: data.allergies || [],
      }
      await dispatch(createPatient(payload)).unwrap()
      toast({ title: 'Thành công', description: 'Tạo bệnh nhân thành công' })
      setIsCreateOpen(false)
      createForm.reset()
      setAllergyInput('')
    } catch (error) {
      toast({ title: 'Lỗi', description: error, variant: 'destructive' })
    }
  }

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient)
    editForm.reset({
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || '',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || { street: '', city: '', district: '', ward: '' },
      insuranceNumber: patient.insuranceNumber || '',
      bloodType: patient.bloodType || 'unknown',
      allergies: patient.allergies || [],
      notes: patient.notes || '',
    })
    setIsEditOpen(true)
  }

  const handleUpdatePatient = async (data) => {
    try {
      await dispatch(updatePatient({ id: selectedPatient.id, data })).unwrap()
      toast({ title: 'Thành công', description: 'Cập nhật bệnh nhân thành công' })
      setIsEditOpen(false)
      setSelectedPatient(null)
      editForm.reset()
    } catch (error) {
      toast({ title: 'Lỗi', description: error, variant: 'destructive' })
    }
  }

  const handleDeletePatient = async () => {
    try {
      await dispatch(deletePatient(selectedPatient.id)).unwrap()
      toast({ title: 'Thành công', description: 'Xóa bệnh nhân thành công' })
      setIsDeleteOpen(false)
      setSelectedPatient(null)
    } catch (error) {
      toast({ title: 'Lỗi', description: error, variant: 'destructive' })
    }
  }

  const handleAddAllergy = (form, allergyInput, setAllergyInput) => {
    const current = form.getValues('allergies') || []
    if (allergyInput.trim()) {
      form.setValue('allergies', [...current, allergyInput.trim()])
      setAllergyInput('')
    }
  }

  const handleRemoveAllergy = (form, index) => {
    const current = form.getValues('allergies') || []
    form.setValue('allergies', current.filter((_, i) => i !== index))
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    dispatch(setFilters({ _page: newPage }))
    // directly manipulate pagination via a local approach
    // Actually, let's use a dedicated action
  }

  const getGenderLabel = (gender) => {
    switch (gender) {
      case 'male': return 'Nam'
      case 'female': return 'Nữ'
      case 'other': return 'Khác'
      default: return '-'
    }
  }

  const getAge = (dob) => {
    if (!dob) return '-'
    const birth = new Date(dob)
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const m = now.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
    return `${age} tuổi`
  }

  const getStatsCards = () => {
    if (!stats) return []
    return [
      {
        label: 'Tổng bệnh nhân',
        value: stats.total,
        icon: Users,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      },
      {
        label: 'Đang hoạt động',
        value: stats.active,
        icon: UserCheck,
        color: 'text-green-600',
        bg: 'bg-green-50',
      },
      {
        label: 'Đã xóa',
        value: stats.inactive,
        icon: UserX,
        color: 'text-red-600',
        bg: 'bg-red-50',
      },
    ]
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {getStatsCards().map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bệnh nhân</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách bệnh nhân
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm bệnh nhân
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm bệnh nhân mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để thêm bệnh nhân mới vào hệ thống
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(handleCreatePatient)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input id="fullName" placeholder="Nguyễn Văn A" {...createForm.register('fullName')} />
                  {createForm.formState.errors.fullName && (
                    <p className="text-xs text-red-500">{createForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" placeholder="0123456789" {...createForm.register('phone')} />
                  {createForm.formState.errors.phone && (
                    <p className="text-xs text-red-500">{createForm.formState.errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@example.com" {...createForm.register('email')} />
                  {createForm.formState.errors.email && (
                    <p className="text-xs text-red-500">{createForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                  <Input id="dateOfBirth" type="date" {...createForm.register('dateOfBirth')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính</Label>
                  <select
                    id="gender"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...createForm.register('gender')}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodType">Nhóm máu</Label>
                  <select
                    id="bloodType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...createForm.register('bloodType')}
                  >
                    <option value="unknown">Chưa biết</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceNumber">Số bảo hiểm</Label>
                  <Input id="insuranceNumber" placeholder="BH-XXXXXX" {...createForm.register('insuranceNumber')} />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Địa chỉ</Label>
                  <Input placeholder="Số nhà, đường" {...createForm.register('address.street')} />
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Tỉnh/Thành phố" {...createForm.register('address.city')} />
                    <Input placeholder="Quận/Huyện" {...createForm.register('address.district')} />
                    <Input placeholder="Phường/Xã" {...createForm.register('address.ward')} />
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Dị ứng</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập dị ứng và nhấn Enter"
                      value={allergyInput}
                      onChange={(e) => setAllergyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddAllergy(createForm, allergyInput, setAllergyInput)
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => handleAddAllergy(createForm, allergyInput, setAllergyInput)}>
                      Thêm
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(createForm.watch('allergies') || []).map((a, i) => (
                      <Badge key={i} variant="outline" className="text-xs gap-1 pr-1">
                        {a}
                        <button type="button" onClick={() => handleRemoveAllergy(createForm, i)} className="ml-1 hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea id="notes" placeholder="Ghi chú về bệnh nhân..." {...createForm.register('notes')} />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang tạo...' : 'Tạo bệnh nhân'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, số điện thoại..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={!filters.gender ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleGenderFilter('')}
              >
                Tất cả
              </Button>
              <Button
                variant={filters.gender === 'male' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleGenderFilter('male')}
              >
                Nam
              </Button>
              <Button
                variant={filters.gender === 'female' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleGenderFilter('female')}
              >
                Nữ
              </Button>
              <Button
                variant={filters.gender === 'other' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleGenderFilter('other')}
              >
                Khác
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={statusTab} onValueChange={setStatusTab}>
        <TabsList>
          <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
          <TabsTrigger value="inactive">Đã xóa</TabsTrigger>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
        </TabsList>

        <TabsContent value={statusTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Activity className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : patients.length === 0 ? (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                  <h3 className="text-lg font-semibold mb-1">Chưa có bệnh nhân</h3>
                  <p className="text-muted-foreground">
                    Thêm bệnh nhân mới để bắt đầu
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bệnh nhân</TableHead>
                        <TableHead>Liên hệ</TableHead>
                        <TableHead>Giới tính</TableHead>
                        <TableHead>Tuổi</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients.map((patient) => (
                        <TableRow
                          key={patient.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/patients/${patient.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-blue-600">
                                  {patient.fullName?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{patient.fullName}</p>
                                <p className="text-xs text-muted-foreground">{patient.code}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              {patient.phone && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {patient.phone}
                                </div>
                              )}
                              {patient.email && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate max-w-[140px]">{patient.email}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getGenderLabel(patient.gender)}</TableCell>
                          <TableCell>{getAge(patient.dateOfBirth)}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {patient.tags?.slice(0, 2).map((tag, i) => (
                                <Badge key={i} className={`text-xs ${getTagColor(tag.color)}`}>
                                  {tag.name}
                                </Badge>
                              ))}
                              {patient.tags?.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{patient.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('vi-VN') : '-'}
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditPatient(patient)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {patient.isActive && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedPatient(patient)
                                    setIsDeleteOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        Trang {pagination.page} / {pagination.totalPages} — {pagination.total} bệnh nhân
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.page <= 1}
                          onClick={() => {
                            const newPage = pagination.page - 1
                            dispatch(setFilters({ _dummy: newPage }))
                            loadPatients()
                          }}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Trước
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.page >= pagination.totalPages}
                          onClick={() => loadPatients()}
                        >
                          Sau
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bệnh nhân</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin bệnh nhân
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleUpdatePatient)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-fullName">Họ và tên *</Label>
                <Input id="edit-fullName" {...editForm.register('fullName')} />
                {editForm.formState.errors.fullName && (
                  <p className="text-xs text-red-500">{editForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Số điện thoại</Label>
                <Input id="edit-phone" {...editForm.register('phone')} />
                {editForm.formState.errors.phone && (
                  <p className="text-xs text-red-500">{editForm.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" {...editForm.register('email')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-dob">Ngày sinh</Label>
                <Input id="edit-dob" type="date" {...editForm.register('dateOfBirth')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-gender">Giới tính</Label>
                <select id="edit-gender" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...editForm.register('gender')}>
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-bloodType">Nhóm máu</Label>
                <select id="edit-bloodType" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...editForm.register('bloodType')}>
                  <option value="unknown">Chưa biết</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-insurance">Số bảo hiểm</Label>
                <Input id="edit-insurance" {...editForm.register('insuranceNumber')} />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Địa chỉ</Label>
                <Input placeholder="Số nhà, đường" {...editForm.register('address.street')} />
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="Tỉnh/Thành phố" {...editForm.register('address.city')} />
                  <Input placeholder="Quận/Huyện" {...editForm.register('address.district')} />
                  <Input placeholder="Phường/Xã" {...editForm.register('address.ward')} />
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-notes">Ghi chú</Label>
                <Textarea id="edit-notes" {...editForm.register('notes')} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang cập nhật...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa bệnh nhân</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bệnh nhân <strong>{selectedPatient?.fullName}</strong>?
              Hành động này có thể khôi phục được.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeletePatient} disabled={isSubmitting}>
              {isSubmitting ? 'Đang xóa...' : 'Xóa bệnh nhân'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PatientListPage
