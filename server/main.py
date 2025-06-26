from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, layout, mapping, ppt, polish
import yaml
import os
def load_settings():
    config_path = os.path.join(os.path.dirname(__file__), '../config/settings.yaml')
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)
    
settings = load_settings()
host = settings['server']['host']
port = settings['server']['port']
reload = settings['server']['reload']

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境请指定前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/upload")
app.include_router(layout.router, prefix="/layout")
app.include_router(mapping.router, prefix="/mapping")
app.include_router(ppt.router, prefix="/ppt")
app.include_router(polish.router, prefix="/polish")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload
    )