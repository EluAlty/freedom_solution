from pydantic import BaseModel
from typing import List

class ResumeDb(BaseModel):
    title: str
    area: str
    experience: str
    education: str
    file_name: str
    hh_url: str
    hh_id: str

    class Config:
         from_attributes = True

class ResumeDbResponse(ResumeDb):
    id: int

    class Config:
        orm_mode = True  

class ResumeDbListResponse(BaseModel):
    items: List[ResumeDbResponse]

class ResumeDbList(BaseModel):
    items: List[ResumeDb]

