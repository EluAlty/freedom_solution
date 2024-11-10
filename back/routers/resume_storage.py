from fastapi import APIRouter, File, UploadFile, HTTPException, Query, Depends
from fastapi.responses import StreamingResponse
from services import resume_storage
from services import resume as ResumeService
from dto.resume import DownloadResumeRequest
from dto.resume_db import ResumeDbResponse, ResumeDbList, ResumeDbListResponse
from sqlalchemy.orm import Session
from database import get_db
from models.resume_db import Resume
from models.vacancy import Vacancy

import os
import logging
os.environ['KMP_DUPLICATE_LIB_OK']='TRUE'
from model.scripts.resume_matching_system import ResumeMatchingSystem
from model.scripts.resume_parser import ResumeParser


router = APIRouter()

UPLOAD_DIRECTORY = os.path.join(os.path.dirname(__file__), "..", "resumes")

@router.post('/', tags = ["resume_storage"])
async def add_resumes_to_storage(list: ResumeDbList, db: Session = Depends(get_db)):
    if not os.path.exists(UPLOAD_DIRECTORY):
        os.makedirs(UPLOAD_DIRECTORY)
        
    for resume in list.items:
        pdf_content = ResumeService.download_resume_pdf(resume.hh_url)
        if pdf_content:
            filename = f"{resume.hh_id}.pdf"
            file_path = os.path.join(UPLOAD_DIRECTORY, filename)
            
            with open(file_path, "wb") as f:
                f.write(pdf_content)
                
            resume.file_name = filename
        else:
            print(f"Не удалось скачать PDF для резюме {resume.hh_id}")
        
    return ResumeService.add_resumes_to_storage(list, db)

logger = logging.getLogger('uvicorn.error')
logger.setLevel(logging.DEBUG)

@router.get('/', response_model=ResumeDbListResponse, tags=["resume_storage"])
async def get_resumes_list(db: Session = Depends(get_db)):
    resumes = ResumeService.get_resumes_from_local_storage(db)

    resume_list = [ResumeDbResponse.from_orm(resume) for resume in resumes]
    return ResumeDbListResponse(items=resume_list)

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

@router.post("/analyze")
async def analyze_resume(resume_id: int, vacancy_id: str, db: Session = Depends(get_db)):
    try:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        vacancy = db.query(Vacancy).filter(Vacancy.id == vacancy_id).first()
        
        if not resume or not vacancy:
            raise HTTPException(status_code=404, detail="Resume or vacancy not found")
            
        matching_system = ResumeMatchingSystem()
        scores = matching_system.get_ml_scores(
            vacancy_text=vacancy.title,
            resume_text=resume.title
        )
        
        total_score = (scores['bert_similarity'] * 0.7) + (scores['skills_match'] * 0.3)
        scores['total_score'] = float(total_score)
        
        return scores
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete('/{id}', tags=["resume_storage"])
async def delete_resume(id: int, db: Session = Depends(get_db)):
    try:
        resume = db.query(Resume).filter(Resume.id == id).first()
        
        if not resume:
            raise HTTPException(status_code=404, detail="Резюме не найдено")
            
        # Удаляем файл PDF, если он существует
        if resume.file_name:
            file_path = os.path.join(UPLOAD_DIRECTORY, resume.file_name)
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Удаляем запись из БД
        db.delete(resume)
        db.commit()
        
        return {"message": "Резюме успешно удалено"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/matching/{vacancy_id}')
async def get_matching_resumes(vacancy_id: str, db: Session = Depends(get_db)):
    try:
        vacancy = db.query(Vacancy).filter(Vacancy.id == vacancy_id).first()
        if not vacancy:
            raise HTTPException(status_code=404, detail="Вакансия не найдена")
        
        logger.debug(f"Поиск резюме для вакансии: {vacancy.title}")
        results = resume_storage.search_resumes("", vacancy.title, db)
        logger.debug(f"Найдено {len(results['items'])} подходящих резюме")
        
        return results
        
    except Exception as e:
        logger.error(f"Ошибка при поиске подходящих резюме: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/upload', tags=["resume_storage"])
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # Сохраняем файл временно для анализа
        temp_file_path = os.path.join(UPLOAD_DIRECTORY, file.filename)
        content = await file.read()
        
        with open(temp_file_path, "wb") as f:
            f.write(content)
        
        # Анализируем резюме
        matching_system = ResumeMatchingSystem()
        parser = ResumeParser()
        
        resume_data = parser.parse_pdf_to_json(temp_file_path)
        resume_text = f"{resume_data.get('experience', '')} {resume_data.get('education', '')}"
        
        # Сохраняем в базу данных
        resume = Resume(
            title=resume_data.get("title", "Не указано"),
            area=resume_data.get("area", "Не указано"),
            experience=resume_data.get("experience", "Без опыта"),
            education=resume_data.get("education", "Не указано"),
            file_name=file.filename,
            hh_url="",
            hh_id=""
        )
        
        db.add(resume)
        db.commit()
        db.refresh(resume)
        
        return ResumeDbResponse.from_orm(resume)
        
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        db.rollback()
        logger.error(f"Ошибка при загрузке резюме: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
