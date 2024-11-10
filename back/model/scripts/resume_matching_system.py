import os
os.environ['KMP_DUPLICATE_LIB_OK']='TRUE'

import json
from transformers import AutoTokenizer, AutoModel, BertTokenizer, BertModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import torch
import numpy as np
import re
import logging
from model.scripts.use_trained_model import ResumeMatcherPredictor
import spacy

class ResumeMatchingSystem:
    def __init__(self):
        self.bert_matcher = BertModel.from_pretrained('bert-base-multilingual-cased')
        self.tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased')
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.bert_matcher.to(self.device)
        self.nlp = spacy.load('ru_core_news_sm')
        self.tfidf = TfidfVectorizer()

    def get_ml_scores(self, vacancy_text: str, resume_text: str):
        try:
            # Используем существующий метод для BERT similarity
            bert_similarity = self.calculate_bert_similarity(
                vacancy_text, 
                resume_text
            )
            
            # Используем существующий метод для skills match
            skills_match = self.analyze_technical_skills(
                vacancy_text, 
                resume_text
            )
            
            # Вычисляем общий скор как в analyze_resume
            total_score = (bert_similarity * 0.7) + (skills_match * 0.3)
            
            return {
                'total_score': float(total_score),
                'bert_similarity': float(bert_similarity),
                'skills_match': float(skills_match)
            }
        except Exception as e:
            print(f"Error in get_ml_scores: {e}")
            return {
                'total_score': 0.0,
                'bert_similarity': 0.0,
                'skills_match': 0.0
            }

    def match_experience(self, resume_exp: str, vacancy_exp: str) -> float:
        """Сопоставление опыта работы"""
        exp_levels = {
            'no_experience': 0,
            '1-3': 1,
            '3-5': 2,
            '5+': 3
        }
        
        resume_level = exp_levels.get(resume_exp, 0)
        vacancy_level = exp_levels.get(vacancy_exp, 0)
                        
        if resume_level >= vacancy_level:
            return 1.0
        elif resume_level + 1 == vacancy_level:
            return 0.7
        return 0.3

    def match_education(self, resume_edu: str, vacancy_edu: str) -> float:
        """Сопоставление образования"""
        edu_levels = {
            'secondary': 0,
            'higher': 1,
            'bachelor': 1,
            'master': 2,
            'phd': 3
        }
        
        resume_level = edu_levels.get(resume_edu, 0)
        vacancy_level = edu_levels.get(vacancy_edu, 0)
        
        if resume_level >= vacancy_level:
            return 1.0
        return 0.5

    def match_work_format(self, resume_format: str, vacancy_format: str) -> float:
        """Сопоставление формата работы"""
        if resume_format == vacancy_format:
            return 1.0
        elif vacancy_format == 'hybrid':
            return 0.8
        elif resume_format == 'office' and vacancy_format == 'remote':
            return 0.7
        return 0.5

    def match_location(self, resume_area: str, vacancy_area: str, relocation: bool) -> float:
        """Сопоставление местоположения"""
        if resume_area == vacancy_area:
            return 1.0
        elif relocation:
            return 0.8
        return 0.3

    def match_salary(self, resume_from: int, resume_to: int, 
                    vacancy_from: int, vacancy_to: int) -> float:
        """Сопоставление зарплатных ожиданий"""
        if resume_from <= vacancy_to and resume_to >= vacancy_from:
            return 1.0
        elif abs(resume_from - vacancy_to) <= 50000 or abs(resume_to - vacancy_from) <= 50000:
            return 0.7
        return 0.3

    def match_age(self, resume_from: str, resume_to: str, vacancy_from: str, vacancy_to: str) -> float:
        """Сопоставление возрастных требований"""
        try:
            # Преобразуем строки в числа
            r_from = int(resume_from)
            r_to = int(resume_to)
            v_from = int(vacancy_from)
            v_to = int(vacancy_to)
            
            # Проверяем пересечение диапазонов
            if r_from <= v_to and r_to >= v_from:
                # Полное совпадение
                if r_from >= v_from and r_to <= v_to:
                    return 1.0
                # Частичное совпадение
                return 0.8
            return 0.5
            
        except ValueError:
            print("Ошибка преобразования возраста в число")
            return 0.5
        except Exception as e:
            print(f"Ошибка при сопоставлении возраста: {e}")
            return 0.5