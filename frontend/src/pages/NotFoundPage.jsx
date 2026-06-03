import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Không tìm thấy trang</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
