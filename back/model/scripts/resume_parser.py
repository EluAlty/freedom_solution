import json
import os
import re
from typing import Dict, List
import pdfplumber

class ResumeParser:
    def __init__(self):
        self.required_fields = ['experience', 'education', 'workFormat', 'area']
    
    def parse_pdf_to_json(self, pdf_path: str) -> dict:
        """Преобразование PDF резюме в JSON формат"""
        try:
            # Используем pdfplumber для извлечения текста
            with pdfplumber.open(pdf_path) as pdf:
                text = ""
                for page in pdf.pages:
                    text += page.extract_text()
            
            # Извлекаем данные из текста
            return {
                "position": self.extract_position(text),
                "experience": self.extract_experience(text),
                "education": self.extract_education(text),
                "area": self.extract_area(text)
            }
        except Exception as e:
            print(f"Ошибка при парсинге PDF: {e}")
            return {}

    def extract_position(self, text: str) -> str:
        """Извлечение должности"""
        first_line = text.split('\n')[0].strip()
        return first_line if first_line else "Неизвестная позиция"

    def extract_experience(self, text: str) -> str:
        """Извлечение опыта работы из текста резюме"""
        if "опыт работы" in text.lower():
            lines = text.lower().split('\n')
            for i, line in enumerate(lines):
                if "опыт работы" in line and i + 1 < len(lines):
                    return lines[i + 1].strip()
        return "Без опыта"

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
        if "образование" in text.lower():
            lines = text.lower().split('\n')
            for i, line in enumerate(lines):
                if "образование" in line and i + 1 < len(lines):
                    return lines[i + 1].strip()
        return "Не указано"

    def extract_relocation(self, text: str) -> bool:
        """Готовность к релокации"""
        return bool(re.search(r'готов к переезду|релокация|переезд', text.lower()))

    def extract_area(self, text: str) -> str:
        """Извлечение города"""
        cities = ["Алматы", "Астана", "Караганда", "Шымкент"]
        for city in cities:
            if city.lower() in text.lower():
                return city
        return "Не указано"