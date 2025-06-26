import os
import json
from services.bluelm_client import call_bluelm_api

def polish_page_structured(doc_id, para_ids, mode):
    # 1. 加载结构化内容
    with open(f"output/{doc_id}_structure.json", encoding="utf-8") as f:
        structure = json.load(f)
    # 2. 获取该页所有原文内容
    page_items = [item for item in structure if item['id'] in para_ids]
    # 3. 构造输入JSON
    input_json = {item['id']: item['text'] for item in page_items}
    if mode == "polish":
        prompt = (
            f"请对以下内容进行专业润色，保持输出为JSON格式，只修改内容，不要更改key。"
            "输出示例：{\"para1\": \"润色后内容1\", \"para2\": \"润色后内容2\"}\n"
            f"{json.dumps(input_json, ensure_ascii=False)}"
        )
    elif mode == "summarize":
        prompt = (
            f"请对以下内容进行删减，保留核心要点，输出为JSON格式，只修改内容，不要更改key。"
            "输出示例：{\"para1\": \"删减后内容1\", \"para2\": \"删减后内容2\"}\n"
            f"{json.dumps(input_json, ensure_ascii=False)}"
        )
    elif mode == "add_image":
        prompt = (
            f"请为以下内容生成适合PPT插图的图片描述，输出为JSON格式，只修改内容，不要更改key。"
            "输出示例：{\"para1\": \"图片描述1\", \"para2\": \"图片描述2\"}\n"
            f"{json.dumps(input_json, ensure_ascii=False)}"
        )
    else:
        prompt = json.dumps(input_json, ensure_ascii=False)
    print("\n=== 传入大模型的内容 ===")
    print(prompt)
    # 4. 调用大模型
    output = call_bluelm_api(prompt)
    print("\n=== 大模型返回的内容 ===")
    print(output)
    try:
        result_json = json.loads(output)
    except Exception as e:
        result_json = input_json
    # 5. 生成对比信息
    diff_info = []
    for item in page_items:
        new_text = result_json.get(item['id'], item['text'])
        diff_info.append({
            "id": item['id'],
            "original": item['text'],
            "polished": new_text,
            "changed": item['text'] != new_text
        })
    # 6. 替换中间页内容
    middle_path = f"output/{doc_id}_middle.json"
    if not os.path.exists(middle_path):
        # 如果中间页不存在，先用结构化内容初始化
        with open(f"output/{doc_id}_structure.json", "r", encoding="utf-8") as f:
            structure = json.load(f)
        with open(middle_path, "w", encoding="utf-8") as f:
            json.dump(structure, f, ensure_ascii=False)
    with open(middle_path, "r", encoding="utf-8") as f:
        middle = json.load(f)
    return {"new_content": [i for i in middle if i['id'] in para_ids], "diff": diff_info}
