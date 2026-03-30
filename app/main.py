from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from app.api import subscribers, devices

app = FastAPI(title="webOS Subscription Service")

app.mount("/static", StaticFiles(directory="app/static"), name="static")

app.include_router(subscribers.router, prefix="/api", tags=["Subscribers"])
app.include_router(devices.router, prefix="/api", tags=["Devices"])

_index_html = Path("app/templates/index.html").read_text()


@app.get("/", response_class=HTMLResponse)
def root():
    return HTMLResponse(_index_html)


@app.get("/health")
def health():
    return {"status": "ok"}
