import React from 'react';
import { Vacancy } from '../app/types/types';
import { VacancyCard } from './VacancyCard';

interface VacancyListProps {
  vacancies: Vacancy[];
  onEdit: (vacancy: Vacancy) => void;
}

export const VacancyList: React.FC<VacancyListProps> = ({ vacancies, onEdit }) => (
  <div className="space-y-4">
    {vacancies.map(vacancy => (
      <VacancyCard key={vacancy.id} vacancy={vacancy} onEdit={onEdit} />
    ))}
  </div>
);