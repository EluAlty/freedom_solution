import React from 'react';
import { Vacancy } from '../app/types/types';
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Card, CardContent, CardFooter } from "@/components/card"
import { 
  Briefcase, 
  Banknote, 
  MapPin, 
  GraduationCap, 
  User, 
  PlaneTakeoff,
  Settings2
} from 'lucide-react'

interface VacancyCardProps {
  vacancy: Vacancy;
  onEdit: (vacancy: Vacancy) => void;
}

export const VacancyCard: React.FC<VacancyCardProps> = ({ vacancy, onEdit }) => {
  const getExperienceText = (exp: string) => {
    switch(exp) {
      case 'no_experience': return 'Без опыта';
      case '1-3': return '1-3 года';
      case '3-5': return '3-5 лет';
      case '5+': return '5+ лет';
      default: return exp;
    }
  };

  const getWorkFormatText = (format: string) => {
    switch(format) {
      case 'remote': return 'Удаленно';
      case 'office': return 'Офис';
      case 'hybrid': return 'Гибрид';
      default: return format;
    }
  };

  const getEducationText = (edu: string) => {
    switch(edu) {
      case 'high_school': return 'Среднее';
      case 'bachelor': return 'Бакалавр';
      case 'master': return 'Магистр';
      case 'phd': return 'Кандидат наук';
      default: return edu;
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">{vacancy.title}</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(vacancy)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Settings2 className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
            <Briefcase className="w-4 h-4 mr-2" />
            {getExperienceText(vacancy.experience)}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
            <Banknote className="w-4 h-4 mr-2" />
            {vacancy.salaryFrom} - {vacancy.salaryTo} {vacancy.currency}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
            <MapPin className="w-4 h-4 mr-2" />
            {getWorkFormatText(vacancy.workFormat)}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
            <GraduationCap className="w-4 h-4 mr-2" />
            {getEducationText(vacancy.education)}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
            <User className="w-4 h-4 mr-2" />
            {vacancy.ageFrom} - {vacancy.ageTo} лет
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
            <PlaneTakeoff className="w-4 h-4 mr-2" />
            {vacancy.relocation ? 'Готов к релокации' : 'Без релокации'}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0 flex gap-4">
        <Button 
          variant="outline"
          className="flex-1 h-12 text-base font-medium border-2 border-gray-300 hover:bg-gray-50"
        >
          Поиск по headhunter.kz
        </Button>
        <Button 
          variant="outline"
          className="flex-1 h-12 text-base font-medium border-2 border-gray-300 hover:bg-gray-50"
        >
          Поиск по БД
        </Button>
      </CardFooter>
    </Card>
  );
};