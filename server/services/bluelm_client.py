import uuid
import time
import random
import string
import hashlib
import hmac
import base64
from urllib.parse import quote
import requests

BLUELM_APP_ID  = "2025703335"
BLUELM_APP_KEY = "KGBovLFLFkrdkcFs"
DOMAIN         = "api-ai.vivo.com.cn"
URI            = "/vivogpt/completions"
URL            = f"https://{DOMAIN}{URI}"
METHOD         = "POST"

def _gen_headers(app_id, app_key, method, uri, params):
    # 1. 时戳与随机串
    timestamp = str(int(time.time()))
    nonce = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    # 2. canonical_query_string
    if params:
        items = []
        for k in sorted(params):
            v = params[k]
            items.append(f"{quote(str(k), safe='')}={quote(str(v), safe='')}")
        canonical_qs = "&".join(items)
    else:
        canonical_qs = ""
    # 3. 签名所需的 headers 字符串
    signed_headers_str = (
        f"x-ai-gateway-app-id:{app_id}\n"
        f"x-ai-gateway-timestamp:{timestamp}\n"
        f"x-ai-gateway-nonce:{nonce}"
    )
    # 4. 构造 signing string
    signing_string = (
        f"{method}\n"
        f"{uri}\n"
        f"{canonical_qs}\n"
        f"{app_id}\n"
        f"{timestamp}\n"
        f"{signed_headers_str}"
    )
    # 5. HMAC-SHA256 + HEX + Base64
    digest = hmac.new(
        app_key.encode(),
        signing_string.encode(),
        hashlib.sha256
    ).digest()
    signature = base64.b64encode(digest).decode()

    return {
        "Content-Type": "application/json",
        "X-AI-GATEWAY-APP-ID": app_id,
        "X-AI-GATEWAY-TIMESTAMP": timestamp,
        "X-AI-GATEWAY-NONCE": nonce,
        "X-AI-GATEWAY-SIGNED-HEADERS": "x-ai-gateway-app-id;x-ai-gateway-timestamp;x-ai-gateway-nonce",
        "X-AI-GATEWAY-SIGNATURE": signature,
    }

def call_bluelm_api(prompt):
    params = {"requestId": str(uuid.uuid4())}
    body = {
        "prompt": prompt,
        "model": "vivo-BlueLM-TB-Pro",
        "sessionId": str(uuid.uuid4()),
        "extra": {}
    }
    # 生成签名头
    headers = _gen_headers(BLUELM_APP_ID, BLUELM_APP_KEY, METHOD, URI, params)

    # 发送请求
    resp = requests.post(URL, headers=headers, params=params, json=body, timeout=30)
    resp.raise_for_status()
    result = resp.json()
    if result.get("code") != 0:
        raise RuntimeError(f"API 返回错误：{result.get('msg')}")
    return result["data"]["content"]

