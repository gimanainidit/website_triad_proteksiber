import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ResourceService, TemplateMeta } from '@/services/resourceService'
import { Trash2, Upload } from 'lucide-react'

const materialTypes = ['guide', 'checklist', 'template', 'whitepaper', 'report']

const TemplateManager = () => {
  const [templates, setTemplates] = useState<TemplateMeta[]>([])
  const [form, setForm] = useState({ name: '', material_type: 'guide', description: '', file: null as File | null })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const loadTemplates = async () => {
    try {
      const data = await ResourceService.getTemplates()
      setTemplates(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.file) {
      toast({ title: 'Lengkapi form template', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await ResourceService.uploadTemplate(form)
      toast({ title: 'Template tersimpan' })
      setForm({ name: '', material_type: 'guide', description: '', file: null })
      loadTemplates()
    } catch (error) {
      console.error(error)
      toast({ title: 'Upload gagal', description: (error as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setForm((prev) => ({ ...prev, file }))
    }
  }

  const handleArchive = async (id: string) => {
    if (!window.confirm('Arsipkan template ini?')) return
    try {
      await ResourceService.archiveTemplate(id)
      toast({ title: 'Template diarsipkan' })
      loadTemplates()
    } catch (error) {
      toast({ title: 'Gagal mengarsipkan', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <Card className="border border-border">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Upload className="h-5 w-5" /> Template Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleUpload}>
              <div className="space-y-2">
                <Label>Nama Template</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Panduan Incident Response"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Material Type</Label>
                  <Select value={form.material_type} onValueChange={(value) => setForm((prev) => ({ ...prev, material_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {materialTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>File Template (.pptx)</Label>
                  <Input type="file" accept=".pptx" onChange={handleFileChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi singkat"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Mengunggah...' : 'Simpan Template'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id} className="border border-border">
              <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold">{template.name}</p>
                  <p className="text-sm text-muted-foreground">{template.material_type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={template.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent font-semibold"
                  >
                    Download
                  </a>
                  <Button size="sm" variant="outline" onClick={() => handleArchive(template.id)}>
                    <Trash2 className="h-4 w-4" /> Archive
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TemplateManager
