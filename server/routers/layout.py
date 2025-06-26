from fastapi import APIRouter, Body
from services.input_handler import parse_doc_structure
import json, os

router = APIRouter()

@router.post("/analyze")
def analyze_structure(doc_id: str = Body(...), filename: str = Body(...)):
    structure = parse_doc_structure(doc_id, filename)
    # 保存结构化内容
    os.makedirs("output", exist_ok=True)
    with open(f"output/{doc_id}_structure.json", "w", encoding="utf-8") as f:
        json.dump(structure, f, ensure_ascii=False)
    return {"doc_id": doc_id, "structure": structure}