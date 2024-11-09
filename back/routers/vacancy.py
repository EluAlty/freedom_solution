from fastapi import APIRouter, Depends
from services import vacancy as VacancyService
from dto import vacancy as VacancyDTO
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter()

@router.post('/', tags=["vacancy"])
async def create_vacancy(
    data: VacancyDTO.Vacancy = None,
    db: Session = Depends(get_db)
):
    return VacancyService.create_vacancy(data, db)

@router.get('/{id}', response_model = VacancyDTO.VacancyResponse, tags=["vacancy"])
async def get_vacancy(
    id: int = None,
    db: Session = Depends(get_db)
):
    return VacancyService.get_vacancy(id, db)

@router.delete('/{id}', tags=["vacancy"])
async def delete(
    id: int = None,
    db: Session = Depends(get_db)
):
    return VacancyService.delete_vacancy(id, db)

@router.get('/', response_model=VacancyDTO.VacancyList, tags=["vacancies"])
async def get_vacancy_list(db: Session = Depends(get_db)):
    vacancies = VacancyService.get_vacancy_list(db)
    vacancy_list = [VacancyDTO.VacancyResponse.from_orm(vacancy) for vacancy in vacancies]
    return VacancyDTO.VacancyList(items=vacancy_list)

