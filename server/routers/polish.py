from fastapi import APIRouter, Body
import json, os
from services.bluelm_client import call_bluelm_api
from services.polish_service import polish_page_structured

router = APIRouter()

def load_structure(doc_id):
    with open(f"output/{doc_id}_structure.json", encoding="utf-8") as f:
        return json.load(f)

def save_middle(doc_id, structure):
    with open(f"output/{doc_id}_middle.json", "w", encoding="utf-8") as f:
        json.dump(structure, f, ensure_ascii=False)

@router.post("/polish_all")
def polish_all(doc_id: str = Body(...), mode: str = Body(...)):
    structure = load_structure(doc_id)
    new_structure = []
    for item in structure:
        if item.get('type') == 'paragraph':
            new_text = call_bluelm_api(item['text'], mode)
            new_structure.append({**item, 'text': new_text})
        else:
            new_structure.append(item)
    save_middle(doc_id, new_structure)
    return {"new_structure": new_structure}

@router.post("/polish_page")
def polish_page(doc_id: str = Body(...), para_ids: list = Body(...), mode: str = Body(...)):
    structure = load_structure(doc_id)
    new_structure = []
    for item in structure:
        if item['id'] in para_ids and item.get('type') == 'paragraph':
            new_text = call_bluelm_api(item['text'], mode)
            new_structure.append({**item, 'text': new_text})
        else:
            new_structure.append(item)
    save_middle(doc_id, new_structure)
    return {"new_content": [i for i in new_structure if i['id'] in para_ids]}

@router.post("/polish_page_structured")
def polish_page_structured_api(doc_id: str = Body(...), para_ids: list = Body(...), mode: str = Body(...)):
    result = polish_page_structured(doc_id, para_ids, mode)
    return result
