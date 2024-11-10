import React, { useState } from 'react';
import { Vacancy, VacancyCreate } from '../app/types/vacancy';
import { Button } from '../components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/dialog";
import { toast } from 'sonner'

interface VacancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vacancy: Vacancy | VacancyCreate) => Promise<void>;
  onDelete?: (vacancy: Vacancy) => void;
  vacancy?: Vacancy | null;
}

export const VacancyModal: React.FC<VacancyModalProps> = ({ isOpen, onClose, onSave, onDelete, vacancy }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<VacancyCreate>({
    title: vacancy?.title || '',
    experience: vacancy?.experience || '',
    salary_from: vacancy?.salary_from || 0,
    salary_to: vacancy?.salary_to || 0,
    currency: vacancy?.currency || 'KZT',
    work_format: vacancy?.work_format || '',
    education: vacancy?.education || '',
    age_from: vacancy?.age_from || '',
    age_to: vacancy?.age_to || '',
    relocation: vacancy?.relocation || false,
    area: vacancy?.area || '',
    employment_type: vacancy?.employment_type || ''
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else if (name === 'salary_from' || name === 'salary_to') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDelete = () => {
    if (vacancy && onDelete) {
      onDelete(vacancy);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      toast.error('Название вакансии обязательно');
      return;
    }

    const submissionData: VacancyCreate = {
      title: formData.title.trim(),
      experience: formData.experience || '',
      work_format: formData.work_format || '',
      education: formData.education || '',
      employment_type: formData.employment_type || '',
      area: formData.area || '',
      salary_from: Number(formData.salary_from) || 0,
      salary_to: Number(formData.salary_to) || 0,
      currency: formData.currency || 'KZT',
      age_from: formData.age_from?.toString() || '',
      age_to: formData.age_to?.toString() || '',
      relocation: Boolean(formData.relocation)
    };

    onSave(vacancy?.id ? { ...submissionData, id: vacancy.id } : submissionData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vacancy ? 'Редактировать вакансию' : 'оздать вакансию'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-lg font-semibold text-gray-700 mb-2">
                Название вакансии *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                placeholder="Например: Frontend Developer"
              />
            </div>

            <div>
              <label htmlFor="experience" className="block text-lg font-semibold text-gray-700 mb-2">
                Опыт работы
              </label>
              <select
                id="experience"
                name="experience"
                value={formData.experience || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              >
                <option value="">Выберите опыт работы</option>
                <option value="employment">Без опыта</option>
                <option value="between1And3">1-3 года</option>
                <option value="between3And6">3-6 лет</option>
                <option value="moreThan6">Более 6 лет</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label htmlFor="salary_from" className="block text-lg font-semibold text-gray-700 mb-2">
                  Зарплата от
                </label>
                <input
                  type="number"
                  id="salary_from"
                  name="salary_from"
                  value={formData.salary_from || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  placeholder="150000"
                />
              </div>
              <div>
                <label htmlFor="salary_to" className="block text-lg font-semibold text-gray-700 mb-2">
                  Зарплата до
                </label>
                <input
                  type="number"
                  id="salary_to"
                  name="salary_to"
                  value={formData.salary_to || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  placeholder="300000"
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-lg font-semibold text-gray-700 mb-2">
                  Валюта
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                >
                  <option value="KZT">KZT</option>
                  <option value="USD">USD</option>
                  <option value="RUB">RUB</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="work_format" className="block text-lg font-semibold text-gray-700 mb-2">
                Формат работы
              </label>
              <select
                id="work_format"
                name="work_format"
                value={formData.work_format || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              >
                <option value="">Выберите формат работы</option>
                <option value="office">Офис</option>
                <option value="hybrid">Гибрид</option>
                <option value="remote">Удаленно</option>
              </select>
            </div>

            <div>
              <label htmlFor="education" className="block text-lg font-semibold text-gray-700 mb-2">
                Образование
              </label>
              <select
                id="education"
                name="education"
                value={formData.education || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              >
                <option value="">Выберите уровень образования</option>
                <option value="bachelor">Бакалавр</option>
                <option value="master">Магистр</option>
                <option value="unfinished_higher">Неоконченное высшее</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="age_from" className="block text-lg font-semibold text-gray-700 mb-2">
                  Возраст от
                </label>
                <input
                  type="number"
                  id="age_from"
                  name="age_from"
                  value={formData.age_from || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  placeholder="18"
                />
              </div>
              <div>
                <label htmlFor="age_to" className="block text-lg font-semibold text-gray-700 mb-2">
                  Возраст до
                </label>
                <input
                  type="number"
                  id="age_to"
                  name="age_to"
                  value={formData.age_to || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  placeholder="45"
                />
              </div>
            </div>

            <div>
              <label htmlFor="area" className="block text-lg font-semibold text-gray-700 mb-2">
                Город
              </label>
              <select
                id="area"
                name="area"
                value={formData.area || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              >
                <option value="">Выберите город</option>
                <option value="Алматы">Алматы</option>
                <option value="Астана">Астана</option>
                <option value="Караганда">Караганда</option>
              </select>
            </div>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="relocation"
                name="relocation"
                checked={!!formData.relocation}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="relocation" className="ml-2 text-lg text-gray-700">
                Готов к релокации
              </label>
            </div>

            <div>
              <label htmlFor="employment_type" className="block text-lg font-semibold text-gray-700 mb-2">
                Тип занятости
              </label>
              <select
                id="employment_type"
                name="employment_type"
                value={formData.employment_type || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              >
                <option value="">Выберите тип занятости</option>
                <option value="full">Полная занятость</option>
                <option value="part">Частичная занятость</option>
                <option value="project">Проектная работа</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            {vacancy && (
              <Button
                variant="destructive"
                size="lg"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Удалить
              </Button>
            )}
            <div className={`flex space-x-3 ${!vacancy ? 'ml-auto' : ''}`}>
              <Button variant="outline" size="lg" onClick={onClose}>
                Закрыть
              </Button>
              <Button type="submit" size="lg">
                Сохранить
              </Button>
            </div>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Подтверждение удаления</h3>
              <p className="text-gray-600 mb-6">
                Вы уверены, что хотите удалить эту вакансию? Это дествие нельзя отменить.
              </p>
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Отмена
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Удалить
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};