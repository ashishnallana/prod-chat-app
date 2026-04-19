import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from supabase import create_client, Client
from shared.config import settings

router = APIRouter()

# Initialize Supabase client
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Generate unique filename
    file_ext = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_ext}"

    try:
        # Read file contents
        contents = await file.read()

        # Upload to Supabase Storage
        res = supabase.storage.from_(settings.supabase_bucket).upload(
            path=unique_filename,
            file=contents,
            file_options={"content-type": file.content_type}
        )

        # Get public URL
        public_url = supabase.storage.from_(settings.supabase_bucket).get_public_url(unique_filename)
        
        return {"url": public_url, "filename": unique_filename}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
