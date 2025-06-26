def lock_text(doc_id, locked_ids):
    # 记录锁定内容，实际可存数据库或json
    return {"doc_id": doc_id, "locked_ids": locked_ids}

def ai_process(doc_id, ai_mode):
    # ai_mode: {"para2": "polish", "para4": "summary"}
    # 伪代码：实际应调用 BlueLM
    processed = {}
    for pid, mode in ai_mode.items():
        if mode == "polish":
            processed[pid] = f"{pid}（已润色）"
        elif mode == "summary":
            processed[pid] = f"{pid}（已摘要）"
    return {"doc_id": doc_id, "ai_result": processed}
