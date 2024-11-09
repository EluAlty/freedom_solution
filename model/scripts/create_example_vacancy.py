import json
import os

# Примеры вакансий
example_vacancies = {
    "vacancies": [
        {
            "id": 1,
            "title": "Python разработчик",
            "experience": "1-3",  # варианты: "no_experience", "1-3", "3-5", "5+"
            "salaryFrom": 150000,
            "salaryTo": 300000,
            "currency": "KZT",
            "workFormat": "office",  # варианты: "office", "remote", "hybrid"
            "education": "higher",  # варианты: "secondary", "higher", "bachelor", "master", "phd"
            "ageFrom": "18",
            "ageTo": "45",
            "relocation": False,
            "area": "Almaty",
            "description": "Требуется Python разработчик со знанием Django и SQL..."
        },
        {
            "id": 2,
            "title": "Java Developer",
            "experience": "3-5",
            "salaryFrom": 400000,
            "salaryTo": 700000,
            "currency": "KZT",
            "workFormat": "hybrid",
            "education": "bachelor",
            "ageFrom": "20",
            "ageTo": "50",
            "relocation": True,
            "area": "Astana",
            "description": "Ищем опытного Java разработчика со знанием Spring Framework..."
        },
        {
            "id": 3,
            "title": "Frontend Developer",
            "experience": "no_experience",
            "salaryFrom": 120000,
            "salaryTo": 250000,
            "currency": "KZT",
            "workFormat": "remote",
            "education": "higher",
            "ageFrom": "18",
            "ageTo": "40",
            "relocation": False,
            "area": "Almaty",
            "description": "Начинающий frontend разработчик. Требуется знание HTML, CSS, JavaScript..."
        }
    ]
}

# Путь к файлу
vacancy_dir = r"D:\Datathon\datathon\freedom_solution\model\Vacancy"
vacancy_file = os.path.join(vacancy_dir, "example.json")

# Создаем директорию если её нет
if not os.path.exists(vacancy_dir):
    os.makedirs(vacancy_dir)

# Сохраняем примеры вакансий
with open(vacancy_file, 'w', encoding='utf-8') as f:
    json.dump(example_vacancies, f, ensure_ascii=False, indent=2)

print(f"Создан файл с примерами вакансий: {vacancy_file}") 