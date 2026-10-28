export interface Resource {
  id: string
  title: string
  slug: string
  description: string
  category: string
  tags: string[]
  file_url: string
  file_size: string
  file_type: string
  created_at: string
  content?: string
  published: boolean
}
