import { Resource } from '@/lib/supabase'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || 'https://website-sprint-dev.preview.emergentagent.com'

export class ResourceService {
  private static apiUrl = `${API_BASE_URL}/api`

  // Get all resources
  static async getAllResources(category?: string): Promise<Resource[]> {
    const url = new URL(`${this.apiUrl}/resources`)
    if (category) {
      url.searchParams.set('category', category)
    }
    
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Failed to fetch resources: ${response.statusText}`)
    }
    
    return response.json()
  }

  // Get resource by ID
  static async getResource(id: string): Promise<Resource> {
    const response = await fetch(`${this.apiUrl}/resources/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch resource: ${response.statusText}`)
    }
    
    return response.json()
  }

  // Upload new resource
  static async uploadResource(data: {
    title: string
    description: string
    category: string
    tags: string
    file: File
  }): Promise<{ id: string; title: string; message: string; file_url: string }> {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('category', data.category)
    formData.append('tags', data.tags)
    formData.append('file', data.file)

    const response = await fetch(`${this.apiUrl}/admin/resources/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Upload failed')
    }

    return response.json()
  }

  // Delete resource
  static async deleteResource(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.apiUrl}/admin/resources/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`Failed to delete resource: ${response.statusText}`)
    }

    return response.json()
  }

  // Get categories
  static async getCategories(): Promise<{ categories: string[] }> {
    const response = await fetch(`${this.apiUrl}/categories`)
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`)
    }
    
    return response.json()
  }

  // Health check
  static async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${this.apiUrl}/health`)
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`)
    }
    
    return response.json()
  }
}