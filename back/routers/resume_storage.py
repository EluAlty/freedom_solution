from fastapi import APIRouter, File, UploadFile, HTTPException, Query, Depends
from fastapi.responses import StreamingResponse
from services import resume as ResumeService
from dto.resume import DownloadResumeRequest
from dto.resume_db import ResumeDbResponse, ResumeDbList, ResumeDbListResponse
from sqlalchemy.orm import Session
from database import get_db

import os
import io


router = APIRouter()

@router.post('/', tags = ["resume_storage"])
async def add_resumes_to_storage(list: ResumeDbList, db: Session = Depends(get_db)):
    return ResumeService.add_resumes_to_storage(list, db)

import logging
logger = logging.getLogger('uvicorn.error')
logger.setLevel(logging.DEBUG)

@router.get('/', response_model=ResumeDbListResponse, tags=["resume_storage"])
async def get_resumes_list(db: Session = Depends(get_db)):
    resumes = ResumeService.get_resumes_from_local_storage(db)

    resume_list = [ResumeDbResponse.from_orm(resume) for resume in resumes]
    return ResumeDbListResponse(items=resume_list)

UPLOAD_DIRECTORY = os.path.join(os.path.dirname(__file__), "..", "resumes")

@router.put('/{upload}', tags = ["resume_storage"])
async def upload_resume(file: UploadFile):
    if not os.path.exists(UPLOAD_DIRECTORY):
        os.makedirs(UPLOAD_DIRECTORY)

    file_path = os.path.join(UPLOAD_DIRECTORY, file.filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)      

    return {"filename": file.filename}

@router.get('/download', tags=["resume_storage"])
async def download_resume(filename: str):
    file_path = os.path.join(UPLOAD_DIRECTORY, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Файл не найден")
    
    file_stream = open(file_path, "rb")
    response = StreamingResponse(file_stream, media_type="application/octet-stream")
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    
    return response
