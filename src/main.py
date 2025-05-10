from src.input_handler import load_content
from src.layout_engine import intelligent_layout
from src.ppt_generator import generate_ppt


if __name__ == "__main__":
    user_input = "example.docx"  # 或直接传入文本
    content = load_content(user_input)
    segments = intelligent_layout(content, segment_size=1000)
    generate_ppt(segments, "templates/ppt_template.pptx", "output/result.pptx")