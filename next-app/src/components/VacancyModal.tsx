import React, { useState, useEffect } from 'react';
import { Vacancy } from '../app/types/types';

interface VacancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vacancy: Vacancy) => void;
  vacancy: Vacancy | null;
}

export const VacancyModal: React.FC<VacancyModalProps> = ({ isOpen, onClose, onSave, vacancy }) => {
  const [formData, setFormData] = useState<Vacancy>({
    id: 0,
    title: '',
    experience: 'no_experience',
    salaryFrom: '',
    salaryTo: '',
    currency: 'RUB',
    workFormat: 'remote',
    education: 'high_school',
    ageFrom: '',
    ageTo: '',
    relocation: false
  });

  useEffect(() => {
    if (vacancy) {
      setFormData(vacancy);
    } else {
      setFormData({
        id: 0,
        title: '',
        experience: 'no_experience',
        salaryFrom: '',
        salaryTo: '',
        currency: 'RUB',
        workFormat: 'remote',
        education: 'high_school',
        ageFrom: '',
        ageTo: '',
        relocation: false
      });
    }
  }, [vacancy]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-8 border-b">
          <h2 className="text-3xl font-bold text-gray-800">
            {vacancy ? 'Редактировать вакансию' : 'Создать вакансию'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-lg font-semibold text-gray-700 mb-2">
                Название вакансии
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                placeholder="Например: Senior Frontend Developer"
              />
            </div>

            <div>
              <label htmlFor="experience" className="block text-lg font-semibold text-gray-700 mb-2">
                Опыт работы
              </label>
              <select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              >
                <option value="">Выберите опыт работы</option>
                <option value="no_experience">Без опыта</option>
                <option value="1-3">1-3 года</option>
                <option value="3-5">3-5 лет</option>
                <option value="5+">5+ лет</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label htmlFor="salaryFrom" className="block text-lg font-semibold text-gray-700 mb-2">
                  Зарплата от
                </label>
                <input
                  type="number"
                  id="salaryFrom"
                  name="salaryFrom"
                  value={formData.salaryFrom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  placeholder="Например: 50000"
                />
              </div>
              <div>
                <label htmlFor="salaryTo" className="block text-lg font-semibold text-gray-700 mb-2">
                  Зарплата до
                </label>
                <input
                  type="number"
                  id="salaryTo"
                  name="salaryTo"
                  value={formData.salaryTo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  placeholder="Например: 100000"
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
                  required
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                >
                  <option value="KZT">KZT</option>
                  <option value="RUB">RUB</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="workFormat" className="block text-lg font-semibold text-gray-700 mb-2">
                Формат работы
              </label>
              <select
                id="workFormat"
                name="workFormat"
                value={formData.workFormat}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              >
                <option value="remote">Удаленно</option>
                <option value="office">Офис</option>
                <option value="hybrid">Гибрид</option>
              </select>
            </div>

            <div>
              <label htmlFor="education" className="block text-lg font-semibold text-gray-700 mb-2">
                Уровень образования
              </label>
              <select
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              >
                <option value="high_school">Среднее</option>
                <option value="bachelor">Бакалавр</option>
                <option value="master">Магистр</option>
                <option value="phd">Кандидат наук</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="ageFrom" className="block text-lg font-semibold text-gray-700 mb-2">
                  Возраст от
                </label>
                <input
                  type="number"
                  id="ageFrom"
                  name="ageFrom"
                  value={formData.ageFrom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  placeholder="Например: 25"
                />
              </div>
              <div>
                <label htmlFor="ageTo" className="block text-lg font-semibold text-gray-700 mb-2">
                  Возраст до
                </label>
                <input
                  type="number"
                  id="ageTo"
                  name="ageTo"
                  value={formData.ageTo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  placeholder="Например: 40"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="relocation" name="relocation" checked={formData.relocation} onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
              <label htmlFor="relocation" className="ml-2 block text-sm text-gray-700">Готовность к релокации</label>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Закрыть
            </button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};