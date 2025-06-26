from fastapi import APIRouter, Body, Query
from fastapi.responses import FileResponse
import os, json
from services.ppt_generator import generate_ppt
from services.ppt_to_image import ppt_to_images

router = APIRouter()

@router.post("/generate")
def generate(doc_id: str = Body(...), structure: list = Body(...)):
    ppt_path = generate_ppt(doc_id, structure)
    img_dir = f"output/{doc_id}_images"
    ppt_to_images(ppt_path, img_dir)
    return {"ppt_url": ppt_path}

@router.get("/preview_images")
def preview_images(doc_id: str = Query(...)):
    import os
    img_dir = f"output/{doc_id}_images"
    if not os.path.exists(img_dir):
        return {"images": []}
    # 只要是 .jpg 结尾的都加入
    images = sorted([
        f"/ppt/image?doc_id={doc_id}&img={img}"
        for img in os.listdir(img_dir)
        if img.lower().endswith(".jpg")
    ], key=lambda x: int(''.join(filter(str.isdigit, x)) or 0))
    return {"images": images}

@router.get("/image")
def get_image(doc_id: str = Query(...), img: str = Query(...)):
    img_path = f"output/{doc_id}_images/{img}"
    return FileResponse(img_path, media_type="image/jpeg")

@router.get("/mapping")
def get_mapping(doc_id: str = Query(...)):
    with open(f"output/{doc_id}_mapping.json", encoding="utf-8") as f:
        mapping = json.load(f)
    return mapping
