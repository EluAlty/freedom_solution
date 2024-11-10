import os
import json
from transformers import AutoTokenizer, AutoModel, AutoModelForSequenceClassification, BertTokenizer, BertForSequenceClassification, BertModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import torch
import numpy as np
import re
import logging
from use_trained_model import ResumeMatcherPredictor

# Правильные пути
TEXT_FOLDER = r"D:\Datathon\datathon\freedom_solution\cv_processing\txt"  # папка с резюме в txt
VACANCIES_JSON = r"D:\Datathon\datathon\freedom_solution\model\Vacancy\example.json"  # файл с вакансиями
OUTPUT_MATCHES = r"D:\Datathon\datathon\freedom_solution\model\Vacancy\matches_results.json"  # файл результатов

class ResumeMatchingSystem:
    def __init__(self):
        print("Инициализация ML моделей...")
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.max_length = 512  # Добавляем max_length
        
        # Загрузка обученной модели
        model_path = r'D:\Datathon\datathon\freedom_solution\model\trained_models\best_resume_matcher.pt'
        if os.path.exists(model_path):
            print(f"Загрузка обученной модели из {model_path}")
            self.bert_matcher = ResumeMatcherPredictor()
            self.bert_matcher.load_state_dict(torch.load(model_path))
            self.bert_matcher.eval()
        else:
            print("Предобученная модель не найдена!")
            self.bert_matcher = ResumeMatcherPredictor()
        
        # Инициализация BERT модели
        self.bert_tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased')
        self.bert_model = BertModel.from_pretrained('bert-base-multilingual-cased').to(self.device)
        
        # Кэширование эмбеддингов
        self.embeddings_cache = {}
        
        # Инициализация TF-IDF один раз
        self.tfidf = TfidfVectorizer(stop_words='english')

    def get_ml_scores(self, vacancy_text: str, resume_text: str) -> dict:
        """Получение оценок с помощью различных ML методов"""
        
        # 1. BERT семантическое сходство
        bert_similarity = self.calculate_bert_similarity(vacancy_text, resume_text)
        
        # 2. TF-IDF сходство ключевых слов
        tfidf_similarity = self.calculate_tfidf_similarity(vacancy_text, resume_text)
        
        # 3. Анализ технических навыков
        skills_match = self.analyze_technical_skills(vacancy_text, resume_text)
        
        return {
            'bert_similarity': float(bert_similarity),
            'tfidf_similarity': float(tfidf_similarity),
            'skills_match': float(skills_match)
        }

    def calculate_bert_similarity(self, text1, text2):
        """Вычисление семантического сходства с помощью обученной модели BERT"""
        try:
            # Токенизация и подготовка входных данных
            encoded = self.bert_tokenizer.encode_plus(
                text1,
                text2,
                add_special_tokens=True,
                max_length=self.max_length,
                padding='max_length',
                truncation=True,
                return_attention_mask=True,
                return_token_type_ids=True,
                return_tensors='pt'
            )
            
            input_ids = encoded['input_ids'].to(self.device)
            attention_mask = encoded['attention_mask'].to(self.device)
            token_type_ids = encoded['token_type_ids'].to(self.device)

            # Получение предсказания из обученной модели
            with torch.no_grad():
                outputs = self.bert_matcher(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    token_type_ids=token_type_ids
                )
                probabilities = torch.softmax(outputs.logits, dim=1)
                similarity = probabilities[0][1].item()  # Вероятность совпадения
                
            return float(similarity)
            
        except Exception as e:
            print(f"Ошибка при вычислении сходства BERT: {e}")
            return 0.0

    def calculate_tfidf_similarity(self, text1: str, text2: str) -> float:
        """Сходство на основе TF-IDF"""
        print("Вычисление TF-IDF similarity...")
        
        # Создаем матрицу TF-IDF
        tfidf_matrix = self.tfidf.fit_transform([text1, text2])
        
        # Вычисляем косинусное сходство
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        
        return similarity[0][0]

    def analyze_technical_skills(self, vacancy_text, resume_text):
        """Анализ технических навыков"""
        # Простой анализ на основе ключевых слов
        common_skills = [
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 
            'node.js', 'sql', 'mongodb', 'docker', 'kubernetes', 'aws',
            'git', 'ci/cd', 'agile', 'scrum'
        ]
        
        vacancy_text = vacancy_text.lower()
        resume_text = resume_text.lower()
        
        vacancy_skills = set(skill for skill in common_skills if skill in vacancy_text)
        resume_skills = set(skill for skill in common_skills if skill in resume_text)
        
        if not vacancy_skills:
            return 0.0
            
        matching_skills = vacancy_skills.intersection(resume_skills)
        return len(matching_skills) / len(vacancy_skills)

    def predict_match(self, resume_text: str, vacancy_text: str) -> float:
        """Предсказание соответствия с помощью BERT"""
        self.bert_matcher.eval()
        
        encoding = self.bert_tokenizer.encode_plus(
            resume_text,
            vacancy_text,
            add_special_tokens=True,
            max_length=self.MAX_LEN,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_token_type_ids=True,
            return_tensors='pt'
        )

        input_ids = encoding['input_ids'].to(self.device)
        attention_mask = encoding['attention_mask'].to(self.device)
        token_type_ids = encoding['token_type_ids'].to(self.device)

        with torch.no_grad():
            outputs = self.bert_matcher(
                input_ids=input_ids,
                attention_mask=attention_mask,
                token_type_ids=token_type_ids
            )
            probabilities = torch.softmax(outputs.logits, dim=1)
            match_probability = probabilities[0][1].item()

        return float(match_probability)

    def find_matching_resumes_for_vacancy(self, vacancy, resumes, threshold=0.5):
        """Поиск подходящих резюме с параллельной обработкой"""
        matches = []
        print(f"\nАнализ вакансии: {vacancy['title']}")
        
        # Предварительно вычисляем эмбеддинг вакансии
        vacancy_text = vacancy['description']
        
        # Используем батч-обработку для резюме
        batch_size = 4  # Можно настроить
        for i in range(0, len(resumes), batch_size):
            batch = resumes[i:i + batch_size]
            
            for resume in batch:
                try:
                    bert_similarity = self.calculate_bert_similarity(
                        vacancy_text, 
                        resume['description']
                    )
                    
                    # Используем более быстрый анализ навыков
                    skills_match = self.analyze_technical_skills(
                        vacancy_text, 
                        resume['description']
                    )
                    
                    total_score = (bert_similarity * 0.7) + (skills_match * 0.3)
                    
                    if total_score >= threshold:
                        matches.append({
                            'resume': resume,
                            'total_score': float(total_score),
                            'bert_similarity': float(bert_similarity),
                            'skills_match': float(skills_match)
                        })
                        
                except Exception as e:
                    print(f"Ошибка при обработке резюме {resume.get('id', 'unknown')}: {e}")
                    continue
        
        matches.sort(key=lambda x: x['total_score'], reverse=True)
        return matches

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

    def process_vacancies(self):
        """Обработка вакансий и поиск резюме"""
        try:
            print(f"Загрузка вакансий из: {VACANCIES_JSON}")
            
            # Проверяем файл вакансий
            if not os.path.exists(VACANCIES_JSON):
                raise FileNotFoundError(f"Файл вакансий не найден: {VACANCIES_JSON}")
                
            # Загружаем вакансии
            with open(VACANCIES_JSON, 'r', encoding='utf-8') as f:
                data = json.load(f)
                vacancies = data['vacancies']
                
            print(f"Загружено вакансий: {len(vacancies)}")
            
            # Загружаем резюме
            resumes = self.load_resumes(TEXT_FOLDER)
            
            if not resumes:
                print("Внимание: Не найдено ни одного резюме!")
                return []
                
            # Обрабатываем каждую вакансию
            all_matches = []
            for vacancy in vacancies:
                print(f"\nОбработка вакансии: {vacancy['title']}")
                
                # Ищем совпадения
                matches = self.find_matching_resumes_for_vacancy(vacancy, resumes)
                
                vacancy_result = {
                    'vacancy_id': vacancy['id'],
                    'vacancy_title': vacancy['title'],
                    'matches': matches
                }
                
                print(f"Найдено {len(matches)} совпадений")
                all_matches.append(vacancy_result)
            
            # Сохраняем результаты
            print(f"\nСохранение результатов в: {OUTPUT_MATCHES}")
            with open(OUTPUT_MATCHES, 'w', encoding='utf-8') as f:
                json.dump(all_matches, f, ensure_ascii=False, indent=2)
                
            print("Обработка завершена успешно")
            return all_matches
            
        except Exception as e:
            print(f"Критическая ошибка: {e}")
            return []

    def load_resumes(self, text_folder: str) -> list:
        """Загрузка резюме из текстовых файлов"""
        resumes = []
        
        print(f"\nЗагрузка резюме из папки: {text_folder}")
        
        try:
            # Проверяем существование папки
            if not os.path.exists(text_folder):
                print(f"Папка не найдена: {text_folder}")
                return resumes
                
            # Получаем список файлов
            files = [f for f in os.listdir(text_folder) if f.endswith('.txt')]
            print(f"Найдено файлов: {len(files)}")
            
            for filename in files:
                try:
                    file_path = os.path.join(text_folder, filename)
                    print(f"Обработка файла: {filename}")
                    
                    with open(file_path, 'r', encoding='utf-8') as f:
                        text = f.read()
                        
                        # Создаем структуру резюме
                        resume = {
                            "id": len(resumes) + 1,
                            "title": self.extract_title(text),
                            "experience": self.extract_experience(text),
                            "salaryFrom": 150000,  # Значения по умолчанию
                            "salaryTo": 300000,
                            "currency": "KZT",
                            "workFormat": "office",
                            "education": "higher",
                            "ageFrom": "18",
                            "ageTo": "60",
                            "relocation": False,
                            "area": "Almaty",
                            "description": text
                        }
                        
                        print(f"Создано резюме ID: {resume['id']}")
                        resumes.append(resume)
                        
                except Exception as e:
                    print(f"Ошибка при обработке файла {filename}: {e}")
                    continue
            
            print(f"\nУспешно загружено резюме: {len(resumes)}")
            return resumes
            
        except Exception as e:
            print(f"Ошибка при загрузке резюме: {e}")
            return resumes

    def extract_title(self, text: str) -> str:
        """Извлечение названия должности"""
        first_line = text.split('\n')[0]
        return first_line if first_line else "Developer"

    def extract_experience(self, text: str) -> str:
        """Извлечение опыта работы"""
        text = text.lower()
        if re.search(r'опыт.{1,20}(5|6|7|8|9|10)', text):
            return "5+"
        elif re.search(r'опыт.{1,20}[3-4]', text):
            return "3-5"
        elif re.search(r'опыт.{1,20}[1-2]', text):
            return "1-3"
        return "no_experience"

    def extract_salary_from(self, text: str) -> int:
        """Извлечение минимальной зарплаты"""
        match = re.search(r'от\s*(\d+)', text.lower())
        return int(match.group(1)) if match else 150000

    def extract_salary_to(self, text: str) -> int:
        """Извлечение максимальной зарплаты"""
        match = re.search(r'до\s*(\d+)', text.lower())
        return int(match.group(1)) if match else 300000

    def extract_work_format(self, text: str) -> str:
        """Извлечение формата работы"""
        text = text.lower()
        if re.search(r'удаленн|remote', text):
            return "remote"
        elif re.search(r'гибрид|hybrid', text):
            return "hybrid"
        return "office"

    def extract_education(self, text: str) -> str:
        """Извлечение образования"""
        text = text.lower()
        if re.search(r'высшее|бакалавр|магистр', text):
            return "higher"
        return "secondary"

    def extract_relocation(self, text: str) -> bool:
        """Извлечение готовности к релокации"""
        return bool(re.search(r'готов к переезду|релоация', text.lower()))

    def extract_area(self, text: str) -> str:
        """Извлечение города"""
        text = text.lower()
        if re.search(r'алматы|almaty', text):
            return "Almaty"
        elif re.search(r'астана|astana|нур-султан', text):
            return "Astana"
        return "Almaty"  # по умолчанию

    def find_matching_resumes(self, vacancy, resumes, threshold=0.5):
        """Поиск подходящих резюме для вакансии"""
        matches = []
        
        for resume in resumes:
            # Получаем вероятность соответствия с помощью BERT
            match_probability = self.bert_matcher.predict_match(
                resume['text'],
                vacancy['description']
            )
            
            if match_probability >= threshold:
                matches.append({
                    'resume': resume,
                    'score': match_probability
                })
        
        # Сортируем по убыванию score
        matches.sort(key=lambda x: x['score'], reverse=True)
        return matches

if __name__ == "__main__":
    # Проверяем пути
    print("Проверка путей:")
    print(f"VACANCIES_JSON: {VACANCIES_JSON}")
    print(f"TEXT_FOLDER: {TEXT_FOLDER}")
    print(f"OUTPUT_MATCHES: {OUTPUT_MATCHES}")
    
    matcher = ResumeMatchingSystem()
    matcher.process_vacancies()