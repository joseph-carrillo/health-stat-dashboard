# main.py
# Entry point for the Health Statistics Dashboard API
# DOH-NIR CHD Philippines

from fastapi import FastAPI

app = FastAPI(
    title="DOH-NIR Health Statistics Dashboard",
    description="API for the NIR CHD Health Statistics Dashboard",
    version="0.1.0"
)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "DOH-NIR Dashboard API is running"}