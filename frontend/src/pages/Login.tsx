import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'

const Login = () => {
  const [formState, setFormState] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.email || !formState.password) {
      toast({ title: 'Email dan password wajib diisi', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await login(formState.email, formState.password)
      toast({ title: 'Berhasil login', description: 'Selamat datang!' })
      navigate('/admin/resources')
    } catch (error) {
      toast({ title: 'Login gagal', description: (error as Error).message || 'Cek kredensial Anda', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md overflow-hidden rounded-xl border-hairline shadow-none">
        <CardHeader className="bg-navy-950 text-on-dark">
          <h1 className="text-2xl font-semibold leading-none tracking-tight">Admin Login</h1>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formState.email}
                onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formState.password}
                onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memeriksa...' : 'Masuk sebagai Admin'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
