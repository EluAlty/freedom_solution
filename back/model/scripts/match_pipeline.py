from resume_matching_system import ResumeMatchingSystem
import pandas as pd
import json
import os

def load_data():
    """Загрузка данных резюме и вакансий"""
    # Загрузка вакансий
    with open('vacancies.json', 'r', encoding='utf-8') as f:
        vacancies = json.load(f)
    
    # Загрузка и обработка текстовых файлов резюме
    resumes = []
    text_folder = r"D:\Datathon\datathon\freedom_solution\cv_processing\txt"
    
    for filename in os.listdir(text_folder):
        if filename.endswith('.txt'):
            with open(os.path.join(text_folder, filename), 'r', encoding='utf-8') as f:
                resume_text = f.read()
                
                # Создаем структуру резюме
                resume = {
                    'id': filename.replace('.txt', ''),
                    'description': resume_text,
                    'desiredSalary': None,  # Будет считаться как согласие на любую зарплату
                    # Здесь нужно добавить извлечение других полей из текста
                    # Можно использовать NER или другие методы извлечения информации
                }
                resumes.append(resume)
    
    return resumes, vacancies

def main():
    # Инициализация системы
    matching_system = ResumeMatchingSystem()
    
    # Загрузка данных
    resumes, vacancies = load_data()
    
    # Обработка каждого резюме
    all_matches = []
    for resume in resumes:
        matches = matching_system.find_matching_vacancies(
            resume=resume,
            vacancies=vacancies,
            threshold=0.6
        )
        
        if matches:
            all_matches.append({
                'resume_id': resume['id'],
                'matches': matches
            })
    
    # Сохранение результатов
    matching_system.save_matches(all_matches, 'matching_results.json')
    
    # Вывод статистики
    print(f"Обработано резюме: {len(resumes)}")
    print(f"Найдено совпадений: {len(all_matches)}")
    print(f"Средний процент совпадений: {len(all_matches)/len(resumes)*100:.2f}%")

if __name__ == "__main__":
    main() 