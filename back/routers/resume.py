from fastapi import APIRouter
from services import resume as ResumeService

router = APIRouter()

@router.get('/', tags=["resume"])
async def get_resumes(
    text: str = None,
    page: int = None, 
    experience: str = None,
    area: int = None,
    relocation: str = None,
    employment: str = None,
    schedule: str = None,
    salary_from: int = None,
    salary_to: int = None,
    education_level: str = None
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
        education_level
    )

@router.get('/{resume_id}', tags = ["resume"])
async def get_resume_full(
    resume_id: str
):
    return ResumeService.get_resume_by_id(resume_id)