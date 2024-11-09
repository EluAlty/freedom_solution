import json
import os
import re
from typing import Dict, List

class ResumeParser:
    def __init__(self):
        self.required_fields = ['experience', 'education', 'workFormat', 'area']
    
    def parse_pdf_to_json(self, text_folder: str, output_json: str):
        """Преобразование текстовых файлов резюме в JSON формат"""
        resumes = []
        
        for filename in os.listdir(text_folder):
            if filename.endswith('.txt'):
                print(f"Обработка файла: {filename}")
                with open(os.path.join(text_folder, filename), 'r', encoding='utf-8') as f:
                    text = f.read()
                    
                    # Извлекаем зарплату
                    salary_from, salary_to = self.extract_salary(text)
                    
                    # Создаем структуру резюме
                    resume = {
                        "id": len(resumes) + 1,
                        "title": self.extract_title(text),
                        "experience": self.extract_experience(text),
                        "salaryFrom": salary_from,
                        "salaryTo": salary_to,
                        "currency": "KZT",
                        "workFormat": self.extract_work_format(text),
                        "education": self.extract_education(text),
                        "ageFrom": "18",
                        "ageTo": "60",
                        "relocation": bool(re.search(r'готов к переезду|релокация|переезд', text.lower())),
                        "area": self.extract_area(text),
                        "description": text
                    }
                    
                    print(f"Извлеченные данные:")
                    print(f"- Опыт: {resume['experience']}")
                    print(f"- Образование: {resume['education']}")
                    print(f"- Формат работы: {resume['workFormat']}")
                    print(f"- Зарплата: {resume['salaryFrom']}-{resume['salaryTo']}")
                    print(f"- Город: {resume['area']}")
                    
                    resumes.append(resume)
        
        # Сохраняем в JSON
        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump({"resumes": resumes}, f, ensure_ascii=False, indent=2)
        
        return resumes

    def extract_title(self, text: str) -> str:
        """Извлечение должности"""
        title_patterns = [
            r'позиция:?\s*([^\n]+)',
            r'должность:?\s*([^\n]+)',
            r'вакансия:?\s*([^\n]+)'
        ]
        
        for pattern in title_patterns:
            match = re.search(pattern, text.lower())
            if match:
                return match.group(1).strip()
        return "Developer"  # значение по умолчанию

    def extract_experience(self, text: str) -> str:
        """Извлечение опыта работы из текста резюме"""
        text = text.lower()
        
        # Поиск явных указаний опыта
        if re.search(r'опыт работы.{1,30}(4|5|6|7|8|9|10)\+?\s*(год|лет)', text) or \
           re.search(r'experience.{1,30}(4|5|6|7|8|9|10)\+?\s*year', text):
            return "5+"
            
        if re.search(r'опыт работы.{1,30}[3-4]\s*(год|лет)', text) or \
           re.search(r'experience.{1,30}[3-4]\s*year', text):
            return "3-5"
            
        if re.search(r'опыт работы.{1,30}[1-2]\s*(год|лет)', text) or \
           re.search(r'experience.{1,30}[1-2]\s*year', text):
            return "1-3"
        
        # Поиск дат работы
        work_periods = re.findall(r'(\d{4})\s*[-–]\s*(present|current|настоящее время|\d{4})', text)
        if work_periods:
            total_experience = 0
            current_year = 2024
            
            for start, end in work_periods:
                start_year = int(start)
                end_year = current_year if end.lower() in ['present', 'current', 'настоящее время'] else int(end)
                total_experience += end_year - start_year
            
            if total_experience >= 5:
                return "5+"
            elif total_experience >= 3:
                return "3-5"
            elif total_experience >= 1:
                return "1-3"
        
        return "no_experience"

    def extract_salary(self, text: str) -> tuple:
        """Извлечение зарплатных ожиданий"""
        text = text.lower()
        
        # Поиск диапазона зарплаты
        salary_range = re.search(r'зарплата:?\s*(\d+)\s*-\s*(\d+)|salary:?\s*(\d+)\s*-\s*(\d+)', text)
        if salary_range:
            groups = salary_range.groups()
            if groups[0] and groups[1]:
                return int(groups[0]), int(groups[1])
            elif groups[2] and groups[3]:
                return int(groups[2]), int(groups[3])
        
        # Поиск минимальной зарплаты
        salary_from = re.search(r'от\s*(\d+)|from\s*(\d+)', text)
        if salary_from:
            min_salary = int(salary_from.group(1) or salary_from.group(2))
            return min_salary, min_salary * 2
        
        # Значения по умолчанию
        return 150000, 300000

    def extract_currency(self, text: str) -> str:
        """Извлечение валюты"""
        if re.search(r'тенге|kzt|тг', text.lower()):
            return "KZT"
        return "KZT"  # значение по умолчанию

    def extract_work_format(self, text: str) -> str:
        """Извлечение формата работы"""
        text = text.lower()
        
        if re.search(r'удаленн|remote|дистанционн', text):
            return "remote"
        elif re.search(r'гибрид|hybrid|смешанн', text):
            return "hybrid"
        elif re.search(r'офис|office', text):
            return "office"
            
        # По умолчанию office, если не указано иное
        return "office"

    def extract_education(self, text: str) -> str:
        """Извлечение уровня образования"""
        text = text.lower()
        
        if re.search(r'phd|доктор|кандидат наук', text):
            return "phd"
        elif re.search(r'магистр|master', text):
            return "master"
        elif re.search(r'бакалавр|bachelor|высшее|university|университет', text):
            return "higher"
        
        return "secondary"

    def extract_relocation(self, text: str) -> bool:
        """Готовность к релокации"""
        return bool(re.search(r'готов к переезду|релокация|переезд', text.lower()))

    def extract_area(self, text: str) -> str:
        """Извлечение города"""
        if re.search(r'алматы|almaty', text.lower()):
            return "Almaty"
        elif re.search(r'астана|astana|нур-султан', text.lower()):
            return "Astana"
        return "Almaty"  # значение по умолчанию