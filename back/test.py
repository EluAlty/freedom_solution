from services import resume as ResumeService
from sqlalchemy.orm import Session
from fastapi import Depends
import os
from services import vacancy
from database import get_db

# print(ResumeService.get_resume_by_id("5b3483da0008abdf0e00b0c1c07537436d7767"))