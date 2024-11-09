from sqlalchemy import Column, Integer, String
from database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    area = Column(String)
    experience = Column(String)
    education = Column(String)
    file_name = Column(String)
    hh_url = Column(String)
    hh_id = Column(String)