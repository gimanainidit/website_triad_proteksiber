import { Resource } from '@/lib/supabase'
import { apiFetch } from './api'

export interface TemplateMeta {
  id: string
  name: string
  material_type: string
  file_url: string
  version: number
}

export class ResourceService {
  static async getAllResources(category?: string): Promise<Resource[]> {
    const url = new URL('/resources', 'http://placeholder')
    if (category) {
      url.searchParams.set('category', category)
    }
    const query = url.searchParams.toString()
    const path = query ? `/resources?${query}` : '/resources'
    return apiFetch(path)
  }

  static async getResource(id: string): Promise<Resource> {
    return apiFetch(`/resources/${id}`)
  }

  static async uploadResource(data: {
    title: string
    description: string
    category: string
    tags: string
    template_id?: string
    file: File
  }): Promise<{ id: string; title: string; file_url: string }> {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('category', data.category)
    formData.append('tags', data.tags)
    if (data.template_id) formData.append('template_id', data.template_id)
    formData.append('file', data.file)

    return apiFetch('/admin/resources/upload', {
      method: 'POST',
      body: formData,
      skipJsonHeader: true,
    })
  }

  static async deleteResource(id: string) {
    return apiFetch(`/admin/resources/${id}`, { method: 'DELETE' })
  }

  static async updateResource(id: string, payload: { title?: string; description?: string; category?: string; tags?: string; publish?: boolean }) {
    return apiFetch(`/admin/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }

  static async replaceFile(id: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return apiFetch(`/admin/resources/${id}/replace`, {
      method: 'POST',
      body: formData,
      skipJsonHeader: true,
    })
  }

  static async togglePublish(id: string, publish: boolean) {
    const formData = new FormData()
    formData.append('published', publish ? 'true' : 'false')
    return apiFetch(`/admin/resources/${id}/publish`, {
      method: 'POST',
      body: formData,
      skipJsonHeader: true,
    })
  }

  static async reviewDocument(file: File, templateId?: string) {
    const formData = new FormData()
    formData.append('file', file)
    if (templateId) {
      formData.append('template_id', templateId)
    }
    return apiFetch('/admin/ai-review', {
      method: 'POST',
      body: formData,
      skipJsonHeader: true,
    })
  }

  static async getTemplates(): Promise<TemplateMeta[]> {
    return apiFetch('/admin/templates')
  }

  static async uploadTemplate(data: {
    name: string
    material_type: string
    description?: string
    file: File
  }) {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('material_type', data.material_type)
    if (data.description) formData.append('description', data.description)
    formData.append('file', data.file)
    return apiFetch('/admin/templates', {
      method: 'POST',
      body: formData,
      skipJsonHeader: true,
    })
  }

  static async archiveTemplate(id: string) {
    return apiFetch(`/admin/templates/${id}`, { method: 'DELETE' })
  }

  static async getCategories() {
    return apiFetch('/categories')
  }

  static async healthCheck() {
    return apiFetch('/health')
  }
}
