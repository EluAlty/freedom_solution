from sqlalchemy import Boolean, Column, Integer, String
from database import Base

class Vacancy(Base):
    __tablename__ = 'vacacies'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    experience = Column(String)
    salary_from = Column(Integer)
    salary_to = Column(Integer)
    currency = Column(String)
    work_format = Column(String)
    education = Column(String)
    age_from = Column(String)
    age_to = Column(String)
    relocation = Column(Boolean)
    area = Column(String)
    

