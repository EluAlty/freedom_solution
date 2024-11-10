import React, { useMemo } from 'react';
import type{ Resume } from '../app/types/resume';
import type { ResumeItemSend } from '../app/types/resume_item_send';
import { Button } from '@/components/button';
import { X, Database } from 'lucide-react';
import { ResumeCard } from './ResumeCard';
import { resumeApi } from '@/services/api';
import { toast } from 'sonner';


interface ResumeWithScore extends Resume {
  score?: number;
}

interface ResumeListModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumes: ResumeWithScore[];
  found: number;
  onSaveAll: (resumes: Resume[]) => void;
  onSaveOne: (resume: Resume) => void;
  isDbSearch?: boolean;
}

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

export const ResumeListModal: React.FC<ResumeListModalProps> = ({ 
  isOpen, 
  onClose, 
  resumes,
  found,
}) => {
  const sortedResumes = useMemo(() => {
    return [...resumes].sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [resumes]);

  const passedResumes = sortedResumes.filter(r => (r.score || 0) >= 0);
  const failedResumes = sortedResumes.filter(r => (r.score || 0) > 100);

  const handleSaveAll = async (resumes: Resume[]) => {
    try {
      const resumeItems = resumes.map(convertToResumeItem);
      await resumeApi.saveToDb(resumeItems);
    } catch {
      toast.error('Ошибка при сохранении резюме');
    }
  };

  const handleSaveOne = async (resume: Resume) => {
    try {
      const resumeItem = convertToResumeItem(resume);
      await resumeApi.saveToDb([resumeItem]);
      toast.success('Резюме успешно сохранено');
    } catch {
      toast.error('Ошибка при сохранении резюме');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">
              Найдено резюме: {found}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Прошли отбор: {passedResumes.length}
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="default"
              onClick={() => handleSaveAll(passedResumes)}
              disabled={passedResumes.length === 0}
            >
              <Database className="w-5 h-5 mr-2" />
              Отправить все в БД
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-4">
          {passedResumes.length > 0 && (
            <div className="space-y-4">
              {passedResumes.map(resume => (
                <ResumeCard 
                  key={resume.id} 
                  resume={resume} 
                  score={resume.score}
                  onSaveToDb={() => handleSaveOne(resume)}
                />
              ))}
            </div>
          )}

          {failedResumes.length > 0 && (
            <>
              <div className="border-t border-gray-200 my-6" />
              <h3 className="text-lg font-medium text-gray-500 mb-4">
                Не прошли отбор
              </h3>
              <div className="space-y-4">
                {failedResumes.map(resume => (
                  <ResumeCard 
                    key={resume.id} 
                    resume={resume} 
                    score={resume.score}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 