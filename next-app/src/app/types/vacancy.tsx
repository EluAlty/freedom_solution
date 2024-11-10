export interface Vacancy {
  id: number;
  title: string;
  experience: string;
  salary_from: number;
  salary_to: number;
  currency: string;
  work_format: string;
  education: string;
  age_from: string;
  age_to: string;
  relocation: boolean;
  area: string;
  employment_type: string;
}

export type VacancyCreate = Omit<Vacancy, 'id'>;