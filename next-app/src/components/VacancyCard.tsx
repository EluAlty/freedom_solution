import React, { useState } from 'react';
import { Vacancy } from '../app/types/vacancy';
import { resumeApi, SearchParams } from '@/services/api';
import { toast } from 'sonner';
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
  Building2,
  Trash2
} from 'lucide-react'

import type { Resume } from '../app/types/resume';
import type { ResumeItemSend } from '../app/types/resume_item_send';

interface VacancyCardProps {
  vacancy: Vacancy;
  onEdit?: (vacancy: Vacancy) => void;
  onUpdateStats?: () => void;
  onDelete?: (vacancy: Vacancy) => void;
}

const formatNumber = (value: number | undefined): string => {
  if (!value) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const convertToResumeItem = (resume: Resume): ResumeItemSend => ({
  title: resume.title,
  area: resume.area?.name || '',
  experience: resume.total_experience 
    ? `${Math.floor(resume.total_experience.months / 12)} лет ${resume.total_experience.months % 12} мес.`
    : '',
  education: resume.education?.level?.name || '',
  file_name: `resume_${resume.id}.pdf`,
  hh_url: resume.download?.pdf?.url || '',
  hh_id: resume.id
});

export const VacancyCard: React.FC<VacancyCardProps> = ({ 
  vacancy, 
  onUpdateStats,
  onDelete 
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleHhSearch = async () => {
    try {
      setIsSearching(true);
      
      const searchParams: SearchParams = {
        text: vacancy.title
      };

      if (vacancy.area) {
        let area = 40;
        switch(vacancy.area) {
          case 'Алматы': area = 160; break;
          case 'Астана': area = 159; break;
          case 'Караганда': area = 177; break;
          case 'Шымкент': area = 205; break;
        }
        searchParams.area = area;
      }

      const response = await resumeApi.search(searchParams);
      
      toast.success(`Найдено ${response.data.found} резюме. Начинаю загрузку в базу данных...`);
      
      const total = response.data.items.length;
      for (let i = 0; i < total; i++) {
        const resume = response.data.items[i];
        try {
          const resumeItem = convertToResumeItem(resume);
          await resumeApi.saveToDb([resumeItem]);
          
          const currentProgress = Math.round(((i + 1) / total) * 100);
          setProgress(currentProgress);
          
          toast.success(`Загружено ${i + 1} из ${total} резюме (${currentProgress}%)`);
        } catch (error) {
          console.error(`Ошибка при сохранении резюме ${resume.id}:`, error);
          toast.error(`Ошибка при сохранении резюме ${resume.id}`);
        }
      }
      
      toast.success(`Загрузка завершена. Сохранено ${total} резюме`);
      if (onUpdateStats) {
        onUpdateStats(); // Обновляем статистику в родительском компоненте
      }
      
    } catch (error) {
      console.error('Ошибка при поиске или сохранении резюме:', error);
      toast.error('Ошибка при поиске или сохранении резюме');
    } finally {
      setIsSearching(false);
      setProgress(0);
    }
  };


  const getExperienceText = (exp?: string) => {
    switch(exp) {
      case 'employment': return 'Без опыта';
      case 'between1And3': return 'от 1 до 3 лет';
      case 'between3And6': return 'от 3 до 6 лет'; 
      case 'moreThan6': return 'более 6 лет';
      default: return exp;
    }
  };

  const getWorkFormatText = (format?: string) => {
    if (!format) return 'Не указано';
    switch(format) {
      case 'office': return 'Офис';
      case 'hybrid': return 'Гибрид';
      case 'remote': return 'Удаленно';
      case 'fullDay': return 'Полный день';
      default: return format;
    }
  };

  const getEducationText = (education?: string) => {
    if (!education) return 'Не указано';
    switch(education) {
      case 'high_school': return 'Среднее';
      case 'bachelor': return 'Бакалавр';
      case 'master': return 'Магистр';
      case 'phd': return 'PhD';
      default: return education;
    }
  };

  


  return (
    <>
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">{vacancy.title}</h3>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:text-red-700 hover:bg-red-100"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {vacancy.experience && (
              <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                <Briefcase className="w-4 h-4 mr-2" />
                {getExperienceText(vacancy.experience)}
              </Badge>
            )}
            
            {(vacancy.salary_from > 0 || vacancy.salary_to > 0) && (
              <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                <Banknote className="w-4 h-4 mr-2" />
                {vacancy.salary_from > 0 ? formatNumber(vacancy.salary_from) : ''} 
                {vacancy.salary_from > 0 && vacancy.salary_to > 0 ? ' - ' : ''} 
                {vacancy.salary_to > 0 ? formatNumber(vacancy.salary_to) : ''} 
                {' '}{vacancy.currency}
              </Badge>
            )}

            {vacancy.area && (
              <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                <MapPin className="w-4 h-4 mr-2" />
                {vacancy.area}
              </Badge>
            )}

            {vacancy.education && (
              <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                <GraduationCap className="w-4 h-4 mr-2" />
                {getEducationText(vacancy.education)}
              </Badge>
            )}

            {(vacancy.age_from || vacancy.age_to) && (
              <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                <User className="w-4 h-4 mr-2" />
                {vacancy.age_from ? `от ${vacancy.age_from}` : ''} 
                {vacancy.age_from && vacancy.age_to ? ' - ' : ''} 
                {vacancy.age_to ? `до ${vacancy.age_to}` : ''} 
                {(vacancy.age_from || vacancy.age_to) ? ' лет' : ''}
              </Badge>
            )}

            {vacancy.relocation !== undefined && (
              <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                <PlaneTakeoff className="w-4 h-4 mr-2" />
                {vacancy.relocation ? 'Готов к релокации' : 'Без релокации'}
              </Badge>
            )}

            {vacancy.work_format && (
              <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                <Building2 className="w-4 h-4 mr-2" />
                {getWorkFormatText(vacancy.work_format)}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-0">
          <Button 
            variant="outline"
            className="w-full h-12 text-base font-medium border-2 border-gray-300 hover:bg-gray-50"
            onClick={handleHhSearch}
            disabled={isSearching}
          >
            {isSearching 
              ? `Загрузка резюме... ${progress}%` 
              : 'Найти из headhunter'}
          </Button>
        </CardFooter>
      </Card>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить вакансию &quot;{vacancy.title}&quot;?
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Отмена
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  if (onDelete) {
                    onDelete(vacancy);
                  }
                  setShowDeleteConfirm(false);
                }}
              >
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};