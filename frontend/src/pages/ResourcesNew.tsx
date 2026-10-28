import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, BookOpen, Download, Filter, Upload, Trash2, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ResourceService } from '@/services/resourceService'
import type { Resource } from '@/types/resource'
import { useNavigate } from 'react-router-dom'

const ResourcesNew = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categories, setCategories] = useState<string[]>([])
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadResources()
    loadCategories()
  }, [])

  useEffect(() => {
    filterResources()
  }, [resources, searchQuery, selectedCategory])

  const loadResources = async () => {
    try {
      setLoading(true)
      const data = await ResourceService.getAdminResources()
      setResources(data)
    } catch (error) {
      console.error('Error loading resources:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat resources',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await ResourceService.getCategories()
      setCategories(data.categories)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const filterResources = () => {
    let filtered = resources

    if (searchQuery) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory)
    }

    setFilteredResources(filtered)
  }

  const handleDownload = (fileUrl: string, title: string) => {
    if (fileUrl) {
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = title
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDelete = async (resourceId: string) => {
    if (window.confirm('Yakin ingin menghapus resource ini?')) {
      try {
        await ResourceService.deleteResource(resourceId)
        toast({
          title: 'Berhasil',
          description: 'Resource berhasil dihapus'
        })
        loadResources()
      } catch (error) {
        console.error('Error deleting resource:', error)
        toast({
          title: 'Error',
          description: 'Gagal menghapus resource',
          variant: 'destructive'
        })
      }
    }
  }

  const handleTogglePublish = async (resourceId: string, publish: boolean) => {
    try {
      await ResourceService.togglePublish(resourceId, publish)
      toast({
        title: publish ? 'Dipublikasikan' : 'Diarsipkan',
        description: `Resource berhasil ${publish ? 'dipublikasikan' : 'disembunyikan'}`
      })
      loadResources()
    } catch (error) {
      console.error('Publish toggle failed:', error)
      toast({
        title: 'Error',
        description: 'Gagal mengubah status publikasi',
        variant: 'destructive'
      })
    }
  }


  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return '📄'
      case 'pptx':
      case 'ppt':
        return '📊'
      case 'docx':
      case 'doc':
        return '📝'
      default:
        return '📁'
    }
  }

  if (loading) {
    return (
      <div>
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1 
              className="mb-4 text-heading-1 text-ink-strong"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Resource Center
            </motion.h1>
            <motion.p 
              className="mb-8 text-subtitle text-steel"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Temukan panduan, template, dan materi edukasi cyber security
            </motion.p>

            {/* Admin Controls */}
            <div className="flex justify-center gap-4 mb-8">
              <Button 
                onClick={() => navigate('/admin/upload')}
                className="px-6 py-3"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Resource
              </Button>
              <Button 
                onClick={() => navigate('/ai-generator')}
                variant="secondary"
                className="px-6 py-3"
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Generator
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-steel h-5 w-5" aria-hidden="true" />
              <Input
                placeholder="Cari resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-canvas border-hairline"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 h-12 bg-canvas border-hairline">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-canvas border-hairline">
              <CardContent className="p-6 text-center">
                <div className="mb-2 text-heading-3 text-primary">{resources.length}</div>
                <div className="text-steel">Total Resources</div>
              </CardContent>
            </Card>
            <Card className="bg-canvas border-hairline">
              <CardContent className="p-6 text-center">
                <div className="mb-2 text-heading-3 text-primary">{categories.length}</div>
                <div className="text-steel">Kategori</div>
              </CardContent>
            </Card>
            <Card className="bg-canvas border-hairline">
              <CardContent className="p-6 text-center">
                <div className="mb-2 text-heading-3 text-primary">{filteredResources.length}</div>
                <div className="text-steel">Hasil Pencarian</div>
              </CardContent>
            </Card>
          </div>

          {/* Resources Grid */}
          {filteredResources.length === 0 ? (
            <Card className="bg-canvas border-hairline">
              <CardContent className="p-12 text-center">
                <BookOpen className="mx-auto mb-4 h-16 w-16 text-steel" aria-hidden="true" />
                <h3 className="mb-2 text-heading-5 text-ink-strong">
                  {searchQuery || selectedCategory ? 'Tidak ada resource yang ditemukan' : 'Belum ada resource'}
                </h3>
                <p className="text-steel">
                  {searchQuery || selectedCategory 
                    ? 'Coba ubah kata kunci pencarian atau filter kategori' 
                    : 'Resource akan muncul di sini setelah diupload'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group rounded-xl border-hairline bg-canvas transition-colors duration-state hover:border-hairline-strong">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className="border-soft-border bg-soft text-ink-strong hover:bg-soft">
                          {resource.category}
                        </Badge>
                        <span className="text-2xl">
                          {getFileIcon(resource.file_type)}
                        </span>
                      </div>
                      <CardTitle className="text-heading-5 text-ink-strong">
                        {resource.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="mb-4 line-clamp-3 text-sm text-steel">
                        {resource.description}
                      </p>
                      
                      {/* Tags */}
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {resource.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge 
                              key={tagIndex} 
                              variant="outline" 
                              className="border-hairline bg-soft text-xs text-ink"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {resource.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{resource.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* File Info */}
                      <div className="flex justify-between items-center mb-4 text-sm text-steel">
                        <span>{resource.file_type.toUpperCase()}</span>
                        <span>{resource.file_size}</span>
                      </div>
                      
                      {/* Actions */}
                       <div className="flex gap-2">
                         <Button 
                           onClick={() => handleDownload(resource.file_url, resource.title)}
                           className="flex-1"
                           size="sm"
                         >
                           <Download className="h-4 w-4 mr-2" />
                           Download
                         </Button>
                         <Button 
                           onClick={() => handleTogglePublish(resource.id, !resource.published)}
                           variant="outline"
                           size="sm"
                         >
                           {resource.published ? 'Unpublish' : 'Publish'}
                         </Button>
                         <Button 
                           onClick={() => handleDelete(resource.id)}
                           variant="destructive"
                           size="sm"
                           className="px-3"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResourcesNew
