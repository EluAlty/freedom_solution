'use client'

import React, { useState, useMemo } from 'react'
import { Navbar } from '@/components/Navbar'
import { VacancyList } from '@/components/VacancyList'
import { VacancyModal } from '@/components/VacancyModal'
import { Search } from 'lucide-react'
import type { Vacancy } from './types/vacancy'
import { useVacancies } from './context/VacancyContext'

interface DashboardStats {
  totalResumes: number
  reviewedResumes: number
}

export default function Page() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null)
  const [dashboardStats] = useState<DashboardStats>({
    totalResumes: 156,
    reviewedResumes: 89
  })
  const { addToArchive } = useVacancies()

  const filteredVacancies = useMemo(() => {
    if (!searchQuery.trim()) return vacancies;

    const query = searchQuery.toLowerCase().trim();
    return vacancies.filter(vacancy => 
      vacancy.title.toLowerCase().includes(query) ||
      vacancy.area.toLowerCase().includes(query) ||
      vacancy.workFormat.toLowerCase().includes(query) ||
      `${vacancy.salaryFrom} - ${vacancy.salaryTo}`.includes(query)
    );
  }, [vacancies, searchQuery]);

  const handleSaveVacancy = (vacancy: Vacancy) => {
    if (editingVacancy) {
      setVacancies(vacancies.map(v => v.id === editingVacancy.id ? vacancy : v))
    } else {
      setVacancies([...vacancies, { ...vacancy, id: Date.now() }])
    }
    setIsModalOpen(false)
    setEditingVacancy(null)
  }

  const handleEditVacancy = (vacancy: Vacancy) => {
    setEditingVacancy(vacancy)
    setIsModalOpen(true)
  }

  const handleArchiveVacancy = (vacancy: Vacancy) => {
    setVacancies(vacancies.filter(v => v.id !== vacancy.id))
    addToArchive(vacancy)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Обзор вакансии</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-100 rounded-lg p-4 transition-transform duration-300 hover:scale-105 cursor-pointer">
              <p className="text-lg font-semibold text-blue-800">Резюме в базе данных</p>
              <p className="text-3xl font-bold text-blue-600">{dashboardStats.totalResumes}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-4 transition-transform duration-300 hover:scale-105 cursor-pointer">
              <p className="text-lg font-semibold text-green-800">Активных вакансии</p>
              <p className="text-3xl font-bold text-green-600">{vacancies.length}</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-4 transition-transform duration-300 hover:scale-105 cursor-pointer">
              <p className="text-lg font-semibold text-yellow-800">Архивных вакансии</p>
              <p className="text-3xl font-bold text-yellow-600">{dashboardStats.reviewedResumes}</p>
            </div>
          </div>
          
        </div>

        <h2 className="text-3xl font-bold text-gray-800 text-center mb-16">Активные вакансии</h2>
        
        {vacancies.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6 relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск по вакансиям..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <div className="mt-4 flex justify-between items-center">
                {searchQuery && (
                  <div className="text-sm text-gray-500">
                    Найдено результатов: {filteredVacancies.length}
                  </div>
                )}
                <div className="fixed bottom-8 right-8">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-4 rounded-full transition duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {filteredVacancies.length > 0 ? (
              <VacancyList vacancies={filteredVacancies} onEdit={handleEditVacancy} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">По вашему запросу ничего не найдено</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xl text-gray-500 mb-8">У вас пока нет активных вакансий.</p>
            
            <button 
              className="bg-transparent hover:bg-blue-600 text-blue-600 hover:text-white text-2xl font-bold py-6 px-12 border-4 border-blue-600 hover:border-transparent rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl"
              onClick={() => setIsModalOpen(true)}
            >
              Создать вакансию
            </button>
          
          </div>


        )}

        <VacancyModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingVacancy(null)
          }}
          onSave={handleSaveVacancy}
          onArchive={editingVacancy ? handleArchiveVacancy : undefined}
          vacancy={editingVacancy}
        />
      </div>
    </main>
  )
}