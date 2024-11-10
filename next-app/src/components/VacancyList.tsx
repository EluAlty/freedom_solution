import React from 'react';
import { Vacancy } from '../app/types/vacancy';
import { VacancyCard } from './VacancyCard';

interface VacancyListProps {
  vacancies: Vacancy[];
  onUpdateStats?: () => void;
  onDelete: (vacancy: Vacancy) => void;
}

export const VacancyList: React.FC<VacancyListProps> = ({ 
  vacancies, 
  onUpdateStats,
  onDelete 
}) => (
  <div className="space-y-4">
    {vacancies.map(vacancy => (
      <VacancyCard 
        key={vacancy.id} 
        vacancy={vacancy} 
        onUpdateStats={onUpdateStats}
        onDelete={onDelete}
      />
    ))}
  </div>
);