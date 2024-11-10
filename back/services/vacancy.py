from models.vacancy import Vacancy
from sqlalchemy.orm import Session
from dto import vacancy

def create_vacancy(data: vacancy.Vacancy, db):
    vacancy = Vacancy(
        title = data.title,
        experience = data.experience,
        salary_from = data.salary_from,
        salary_to = data.salary_to,
        currency = data.currency,
        work_format = data.work_format,
        education = data.education,
        age_from = data.age_from,
        age_to = data.age_to,
        relocation = data.relocation,
        area = data.area
    )

    try:
        db.add(vacancy)
        db.commit()
        db.refresh(vacancy)
    except Exception as e:
        print(e)

    return vacancy

def get_vacancy(id: int, db):
    return db.query(Vacancy).filter(Vacancy.id==id).first()

def get_vacancy_list(db):
    return db.query(Vacancy).all()  

def delete_vacancy(id: int, db):
    vacancy = db.query(Vacancy).filter(Vacancy.id == id).delete()
    db.commit()
    return