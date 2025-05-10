# src/layout_engine.py
def intelligent_layout(text: str, segment_size: int = 500) -> List[str]:
    """
    简易逻辑：按大约 segment_size 字符分段，不修改文本内容。
    对接大模型，可用 BlueLM API 让其返回更合理的分段点。
    """
    if len(text) <= segment_size:
        return [text]
    segments = []
    start = 0
    while start < len(text):
        end = min(start + segment_size, len(text))
        # 尝试后退到最近的换行或空格
        while end < len(text) and text[end] not in ['\n', ' ']:
            end -= 1
        segments.append(text[start:end].strip())
        start = end
    return segments