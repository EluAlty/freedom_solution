import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { VacancyList } from '../components/VacancyList';
import { VacancyModal } from '../components/VacancyModal';
import { Vacancy } from './types/vacancy';
import './App.css';

export default function App() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);

  const handleSaveVacancy = (vacancy: Vacancy) => {
    if (editingVacancy) {
      setVacancies(vacancies.map(v => v.id === editingVacancy.id ? vacancy : v));
    } else {
      setVacancies([...vacancies, { ...vacancy, id: Date.now() }]);
    }
    setIsModalOpen(false);
    setEditingVacancy(null);
  };

  const handleEditVacancy = (vacancy: Vacancy) => {
    setEditingVacancy(vacancy);
    setIsModalOpen(true);
  };

  return (
    <div className="app">
      <Navbar />
      <div className="container mt-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3">Управление вакансиями</h1>
          <p className="lead text-muted mb-4">Создавайте, редактируйте и управляйте вакансиями с легкостью</p>
          <button className="btn create-vacancy-btn btn-lg" onClick={() => setIsModalOpen(true)}>
            Создать вакансию
          </button>
        </div>

        <h2 className="mb-4 text-center">Активные вакансии</h2>

        <VacancyList vacancies={vacancies} onEdit={handleEditVacancy} />

        <VacancyModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingVacancy(null);
          }}
          onSave={handleSaveVacancy}
          vacancy={editingVacancy}
        />
      </div>
    </div>
  );
}