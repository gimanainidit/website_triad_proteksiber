import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wand2, ArrowLeft, Brain, FileText, Lightbulb } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ResourceService } from '@/services/resourceService'

interface GenerationTypes {
  material_types: Record<string, string>
  generation_types: Record<string, string>
  difficulty_levels: string[]
}

const AIGenerator = () => {
  const [loading, setLoading] = useState(false)
  const [generationTypes, setGenerationTypes] = useState<GenerationTypes | null>(null)
  const [activeTab, setActiveTab] = useState('create-new')
  const [resources, setResources] = useState<any[]>([])
  const [generatedContent, setGeneratedContent] = useState<string>('')
  
  // Form states
  const [createForm, setCreateForm] = useState({
    prompt: '',
    material_type: 'guide',
    title: '',
    description: '',
    category: 'AI Generated',
    tags: 'ai-generated',
    context: ''
  })

  const [enhanceForm, setEnhanceForm] = useState({
    resource_id: '',
    generation_type: 'summary',
    specific_prompt: '',
    save_as_new_resource: true,
    new_title: '',
    new_category: ''
  })

  const [quizForm, setQuizForm] = useState({
    resource_id: '',
    question_count: 5,
    difficulty: 'intermediate'
  })
  
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    loadGenerationTypes()
    loadResources()
  }, [])

  const loadGenerationTypes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL}/api/ai/generation-types`)
      if (response.ok) {
        const data = await response.json()
        setGenerationTypes(data)
      }
    } catch (error) {
      console.error('Failed to load generation types:', error)
    }
  }

  const loadResources = async () => {
    try {
      const data = await ResourceService.getAllResources()
      setResources(data)
    } catch (error) {
      console.error('Failed to load resources:', error)
    }
  }

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!createForm.prompt || !createForm.title) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Harap isi prompt dan judul',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    setGeneratedContent('')

    try {
      const formData = new FormData()
      formData.append('prompt', createForm.prompt)
      formData.append('material_type', createForm.material_type)
      formData.append('title', createForm.title)
      formData.append('description', createForm.description)
      formData.append('category', createForm.category)
      formData.append('tags', createForm.tags)
      formData.append('context', createForm.context)
      formData.append('save_as_resource', 'true')

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL}/api/ai/generate-content`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'AI generation failed')
      }

      const result = await response.json()
      setGeneratedContent(result.content)
      
      toast({
        title: 'Berhasil!',
        description: `${result.message}. Word count: ${result.word_count} words`
      })

      // Reset form
      setCreateForm({
        prompt: '',
        material_type: 'guide',
        title: '',
        description: '',
        category: 'AI Generated',
        tags: 'ai-generated',
        context: ''
      })
      
    } catch (error) {
      console.error('AI generation error:', error)
      toast({
        title: 'Generasi AI gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat generate content',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEnhanceResource = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!enhanceForm.resource_id || !enhanceForm.specific_prompt) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Harap pilih resource dan isi prompt',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    setGeneratedContent('')

    try {
      const formData = new FormData()
      formData.append('generation_type', enhanceForm.generation_type)
      formData.append('specific_prompt', enhanceForm.specific_prompt)
      formData.append('save_as_new_resource', enhanceForm.save_as_new_resource.toString())
      formData.append('new_title', enhanceForm.new_title)
      formData.append('new_category', enhanceForm.new_category)

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL}/api/ai/generate-from-resource/${enhanceForm.resource_id}`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Enhancement failed')
      }

      const result = await response.json()
      setGeneratedContent(result.content)
      
      toast({
        title: 'Berhasil!',
        description: `Content enhanced successfully. Output: ${result.output_length} words`
      })
      
    } catch (error) {
      console.error('Enhancement error:', error)
      toast({
        title: 'Enhancement gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat enhance resource',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!quizForm.resource_id) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Harap pilih resource untuk membuat quiz',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    setGeneratedContent('')

    try {
      const formData = new FormData()
      formData.append('question_count', quizForm.question_count.toString())
      formData.append('difficulty', quizForm.difficulty)
      formData.append('save_as_resource', 'true')

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL}/api/ai/create-quiz/${quizForm.resource_id}`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Quiz generation failed')
      }

      const result = await response.json()
      setGeneratedContent(result.quiz_content)
      
      toast({
        title: 'Berhasil!',
        description: `Quiz created with ${result.question_count} ${result.difficulty} questions`
      })
      
    } catch (error) {
      console.error('Quiz generation error:', error)
      toast({
        title: 'Pembuatan quiz gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat quiz',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!generationTypes) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/resources')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Resources
          </Button>
        </div>

        <Card className="shadow-xl border-border">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Brain className="h-6 w-6" />
              AI Content Generator
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create-new" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Buat Baru
                </TabsTrigger>
                <TabsTrigger value="enhance" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Enhance Resource
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Buat Quiz
                </TabsTrigger>
              </TabsList>

              {/* Create New Content Tab */}
              <TabsContent value="create-new" className="mt-6">
                <form onSubmit={handleCreateContent} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="prompt">Prompt AI *</Label>
                        <Textarea
                          id="prompt"
                          value={createForm.prompt}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, prompt: e.target.value }))}
                          placeholder="Buatkan panduan keamanan password yang komprehensif untuk UMKM..."
                          rows={4}
                          required
                        />
                      </div>

                      <div>
                        <Label>Tipe Material</Label>
                        <Select value={createForm.material_type} onValueChange={(value) => setCreateForm(prev => ({ ...prev, material_type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(generationTypes.material_types).map(([key, description]) => (
                              <SelectItem key={key} value={key}>
                                {key.charAt(0).toUpperCase() + key.slice(1)} - {description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="context">Konteks Tambahan</Label>
                        <Textarea
                          id="context"
                          value={createForm.context}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, context: e.target.value }))}
                          placeholder="Konteks atau informasi tambahan yang relevan..."
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Judul *</Label>
                        <Input
                          id="title"
                          value={createForm.title}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Panduan Keamanan Password untuk UMKM"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea
                          id="description"
                          value={createForm.description}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Deskripsi singkat tentang content yang akan dihasilkan"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Kategori</Label>
                        <Input
                          id="category"
                          value={createForm.category}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                          placeholder="AI Generated"
                        />
                      </div>

                      <div>
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                          id="tags"
                          value={createForm.tags}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="ai-generated, security, guide"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 text-lg"
                  >
                    {loading ? 'Generating AI Content...' : 'Generate Content'}
                  </Button>
                </form>
              </TabsContent>

              {/* Enhance Resource Tab */}
              <TabsContent value="enhance" className="mt-6">
                <form onSubmit={handleEnhanceResource} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Pilih Resource</Label>
                        <Select value={enhanceForm.resource_id} onValueChange={(value) => setEnhanceForm(prev => ({ ...prev, resource_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih resource untuk di-enhance" />
                          </SelectTrigger>
                          <SelectContent>
                            {resources.map((resource) => (
                              <SelectItem key={resource.id} value={resource.id}>
                                {resource.title} ({resource.category})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Tipe Enhancement</Label>
                        <Select value={enhanceForm.generation_type} onValueChange={(value) => setEnhanceForm(prev => ({ ...prev, generation_type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(generationTypes.generation_types).map(([key, description]) => (
                              <SelectItem key={key} value={key}>
                                {key.charAt(0).toUpperCase() + key.slice(1)} - {description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="specific_prompt">Instruksi Spesifik *</Label>
                        <Textarea
                          id="specific_prompt"
                          value={enhanceForm.specific_prompt}
                          onChange={(e) => setEnhanceForm(prev => ({ ...prev, specific_prompt: e.target.value }))}
                          placeholder="Buatkan summary yang fokus pada langkah implementasi..."
                          rows={4}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="save_as_new"
                          checked={enhanceForm.save_as_new_resource}
                          onChange={(e) => setEnhanceForm(prev => ({ ...prev, save_as_new_resource: e.target.checked }))}
                        />
                        <Label htmlFor="save_as_new">Simpan sebagai resource baru</Label>
                      </div>

                      {enhanceForm.save_as_new_resource && (
                        <>
                          <div>
                            <Label htmlFor="new_title">Judul Baru</Label>
                            <Input
                              id="new_title"
                              value={enhanceForm.new_title}
                              onChange={(e) => setEnhanceForm(prev => ({ ...prev, new_title: e.target.value }))}
                              placeholder="Judul untuk resource baru"
                            />
                          </div>

                          <div>
                            <Label htmlFor="new_category">Kategori Baru</Label>
                            <Input
                              id="new_category"
                              value={enhanceForm.new_category}
                              onChange={(e) => setEnhanceForm(prev => ({ ...prev, new_category: e.target.value }))}
                              placeholder="Kategori untuk resource baru"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 text-lg"
                  >
                    {loading ? 'Enhancing Resource...' : 'Enhance Resource'}
                  </Button>
                </form>
              </TabsContent>

              {/* Create Quiz Tab */}
              <TabsContent value="quiz" className="mt-6">
                <form onSubmit={handleCreateQuiz} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Pilih Resource</Label>
                        <Select value={quizForm.resource_id} onValueChange={(value) => setQuizForm(prev => ({ ...prev, resource_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih resource untuk dibuat quiz" />
                          </SelectTrigger>
                          <SelectContent>
                            {resources.filter(r => r.content).map((resource) => (
                              <SelectItem key={resource.id} value={resource.id}>
                                {resource.title} ({resource.category})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="question_count">Jumlah Pertanyaan</Label>
                        <Select value={quizForm.question_count.toString()} onValueChange={(value) => setQuizForm(prev => ({ ...prev, question_count: parseInt(value) }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 Pertanyaan</SelectItem>
                            <SelectItem value="5">5 Pertanyaan</SelectItem>
                            <SelectItem value="10">10 Pertanyaan</SelectItem>
                            <SelectItem value="15">15 Pertanyaan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Tingkat Kesulitan</Label>
                        <Select value={quizForm.difficulty} onValueChange={(value) => setQuizForm(prev => ({ ...prev, difficulty: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {generationTypes.difficulty_levels.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium py-3 text-lg"
                  >
                    {loading ? 'Membuat Quiz...' : 'Buat Quiz'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Generated Content Display */}
            {generatedContent && (
              <Card className="mt-8 border-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg">Generated Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {generatedContent}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AIGenerator
