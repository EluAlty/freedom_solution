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

@router.get('/', tags=["resume"])
async def get_resumes(
    text: str,
    page: int = None, 
    experience: str = None,
    area: int = None,
    relocation: str = None,
    employment: str = None,
    schedule: str = None,
    salary_from: int = None,
    salary_to: int = None,
    education_level: str = None,
    currency: str = None
):
    return ResumeService.get_resumes(
        text,
        page,
        experience,
        area,
        relocation,
        employment,
        schedule,
        salary_from,
        salary_to,
        education_level,
        currency
    )

@router.get('/{resume_id}', tags = ["resume"])
async def get_resume_full(
    resume_id: str
):
    return ResumeService.get_resume_by_id(resume_id)

@router.post('/download', tags=["resume"])
async def download_resume(request: DownloadResumeRequest):
    pdf_content = ResumeService.download_resume_pdf(request.resume_url)

    if pdf_content:
        return StreamingResponse(io.BytesIO(pdf_content), media_type="application/pdf", headers={
            "Content-Disposition": f"attachment; filename={request.resume_id}.pdf"
        })
    else:
        raise HTTPException(status_code=404, detail="Resume not found or could not be downloaded")