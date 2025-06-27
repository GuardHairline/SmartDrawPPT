from fastapi import APIRouter, Body, Query, HTTPException
from fastapi.responses import FileResponse
import os, json
from services.ppt_generator import generate_ppt, generate_ppt_with_template
from services.ppt_to_image import ppt_to_images

router = APIRouter()

@router.post("/generate")
def generate(doc_id: str = Body(...), structure: list = Body(...), template: str = Body('none')):
    if template in ('none', '', None):
        ppt_path = generate_ppt(doc_id, structure)
    else:
        ppt_path = generate_ppt_with_template(doc_id, structure, template)
    if not os.path.exists(ppt_path):
        raise HTTPException(status_code=500, detail=f'PPT文件未生成: {ppt_path}')
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

@router.get('/download')
def download_ppt(doc_id: str):
    # 获取当前文件（ppt.py）所在目录
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ppt_path = os.path.join(base_dir, 'output', f'{doc_id}.pptx')
    # print('PPT绝对路径:', ppt_path)
    if not os.path.exists(ppt_path):
        raise HTTPException(status_code=404, detail='PPT文件不存在')
    return FileResponse(ppt_path, filename=f'{doc_id}.pptx', media_type='application/vnd.openxmlformats-officedocument.presentationml.presentation')

@router.get("/template_list")
def get_template_list():
    template_dir = "server/templates"
    templates = []
    for fname in os.listdir(template_dir):
        if fname.endswith(".pptx"):
            name = os.path.splitext(fname)[0]
            templates.append(name)
    return {"templates": templates}
