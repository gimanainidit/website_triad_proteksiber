import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, ArrowLeft, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ResourceService, TemplateMeta } from '@/services/resourceService'

const NO_TEMPLATE = 'none'

const AdminUpload = () => {
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: ''
  })
  const [templates, setTemplates] = useState<TemplateMeta[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [reviewResult, setReviewResult] = useState<string | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)

  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await ResourceService.getTemplates()
        setTemplates(data)
      } catch (error) {
        console.error('Failed to load templates', error)
      }
    }
    loadTemplates()
  }, [])

  const categories = [
    'Panduan',
    'Whitepaper', 
    'Checklist',
    'Template',
    'Laporan',
    'Standar'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['pdf', 'pptx']
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      toast({
        title: 'File tidak didukung',
        description: `Hanya file ${allowedTypes.join(', ')} yang diperbolehkan`,
        variant: 'destructive'
      })
      return
    }

    if (file.size > 15 * 1024 * 1024) { // 15MB limit
      toast({
        title: 'File terlalu besar',
        description: 'Ukuran file maksimal 15MB',
        variant: 'destructive'
      })
      return
    }

    setSelectedFile(file)
    setReviewResult(null)
    
    // Auto-generate title from filename if empty
    if (!formData.title) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '')
      setFormData(prev => ({ ...prev, title: nameWithoutExtension }))
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      toast({
        title: 'File diperlukan',
        description: 'Silakan pilih file untuk diupload',
        variant: 'destructive'
      })
      return
    }

    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Harap isi semua field yang diperlukan',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      await ResourceService.uploadResource({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        template_id: selectedTemplate || undefined,
        file: selectedFile
      })

      toast({
        title: 'Berhasil!',
        description: 'Resource berhasil diupload'
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: ''
      })
      setSelectedFile(null)
      
      // Navigate back to resources
      navigate('/resources')
      
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat upload',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async () => {
    if (!selectedFile) {
      toast({ title: 'File diperlukan', variant: 'destructive' })
      return
    }
    setReviewLoading(true)
    try {
      const result = await ResourceService.reviewDocument(selectedFile, selectedTemplate || undefined)
      setReviewResult(result.review.review)
      toast({ title: 'Review selesai', description: 'Silakan periksa hasil sebelum upload' })
    } catch (error) {
      console.error('Review error:', error)
      toast({ title: 'Review gagal', description: (error as Error).message, variant: 'destructive' })
    } finally {
      setReviewLoading(false)
    }
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/resources')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Resources
          </Button>
        </div>

        <Card className="overflow-hidden rounded-xl border-hairline shadow-none">
          <CardHeader className="bg-navy-950 text-on-dark">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Upload className="h-6 w-6" />
              Upload Resource Baru
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* File Upload Area */}
              <div className="space-y-2">
                <Label>Upload File *</Label>
                <div
                  className={`
                    relative border-2 border-dashed rounded-lg p-8 text-center transition-all
                    ${dragActive ? 'border-primary bg-soft' : 'border-hairline-strong hover:border-steel'}
                    ${selectedFile ? 'border-primary bg-soft' : ''}
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    onChange={handleFileInputChange}
                    accept=".pdf,.pptx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="h-8 w-8 text-primary" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-ink-strong">{selectedFile.name}</p>
                        <p className="text-sm text-steel">
                          {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto mb-4 h-12 w-12 text-steel" aria-hidden="true" />
                      <p className="mb-2 text-lg font-medium text-ink-strong">
                        Drag & drop file di sini
                      </p>
                      <p className="mb-4 text-steel">atau klik untuk memilih file</p>
                      <p className="text-sm text-steel">
                        Support: PDF, PPTX (Max 15MB)
                        <br />
                        <span className="text-xs text-link">
                          *PPTX akan otomatis dikonversi ke PDF
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Judul *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Masukkan judul resource"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Masukkan deskripsi resource"
                  rows={4}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Template Reference */}
              <div className="space-y-2">
                <Label>Template Referensi (opsional)</Label>
                {/* Radix Select reserves "" for "no selection", so the explicit choice uses NO_TEMPLATE. */}
                <Select value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value === NO_TEMPLATE ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_TEMPLATE}>Tanpa template</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.material_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="cyber security, panduan, keamanan (pisahkan dengan koma)"
                />
                <p className="text-sm text-steel">
                  Pisahkan dengan koma untuk multiple tags
                </p>
              </div>

              {/* Review + Submit */}
              <div className="pt-4 space-y-3">
                <Button
                  type="button"
                  disabled={reviewLoading || !selectedFile}
                  variant="secondary"
                  className="w-full py-3 text-lg"
                  onClick={handleReview}
                >
                  {reviewLoading ? 'Melakukan review...' : 'Review Dokumen dengan AI'}
                </Button>

                {reviewResult && (
                  <Card className="border border-border bg-secondary/50">
                    <CardHeader>
                      <CardTitle>Review AI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm font-mono whitespace-pre-wrap">{reviewResult}</pre>
                    </CardContent>
                  </Card>
                )}

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 text-lg"
                >
                  {loading ? 'Mengupload...' : 'Upload Resource'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminUpload
