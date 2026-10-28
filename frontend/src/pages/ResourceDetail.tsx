import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Resource } from '@/types/resource'
import { ResourceService } from '@/services/resourceService'
import { Button } from '@/components/ds'
import { Download } from 'lucide-react'

const ResourceDetail = () => {
  const { id } = useParams()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchResource = async () => {
      setLoading(true)
      try {
        const data = await ResourceService.getResource(id)
        setResource(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchResource()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center px-4 py-24">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="flex items-center justify-center px-4 py-24">
        <h1 className="text-center text-heading-5 text-ink-strong">Resource tidak ditemukan.</h1>
      </div>
    )
  }

  return (
    <div>
      <div className="px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <p className="text-eyebrow text-steel">{resource.category}</p>
            <h1 className="text-heading-3 text-ink-strong">{resource.title}</h1>
            <p className="text-steel">{resource.description}</p>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-sm text-steel">{resource.file_size}</span>
              <span className="text-sm text-steel">{resource.file_type}</span>
            </div>
            <Button className="mt-4" expand={false} onClick={() => window.open(resource.file_url, "_blank")}>
              <Download className="h-4 w-4" aria-hidden="true" /> Download
            </Button>
          </div>

          {resource.file_url ? (
            <div className="overflow-hidden rounded-xl border border-hairline">
              <iframe
                src={resource.file_url}
                title={resource.title}
                className="w-full h-[720px]"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-hairline bg-canvas p-6">
              <p className="text-sm text-steel">
                Tidak ada file untuk preview. Ini mungkin AI-generated content.
              </p>
              <pre className="whitespace-pre-wrap text-xs mt-3">{resource.content}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResourceDetail
