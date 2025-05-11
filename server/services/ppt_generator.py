from pptx import Presentation
from pptx.util import Inches, Pt
import math


def set_font(para, font_size, font_name="Microsoft YaHei"):
    """
    设置段落的字体和字号
    """
    for run in para.runs:
        run.font.size = Pt(font_size)
        run.font.name = font_name
        run.font.bold = None  # 设置为非加粗，可以根据需要进行调整


def add_title_slide(prs, headline, subheading):
    slide = prs.slides.add_slide(prs.slide_layouts[0])  # 主标题和副标题布局
    title = slide.shapes.title
    subtitle = slide.placeholders[1]
    title.text = headline
    subtitle.text = subheading

    set_font(title, 50)  # 主标题字号
    set_font(subtitle, 32)  # 副标题字号


def adjust_font_size(shape, max_font_size):
    """
    调整字体大小，使其适应文本框的大小。确保字体大小在合理范围内（100 到 400000之间）。
    """
    text = shape.text
    char_count = len(text)

    # 确保计算出的 font_size 不会小于 100 或大于 400000
    if char_count > 50:
        font_size = max_font_size - math.floor(char_count / 2)
    else:
        font_size = max_font_size

    # 限制字体大小范围
    font_size = max(100, min(font_size, 400000))

    for paragraph in shape.text_frame.paragraphs:
        for run in paragraph.runs:
            run.font.size = Pt(font_size)


def add_text_slide(prs, title, text, title_size=30, text_size=18):
    slide = prs.slides.add_slide(prs.slide_layouts[1])  # 文字内容布局
    title_placeholder = slide.shapes.title
    body = slide.shapes.placeholders[1]

    title_placeholder.text = title
    set_font(title_placeholder, title_size)  # 设置标题字体大小
    body.text = text
    set_font(body, text_size)  # 设置正文字体大小

    # 设置正文首行缩进
    for para in body.text_frame.paragraphs:
        para.level = 0
        para.font.size = Pt(text_size)
        para.space_before = Inches(0.05)  # 设置段落之间的间距
        para.text_frame.paragraph_format.first_line_indent = Inches(0.5)  # 设置首行缩进


def create_ppt(content):
    prs = Presentation()

    # 第一页 - 主标题和副标题
    add_title_slide(prs, content[0]["headline"], content[0]["subheading"])

    # 分页处理正文
    for slide_content in content:
        text = slide_content['text']
        title = f"{slide_content.get('title1', '')} —— {slide_content.get('title2', '')}"

        # 如果正文太长，分割成多页
        paragraphs = [text[i:i + 200] for i in range(0, len(text), 200)]
        for paragraph in paragraphs:
            add_text_slide(prs, title, paragraph)

    prs.save("output/output_ppt.pptx")
    print("PPT 已生成并保存。")


# 示例内容
content = [
    {
        "headline": "主标题",
        "subheading": "副标题",
        "title1": "标题一",
        "title2": "标题二",
        "title3": "标题三",
        "text": "正文内容..." * 30  # 模拟超长文本
    }
]

create_ppt(content)
