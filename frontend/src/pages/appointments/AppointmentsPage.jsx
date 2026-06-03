import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Calendar, Search, Plus, X } from 'lucide-react'
import { formatDate, formatTime, APPOINTMENT_STATUS } from '../../lib/utils'

const AppointmentsPage = () => {
  const { user } = useSelector((state) => state.auth)
  const [appointments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patient?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.doctor?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || appointment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const statusInfo = APPOINTMENT_STATUS[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-800',
    }
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch hẹn</h1>
          <p className="text-muted-foreground">
            Quản lý lịch hẹn khám bệnh
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo lịch hẹn mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tạo lịch hẹn mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo lịch hẹn mới cho bệnh nhân
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Bệnh nhân</Label>
                <Input id="patient" placeholder="Chọn bệnh nhân" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">Bác sĩ</Label>
                <Input id="doctor" placeholder="Chọn bác sĩ" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Ngày hẹn</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Giờ hẹn</Label>
                  <Input id="time" type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Dịch vụ</Label>
                <Input id="service" placeholder="Chọn dịch vụ" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Lý do khám</Label>
                <Input id="reason" placeholder="Mô tả lý do khám" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">Tạo lịch hẹn</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên bệnh nhân hoặc bác sĩ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Tất cả
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Chờ xác nhận
              </Button>
              <Button
                variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('confirmed')}
              >
                Đã xác nhận
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
              <h3 className="text-lg font-semibold mb-1">Chưa có lịch hẹn</h3>
              <p className="text-muted-foreground">
                Tạo lịch hẹn mới để bắt đầu
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Bác sĩ</TableHead>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Ngày/Giờ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {appointment.patient?.fullName}
                    </TableCell>
                    <TableCell>{appointment.doctor?.fullName}</TableCell>
                    <TableCell>{appointment.service?.name}</TableCell>
                    <TableCell>
                      <div>
                        <div>{formatDate(appointment.appointmentDate)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTime(appointment.appointmentTime)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AppointmentsPage
