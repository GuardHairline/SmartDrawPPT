import requests
import os
import yaml
def load_id_key():
    config_path = os.path.join(os.path.dirname(__file__), '../config/settings.yaml')
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)
    
settings = load_id_key()
app_id = settings['AppID']
app_key = settings['AppKEY']
def call_bluelm_api(text, app_id, app_key):
    url = "https://chat.vivo.com.cn/api/llm/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {app_key}"
    }
    payload = {
        "app_id": app_id,
        "messages": [{"role": "user", "content": text}],
        "model": "bluelm-70b-chat"
    }
    resp = requests.post(url, headers=headers, json=payload)
    return resp.json()
