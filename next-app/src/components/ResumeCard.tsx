import React from 'react';
import { Resume } from '../app/types/resume';
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Card, CardContent, CardFooter } from "@/components/card"
import { 
  Briefcase, 
  GraduationCap, 
  MapPin,
  Download,
  Database
} from 'lucide-react'
import { toast } from 'sonner';
import { resumeApi } from '@/services/api';
import axios from 'axios';

interface ResumeCardProps {
  resume: Resume;
  score?: number;
  onSaveToDb?: () => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ resume, score, onSaveToDb }) => {
  const formatExperience = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years} ${years === 1 ? 'год' : 'лет'} ${remainingMonths} мес.`;
  };

  return (
    <Card className={`w-full bg-white ${score && score < 50 ? 'opacity-50' : ''}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">{resume.title}</h3>
            {score !== undefined && (
              <Badge className={`mt-2 ${score >= 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                Оценка: {score}%
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {resume.area && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2" />
              {resume.area.name}
            </div>
          )}
          
          {resume.total_experience && (
            <div className="flex items-center text-gray-600">
              <Briefcase className="w-5 h-5 mr-2" />
              {formatExperience(resume.total_experience.months)}
            </div>
          )}

          {resume.education?.level && (
            <div className="flex items-center text-gray-600">
              <GraduationCap className="w-5 h-5 mr-2" />
              {resume.education.level.name}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0 flex gap-4">
        {onSaveToDb && (
          <Button 
            variant="default"
            size="lg"
            className="flex-1 text-base font-medium"
            onClick={onSaveToDb}
          >
            <Database className="w-5 h-5 mr-2" />
            Сохранить в БД
          </Button>
        )}
        {resume.download?.pdf && (
          <Button 
            variant="outline"
            size="lg"
            className="flex-1 text-base font-medium"
            onClick={async () => {
              try {
                
                if (!resume.download?.pdf?.url) {
                  throw new Error('URL для скачивания не найден');
                }
                
                const response = await resumeApi.downloadFromHh(
                  resume.download.pdf.url,
                  resume.id
                );

                const blob = new Blob([response.data], {
                  type: response.headers['content-type'] 
                });

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resume_${resume.id}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                toast.success('Файл успешно скачан');
              } catch (error) {
                console.error('Ошибка при скачивании:', error);
                if (axios.isAxiosError(error)) {
                  console.error('Ответ сервера:', error.response?.data);
                }
                toast.error('Ошибка при скачивании файла');
              }
            }}
          >
            <Download className="w-5 h-5 mr-2" />
            Скачать PDF
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};