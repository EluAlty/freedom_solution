import React, { useEffect, useState, useMemo } from 'react';
import { Resume } from '../app/types/resume';
import { Button } from '@/components/button';
import { X } from 'lucide-react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resume: Resume) => void;
  resume: Resume | null;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose, onSave, resume }) => {
  const initialState = useMemo<Resume>(() => ({
    id: 0,
    fullName: '',
    name: '',
    position: '',
    age: 0,
    birthDate: '',
    experience: 'no_experience',
    education: 'high_school',
    skills: [],
    desiredSalary: 0,
    currency: 'KZT',
    workFormat: 'office',
    relocation: false,
    location: '',
    contacts: {
      phone: '',
      email: ''
    }
  }), []);

  const [formData, setFormData] = useState<Resume>(initialState);

  useEffect(() => {
    setFormData(resume || initialState);
  }, [resume, initialState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'contacts') {
        setFormData(prev => ({
          ...prev,
          contacts: {
            ...prev.contacts,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : type === 'number' 
            ? Number(value) || 0
            : value
      }));
    }
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setFormData(prev => ({
      ...prev,
      skills
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop" onClick={handleBackdropClick}>
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-content">
        <div className="flex justify-between items-center p-8 border-b">
          <h2 className="text-3xl font-bold text-gray-800">
            {resume ? 'Редактировать резюме' : 'Создать резюме'}
          </h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-lg font-semibold text-gray-700 mb-2">
                ФИО
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                placeholder="Например: Иванов Иван Иванович"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="age" className="block text-lg font-semibold text-gray-700 mb-2">
                  Возраст
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  placeholder="Например: 25"
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
                  <option value="no_experience">Без опыта</option>
                  <option value="1-3">1-3 гоа</option>
                  <option value="3-5">3-5 лет</option>
                  <option value="5+">Более 5 лет</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="education" className="block text-lg font-semibold text-gray-700 mb-2">
                Образование
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

            <div>
              <label htmlFor="skills" className="block text-lg font-semibold text-gray-700 mb-2">
                Навыки (через запятую)
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills.join(', ')}
                onChange={handleSkillsChange}
                required
                className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                placeholder="Например: JavaScript, React, TypeScript"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="desiredSalary" className="block text-lg font-semibold text-gray-700 mb-2">
                  Желаемая зарплата
                </label>
                <input
                  type="text"
                  id="desiredSalary"
                  name="desiredSalary"
                  value={formData.desiredSalary}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  placeholder="Например: 150000"
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
                  <option value="USD">USD</option>
                  <option value="RUB">RUB</option>
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
                <option value="office">Офис</option>
                <option value="remote">Удаленно</option>
                <option value="hybrid">Гибрид</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contacts.phone" className="block text-lg font-semibold text-gray-700 mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  id="contacts.phone"
                  name="contacts.phone"
                  value={formData.contacts.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  placeholder="+7 (XXX) XXX-XX-XX"
                />
              </div>

              <div>
                <label htmlFor="contacts.email" className="block text-lg font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="contacts.email"
                  name="contacts.email"
                  value={formData.contacts.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="relocation"
                name="relocation"
                checked={formData.relocation}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <label htmlFor="relocation" className="ml-2 block text-lg text-gray-700">
                Готовность к релокации
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button
              type="submit"
            >
              {resume ? 'Сохранить изменения' : 'Сздать резюме'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
