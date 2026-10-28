def create_slug(title: str) -> str:
    slug = title.lower().replace(" ", "-")
    slug = ''.join(c for c in slug if c.isalnum() or c == '-')
    while '--' in slug:
        slug = slug.replace('--', '-')
    return slug.strip('-')


def format_file_size(size_bytes: int) -> str:
    if size_bytes == 0:
        return "0 B"
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    return f"{size_bytes:.1f} {size_names[i]}"


def resource_payload(resource) -> dict:
    return {
        "id": str(resource.id),
        "title": resource.title,
        "slug": resource.slug,
        "description": resource.description,
        "category": resource.category,
        "tags": resource.tags,
        "file_url": resource.file_url,
        "file_size": resource.file_size,
        "file_type": resource.file_type,
        "created_at": resource.created_at.isoformat(),
        "content": resource.content,
        "published": resource.published,
    }
