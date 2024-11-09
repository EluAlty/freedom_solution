import uvicorn
from fastapi import FastAPI
from routers import resume as ResumeRouter, vacancy as VacancyRouter
from database import SessionLocal, engine, Base
import os
from dotenv import load_dotenv

Base.metadata.create_all(bind=engine)

dotenv_path=os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

app = FastAPI()
app.include_router(ResumeRouter.router, prefix="/resume")
app.include_router(VacancyRouter.router, prefix="/vacancies")

if __name__ == '__main__':  
    uvicorn.run("main:app", host="0.0.0.0",port=8080, reload=True, workers=3)
