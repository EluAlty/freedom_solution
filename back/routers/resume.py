from fastapi import APIRouter, File, UploadFile
from services import resume as ResumeService
import os

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


UPLOAD_DIRECTORY = os.path.join(os.path.dirname(__file__), "..", "resumes")

@router.put('/{upload}', tags = ["resume"])
async def upload_resume(file: UploadFile):
    if not os.path.exists(UPLOAD_DIRECTORY):
        os.makedirs(UPLOAD_DIRECTORY)

    file_path = os.path.join(UPLOAD_DIRECTORY, file.filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)      

    return {"filename": file.filename}
