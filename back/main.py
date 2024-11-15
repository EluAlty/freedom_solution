import uvicorn
from fastapi import FastAPI
from routers import resume as ResumeRouter, vacancy as VacancyRouter, resume_storage as ResumeStorageRouter
from database import SessionLocal, engine, Base
import os
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)


app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:8080",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ResumeRouter.router, prefix="/resume")
app.include_router(VacancyRouter.router, prefix="/vacancies")
app.include_router(ResumeStorageRouter.router, prefix="/resume-storage")

if __name__ == '__main__':  
    uvicorn.run("main:app", host="0.0.0.0",port=8080, reload=True, workers=3)
