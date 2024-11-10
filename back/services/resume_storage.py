from typing import List
import concurrent.futures
from sqlalchemy import or_, create_engine
from sqlalchemy.orm import Session
from models.resume_db import Resume
from models.vacancy import Vacancy
from sklearn.feature_extraction.text import TfidfVectorizer

# Импорты в конце
import os
os.environ['KMP_DUPLICATE_LIB_OK']='TRUE'
import torch
from model.scripts.resume_matching_system import ResumeMatchingSystem

from concurrent.futures import ProcessPoolExecutor
from multiprocessing import cpu_count
import logging

logger = logging.getLogger('uvicorn.error')

def search_resumes(query: str, position: str, db: Session):
    try:
        base_query = db.query(Resume)
        
        # Ищем резюме, где title содержит название вакансии
        resumes = base_query.filter(
            Resume.title.ilike(f"%{position}%")
        ).all()
        
        results = []
        for resume in resumes:
            results.append({
                "id": resume.id,
                "title": resume.title,
                "area": resume.area,
                "experience": resume.experience,
                "education": resume.education,
                "file_name": resume.file_name,
                "hh_url": resume.hh_url,
                "hh_id": resume.hh_id
            })
        
        return {
            "items": results,
            "total": len(results)
        }
        
    except Exception as e:
        logger.error(f"Ошибка в search_resumes: {str(e)}")
        raise e

def calculate_title_similarity(resume_title: str, vacancy_title: str) -> float:
    """Вычисляет схожесть названий должностей"""
    if not resume_title or not vacancy_title:
        return 0.0
        
    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform([resume_title, vacancy_title])
        return float(torch.cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
    except:
        return 0.0

def calculate_experience_match(resume_exp: str, vacancy_exp: str) -> float:
    """Вычисляет соответствие опыта работы"""
    if not resume_exp or not vacancy_exp:
        return 0.0

    # Маппинг опыта в месяцы
    experience_mapping = {
        'no_experience': 0,
        'employment': 0,
        'between1And3': 24,
        'between3And6': 54,
        'moreThan6': 72
    }

    resume_months = experience_mapping.get(resume_exp, 0)
    required_months = experience_mapping.get(vacancy_exp, 0)

    if required_months == 0:
        return 1.0  # Если опыт не требуется, любой опыт подходит
    if resume_months >= required_months:
        return 1.0
    return resume_months / required_months

def calculate_education_match(resume_edu: str, vacancy_edu: str) -> float:
    """Вычисляет соответствие образования"""
