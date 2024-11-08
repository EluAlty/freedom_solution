import uvicorn
from fastapi import FastAPI
from routers import resume as ResumeRouter

import os
from dotenv import load_dotenv

dotenv_path=os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

app = FastAPI()
app.include_router(ResumeRouter.router, prefix="/resume")

if __name__ == '__main__':  
    uvicorn.run("main:app", host="0.0.0.0",port=8080, reload=True, workers=3)
