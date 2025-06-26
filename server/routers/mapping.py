from fastapi import APIRouter, Body
from services.mapping import lock_text, ai_process

router = APIRouter()

@router.post("/lock")
def lock_content(doc_id: str = Body(...), locked_ids: list = Body(...)):
    result = lock_text(doc_id, locked_ids)
    return result

@router.post("/ai_process")
def ai_process_content(doc_id: str = Body(...), ai_mode: dict = Body(...)):
    result = ai_process(doc_id, ai_mode)
    return result

@router.get("/source")
def get_source(slide_id: int, doc_id: str):
    # 伪代码：查找 slide_id 对应的原文内容
    return {"slide_id": slide_id, "source": "原文内容"}

@router.get("/slide")
def get_slide(content_id: str, doc_id: str):
    # 伪代码：查找 content_id 对应的幻灯片编号
    return {"content_id": content_id, "slide_id": 1}