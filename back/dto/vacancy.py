from pydantic import BaseModel
from typing import List



class Vacancy(BaseModel):
    title: str
    experience: str
    salary_from: int
    salary_to: int
    currency: str
    work_format: str
    education: str
    age_from: str
    age_to: str
    relocation: bool
    area: str

    class Config:
         from_attributes = True
         
class VacancyResponse(Vacancy):
    id: int
    
    class Config:
        orm_mode = True

class VacancyList(BaseModel):
    items: List[VacancyResponse]
    