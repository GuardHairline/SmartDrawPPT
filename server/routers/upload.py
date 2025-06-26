from fastapi import APIRouter, UploadFile, File
import uuid, os

router = APIRouter()

@router.post("/")
async def upload_doc(file: UploadFile = File(...)):
    doc_id = str(uuid.uuid4())
    save_dir = "user_input"
    os.makedirs(save_dir, exist_ok=True)  # 确保目录存在
    save_path = f"{save_dir}/{doc_id}_{file.filename}"
    with open(save_path, "wb") as f:
        f.write(await file.read())
    return {"doc_id": doc_id, "filename": file.filename}
