# src/ppt_generator.py
def generate_ppt(segments: List[str], template_path: str, output_path: str):
    """
    将分段后的文本组合至 PPT 模板中，按一段一页的方式生成幻灯片。
    """
    prs = Presentation(template_path)
    # 假定模板中含有空白布局 (layout index 0)
    blank_layout = prs.slide_layouts[0]

    for seg in segments:
        slide = prs.slides.add_slide(blank_layout)
        # 模板没有文本框时，我们新建一个
        left = top = width = height = None  # 默认全屏
        tx_box = slide.shapes.add_textbox(left or prs.slide_width * 0.1,
                                          top or prs.slide_height * 0.1,
                                          width or prs.slide_width * 0.8,
                                          height or prs.slide_height * 0.8)
        tf = tx_box.text_frame
        tf.text = seg

    prs.save(output_path)
    print(f"PPT 已生成并保存到：{output_path}")