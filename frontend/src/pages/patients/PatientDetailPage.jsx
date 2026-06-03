import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
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
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '../../components/ui/dialog'
import { Textarea } from '../../components/ui/textarea'
import { Separator } from '../../components/ui/separator'
import { useToast } from '../../components/ui/use-toast'
import {
  fetchPatientById, updatePatient, fetchMedicalHistory,
  addDocument, removeDocument, addTag, removeTag,
  clearCurrentPatient,
} from '../../features/patients/patientSlice'
import {
  ArrowLeft, Edit, Phone, Mail, MapPin, Calendar,
  User, Shield, Activity, FileText, Tag,
  Trash2, Plus, X, Download, Upload, Droplet,
  AlertTriangle, Clock,
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

const tagSchema = z.object({
  name: z.string().min(1, 'Tên tag là bắt buộc').max(50, 'Tag không được quá 50 ký tự'),
  color: z.string().default('default'),
})

const documentSchema = z.object({
  name: z.string().min(1, 'Tên tài liệu là bắt buộc').max(200),
  type: z.string().min(1, 'Loại tài liệu là bắt buộc'),
  url: z.string().min(1, 'Đường dẫn là bắt buộc').url('Đường dẫn không hợp lệ'),
  size: z.number().min(0).optional().default(0),
})

const PatientDetailPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { currentPatient, medicalHistory, isLoading, isSubmitting } = useSelector(
    (state) => state.patients
  )

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [tagColor, setTagColor] = useState('default')

  const editForm = useForm({
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

  const tagForm = useForm({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: '', color: 'default' },
  })

  const docForm = useForm({
    resolver: zodResolver(documentSchema),
    defaultValues: { name: '', type: '', url: '', size: 0 },
  })

  useEffect(() => {
    dispatch(fetchPatientById(id))
    dispatch(fetchMedicalHistory(id))
    return () => dispatch(clearCurrentPatient())
  }, [id])

  useEffect(() => {
    if (currentPatient) {
      editForm.reset({
        fullName: currentPatient.fullName || '',
        dateOfBirth: currentPatient.dateOfBirth
          ? new Date(currentPatient.dateOfBirth).toISOString().split('T')[0]
          : '',
        gender: currentPatient.gender || '',
        phone: currentPatient.phone || '',
        email: currentPatient.email || '',
        address: currentPatient.address || { street: '', city: '', district: '', ward: '' },
        insuranceNumber: currentPatient.insuranceNumber || '',
        bloodType: currentPatient.bloodType || 'unknown',
        allergies: currentPatient.allergies || [],
        notes: currentPatient.notes || '',
      })
    }
  }, [currentPatient])

  const handleUpdatePatient = async (data) => {
    try {
      await dispatch(updatePatient({ id, data })).unwrap()
      toast({ title: 'Thành công', description: 'Cập nhật thông tin thành công' })
      setIsEditOpen(false)
    } catch (error) {
      toast({ title: 'Lỗi', description: error, variant: 'destructive' })
    }
  }

  const handleAddTag = async (data) => {
    try {
      await dispatch(addTag({ patientId: id, tag: data })).unwrap()
      toast({ title: 'Thành công', description: 'Thêm tag thành công' })
      setIsTagDialogOpen(false)
      tagForm.reset()
      setTagInput('')
      setTagColor('default')
    } catch (error) {
      toast({ title: 'Lỗi', description: error, variant: 'destructive' })
    }
  }

  const handleRemoveTag = async (tagName) => {
    try {
      await dispatch(removeTag({ patientId: id, tagName })).unwrap()
      toast({ title: 'Thành công', description: 'Xóa tag thành công' })
    } catch (error) {
      toast({ title: 'Lỗi', description: error, variant: 'destructive' })
    }
  }

  const handleAddDocument = async (data) => {
    try {
      await dispatch(addDocument({ patientId: id, documentData: data })).unwrap()
      toast({ title: 'Thành công', description: 'Thêm tài liệu thành công' })
      setIsDocDialogOpen(false)
      docForm.reset()
    } catch (error) {
      toast({ title: 'Lỗi', description: error, variant: 'destructive' })
    }
  }

  const handleRemoveDocument = async (docId) => {
    try {
      await dispatch(removeDocument({ patientId: id, documentId: docId })).unwrap()
      toast({ title: 'Thành công', description: 'Xóa tài liệu thành công' })
    } catch (error) {
      toast({ title: 'Lỗi', description: error, variant: 'destructive' })
    }
  }

  const getGenderLabel = (g) => {
    switch (g) {
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (isLoading && !currentPatient) {
    return (
      <div className="flex items-center justify-center py-20">
        <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!currentPatient) {
    return (
      <div className="text-center py-20">
        <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
        <h3 className="text-lg font-semibold mb-2">Không tìm thấy bệnh nhân</h3>
        <Button variant="outline" onClick={() => navigate('/patients')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{currentPatient.fullName}</h1>
            {currentPatient.isActive === false && (
              <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">
                Đã xóa
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{currentPatient.code}</p>
        </div>
        {currentPatient.isActive !== false && (
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar & Info */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-blue-600">
                  {currentPatient.fullName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-semibold">{currentPatient.fullName}</h2>
              <p className="text-sm text-muted-foreground">{currentPatient.code}</p>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Tag className="h-4 w-4" />
                  Tags
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setIsTagDialogOpen(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Thêm
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {currentPatient.tags?.length > 0 ? (
                  currentPatient.tags.map((tag, i) => (
                    <Badge key={i} className={`${getTagColor(tag.color)} gap-1`}>
                      {tag.name}
                      <button
                        onClick={() => handleRemoveTag(tag.name)}
                        className="hover:text-red-600 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có tag</p>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Basic Info */}
            <div className="space-y-3 text-sm">
              {currentPatient.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{currentPatient.phone}</span>
                </div>
              )}
              {currentPatient.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{currentPatient.email}</span>
                </div>
              )}
              {currentPatient.dateOfBirth && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{formatDate(currentPatient.dateOfBirth)} ({getAge(currentPatient.dateOfBirth)})</span>
                </div>
              )}
              {currentPatient.gender && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{getGenderLabel(currentPatient.gender)}</span>
                </div>
              )}
              {currentPatient.bloodType && currentPatient.bloodType !== 'unknown' && (
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>Nhóm máu {currentPatient.bloodType}</span>
                </div>
              )}
              {currentPatient.insuranceNumber && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>BHYT: {currentPatient.insuranceNumber}</span>
                </div>
              )}
            </div>

            {/* Address */}
            {currentPatient.address && (
              <>
                <Separator className="my-4" />
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <MapPin className="h-4 w-4" />
                    Địa chỉ
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {[currentPatient.address.street, currentPatient.address.ward,
                      currentPatient.address.district, currentPatient.address.city]
                      .filter(Boolean).join(', ') || 'Chưa cập nhật'}
                  </p>
                </div>
              </>
            )}

            {/* Emergency Contact */}
            {currentPatient.emergencyContact && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm font-medium mb-2">Liên hệ khẩn cấp</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {currentPatient.emergencyContact.name && (
                      <p>{currentPatient.emergencyContact.name}
                        {currentPatient.emergencyContact.relationship && (
                          <span className="ml-1 text-xs">({currentPatient.emergencyContact.relationship})</span>
                        )}
                      </p>
                    )}
                    {currentPatient.emergencyContact.phone && (
                      <p className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {currentPatient.emergencyContact.phone}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="medical">Lịch sử y tế</TabsTrigger>
              <TabsTrigger value="documents">Tài liệu ({currentPatient.documents?.length || 0})</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              {/* Allergies */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Dị ứng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentPatient.allergies?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {currentPatient.allergies.map((allergy, i) => (
                        <Badge key={i} variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Không có thông tin dị ứng</p>
                  )}
                </CardContent>
              </Card>

              {/* Medical History Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    Lịch sử y tế gần đây
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {medicalHistory.length > 0 ? (
                    <div className="space-y-3">
                      {medicalHistory.slice(0, 3).map((record, i) => (
                        <div key={i} className="flex items-start justify-between border-b last:border-0 pb-2 last:pb-0">
                          <div>
                            <p className="font-medium text-sm">{record.diagnosis || record.service?.name || 'Khám tổng quát'}</p>
                            <p className="text-xs text-muted-foreground">
                              {record.appointmentDate ? formatDate(record.appointmentDate) : 'N/A'}
                              {record.doctor && ` — Bs. ${record.doctor.fullName}`}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {record.status || 'completed'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có lịch sử y tế</p>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {currentPatient.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Ghi chú</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentPatient.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Meta Info */}
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Ngày tạo</p>
                      <p className="font-medium">{formatDateTime(currentPatient.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cập nhật lần cuối</p>
                      <p className="font-medium">{formatDateTime(currentPatient.updatedAt)}</p>
                    </div>
                    {currentPatient.createdBy && (
                      <div>
                        <p className="text-muted-foreground">Người tạo</p>
                        <p className="font-medium">{currentPatient.createdBy.fullName}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medical History Tab */}
            <TabsContent value="medical" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Lịch sử y tế</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {medicalHistory.length > 0 ? (
                    <div className="space-y-4">
                      {medicalHistory.map((record, i) => (
                        <div key={i} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{record.diagnosis || 'Khám tổng quát'}</p>
                              {record.service?.name && (
                                <p className="text-sm text-muted-foreground">{record.service.name}</p>
                              )}
                            </div>
                            <Badge variant="outline">
                              {record.appointmentDate ? formatDate(record.appointmentDate) : ''}
                            </Badge>
                          </div>
                          {record.notes && (
                            <p className="text-sm text-muted-foreground">{record.notes}</p>
                          )}
                          {record.doctor && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              Bác sĩ: {record.doctor.fullName}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
                      <p className="text-muted-foreground">Chưa có lịch sử y tế</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Tài liệu</CardTitle>
                    <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Thêm tài liệu
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Thêm tài liệu mới</DialogTitle>
                          <DialogDescription>
                            Nhập thông tin tài liệu cần thêm vào hồ sơ bệnh nhân
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={docForm.handleSubmit(handleAddDocument)} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="doc-name">Tên tài liệu *</Label>
                            <Input id="doc-name" placeholder="Kết quả X-quang" {...docForm.register('name')} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="doc-type">Loại tài liệu *</Label>
                            <select
                              id="doc-type"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              {...docForm.register('type')}
                            >
                              <option value="">Chọn loại</option>
                              <option value="xray">X-quang</option>
                              <option value="ct">CT Scan</option>
                              <option value="mri">MRI</option>
                              <option value="lab">Xét nghiệm</option>
                              <option value="prescription">Đơn thuốc</option>
                              <option value="report">Báo cáo</option>
                              <option value="other">Khác</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="doc-url">Đường dẫn URL *</Label>
                            <Input id="doc-url" placeholder="https://..." {...docForm.register('url')} />
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDocDialogOpen(false)}>
                              Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                              Thêm tài liệu
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentPatient.documents?.length > 0 ? (
                    <div className="space-y-3">
                      {currentPatient.documents.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-muted">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                                <span>{formatDateTime(doc.uploadedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600"
                              onClick={() => handleRemoveDocument(doc.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
                      <p className="text-muted-foreground">Chưa có tài liệu nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin bệnh nhân</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin bệnh nhân {currentPatient.code}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleUpdatePatient)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-fullName">Họ và tên *</Label>
                <Input id="edit-fullName" {...editForm.register('fullName')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Số điện thoại</Label>
                <Input id="edit-phone" {...editForm.register('phone')} />
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
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tag Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm tag mới</DialogTitle>
            <DialogDescription>
              Thêm tag để phân loại bệnh nhân
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={tagForm.handleSubmit(handleAddTag)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tên tag</Label>
              <Input
                id="tag-name"
                placeholder="VIP, Cần theo dõi..."
                {...tagForm.register('name')}
              />
            </div>
            <div className="space-y-2">
              <Label>Màu sắc</Label>
              <div className="flex gap-2 flex-wrap">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 ${tagColor === color.name ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => {
                      setTagColor(color.name)
                      tagForm.setValue('color', color.name)
                    }}
                  >
                    <div className={`h-full w-full rounded-full ${color.bg}`} />
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Thêm tag
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PatientDetailPage
