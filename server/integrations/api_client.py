# encoding: utf-8
import os
import requests
import yaml
import uuid
import time
from auth_util import gen_sign_headers
URI = '/vivogpt/completions'
DOMAIN = 'api-ai.vivo.com.cn'
METHOD = 'POST'

# 加载配置：AppID 与 AppKEY 存于 config/settings.yaml
def load_config():
    with open(os.path.join(os.path.dirname(__file__), '../..', 'config', 'settings.yaml'), 'r') as f:
        cfg = yaml.safe_load(f)
    return cfg['AppID'], cfg['AppKEY']


def sync_vivogpt():
    params = {
        'requestId': str(uuid.uuid4())
    }
    print('requestId:', params['requestId'])

    data = {
        'prompt': '写一首春天的诗',
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
    url = 'https://{}{}'.format(DOMAIN, URI)
    response = requests.post(url, json=data, headers=headers, params=params)

    if response.status_code == 200:
        res_obj = response.json()
        print(f'response:{res_obj}')
        if res_obj['code'] == 0 and res_obj.get('data'):
            content = res_obj['data']['content']
            print(f'final content:\n{content}')
    else:
        print(response.status_code, response.text)
    end_time = time.time()
    timecost = end_time - start_time
    print('请求耗时: %.2f秒' % timecost)


if __name__ == "__main__":
    sample_prompt = "请解析以下文档结构，并生成 PPT 大纲：……"
    result = sync_vivogpt()
    print("API 返回：", result)
