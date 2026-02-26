from supabase import create_client

from config import settings


supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
