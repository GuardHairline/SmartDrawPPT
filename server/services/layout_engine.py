import os
import uuid
import time
import requests
import yaml
from auth_util import gen_sign_headers

URI = '/vivogpt/completions'
DOMAIN = 'api-ai.vivo.com.cn'
METHOD = 'POST'


def load_config():
    with open(os.path.join(os.path.dirname(__file__), '../..', 'config', 'settings.yaml'), 'r') as f:
        cfg = yaml.safe_load(f)
    return cfg['AppID'], cfg['AppKEY']


def generate_ppt_layout(text_content: str) -> list:
    """
    使用 BlueLM 模型对输入文本进行排版。
    """
    params = {
        'requestId': str(uuid.uuid4())
    }
    print('requestId:', params['requestId'])

    prompt = f"根据以下文本内容，生成 PPT 大纲并进行排版，按标题1、标题2、标题3、正文进行分块，支持图片和图表占位符。\n\n{text_content}"

    data = {
        'prompt': prompt,
        'model': 'vivo-BlueLM-TB-Pro',
        'sessionId': str(uuid.uuid4()),
        'extra': {
            'temperature': 0.9
        }
    }

    APP_ID, APP_KEY = load_config()
    headers = gen_sign_headers(APP_ID, APP_KEY, METHOD, URI, params)
    headers['Content-Type'] = 'application/json'

    start_time = time.time()
    url = f'https://{DOMAIN}{URI}'
    response = requests.post(url, json=data, headers=headers, params=params)

    if response.status_code == 200:
        res_obj = response.json()
        if res_obj['code'] == 0 and res_obj.get('data'):
            content = res_obj['data']['content']
            print(f'final content:\n{content}')
            ppt_content = parse_content(content)
            return ppt_content
    else:
        print(response.status_code, response.text)

    end_time = time.time()
    timecost = end_time - start_time
    print('请求耗时: %.2f秒' % timecost)


def parse_content(content: str) -> list:
    """
    解析 BlueLM 返回的内容，转化为 PPT 排版所需的列表结构
    """
    slides = []
    sections = content.split('\n')  # 假设 BlueLM 按行返回内容
    slide = {"title": "", "text": "", "image": "", "chart": ""}
    for section in sections:
        if section.strip() == "":
            continue  # 忽略空行
        if "——" in section:  # 假设包含"——"的行是标题部分
            if slide["title"] != "":
                slides.append(slide)  # 把上一个幻灯片加入
            slide = {"title": section.strip(), "text": "", "image": "", "chart": ""}
        elif "image:" in section:  # 假设包含"image:"的行是图像占位符
            slide["image"] = section.strip().replace("image:", "").strip()
        elif "chart:" in section:  # 假设包含"chart:"的行是图表占位符
            slide["chart"] = section.strip().replace("chart:", "").strip()
        else:
            slide["text"] += section.strip() + " "  # 拼接正文内容
    if slide["title"] != "":
        slides.append(slide)  # 添加最后一个幻灯片
    return slides


# 示例：调用生成排版的功能
if __name__ == "__main__":
    text_content = "这是主标题和副标题的内容示例，以下是正文内容，假设这是一个长文档，包含多个段落。可以根据要求分为多个页面..."
    ppt_layout = generate_ppt_layout(text_content)
    print("生成的 PPT 排版：", ppt_layout)
