# import requests
# from urllib.parse import urlparse, parse_qs
# import json

# access_token = ""

# headers = {
#     "Authorization": f"Bearer {access_token}"
# }

# search_url = "https://api.hh.ru/resumes"
# params = {
#     "text": "Fronted разработчик React",  # Например, ищем резюме по ключевым словам
#     "area": "40",  # Регион (Казахстан), см. документацию для других регионов
#     "per_page": 1,  # Количество резюме на странице
#     "page": 1,       # Номер страницы
#     "text.logic": "all",
#     "text.field": "title"
# }

# # Выполнение запроса к API для поиска резюме
# response = requests.get(search_url, headers=headers, params=params)

# if response.status_code == 200:
#     resumes = response.json()
#     for resume in resumes.get("items", []):
#         # Форматированный вывод каждого резюме
#         print("Полная информация о резюме:")
#         print(json.dumps(resume, indent=4, ensure_ascii=False))  # Красиво форматирует JSON с отступами
#         print("\n" + "="*50 + "\n")  # Разделитель для удобства чтения
# else:
#     print("Ошибка при получении списка резюме:", response.text)


import requests
from dto import resume, resume_db
from model import resume_db as ResumeModel
import os

access_token = "USERP5E3SRULNMM1IE8UPSMA9U6A7698JE2FL7EVP47BK5VEL0DA351VJ745JR0J"

headers = {
    "Authorization": f"Bearer {access_token}"
}

search_url = "https://api.hh.ru/resumes"

def get_resumes(
        text: str,
        page: int,
        experience: str = None,
        area: int = None,
        relocation: str = None,
        employment: str = None,
        schedule: str = None,
        salary_from: int = None,
        salary_to: int = None,
        education_level: str = None,
        currency: str = None
) -> "resume.ResumeResponse":
    params = {
        "text": text,
        "per_page": 20,
        "page": page,
        "text.logic": "all",
        "text.field": "title",
    }

    if experience is not None:
        params["experience"] = experience
    if area is not None:
        params["area"] = area
    else: params["area"] = "40"
    if relocation is not None:
        params["relocation"] = relocation
    if employment is not None:
        params["employment"] = employment
    if schedule is not None:
        params["schedule"] = schedule
    if salary_from is not None:
        params["salary_from"] = salary_from
    if salary_to is not None:
        params["salary_to"] = salary_to
    if education_level is not None:
        params["education_level"] = education_level
    if currency is not None:
        params["currency"] = currency    

    response = requests.get(search_url, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        
        resume_response = resume.ResumeResponse(
            found=data.get("found", 0),
            items=data.get("items", []),
            page=data.get("page", 0),
            pages=data.get("pages", 0),
            per_page=data.get("per_page", 1)
        )
        return resume_response
    else:
        print("Ошибка при получении списка резюме:", response.text)
        return None
    

def get_resume_by_id(id: str):
    response = requests.get(f"{search_url}/{id}", headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        err = {"error": f"Резюме с ID {id} не найдено", "status_code": response.status_code}
        print(err)
        return err
    
def download_resume_pdf(download_url: str) -> bytes:
    response = requests.get(download_url, headers=headers)
    
    if response.status_code == 200:
        return response.content
    else:
        print(f"Error downloading resume PDF: {response.status_code} - {response.text}")
        return None
    
def add_resumes_to_storage(list: resume_db.ResumeDbList, db):
    for resume_data in list.items:
        resume = ResumeModel.Resume(
            title=resume_data.title,
            area=resume_data.area,
            experience=resume_data.experience,
            education=resume_data.education,
            file_name=resume_data.file_name,
            hh_url=resume_data.hh_url,
            hh_id=resume_data.hh_id
        )
        
        db.add(resume)
    
    db.commit()

    return

def get_resumes_from_local_storage(db):
    return db.query(ResumeModel.Resume).all()  
    







