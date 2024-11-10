'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Navbar } from '@/components/Navbar'
import { VacancyList } from '@/components/VacancyList'
import { VacancyModal } from '@/components/VacancyModal'
import { Search } from 'lucide-react'
import type { Vacancy, VacancyCreate } from './types/vacancy'
import { vacancyApi, resumeStorageApi } from '@/services/api'
import { toast } from 'sonner'
import axios from 'axios'
import { LoadingSpinner } from '@/components/LoadingSpinner'


interface DashboardStats {
  totalResumes: number;
  activeVacancies: number;
}

export default function Page() {
  const [isLoading, setIsLoading] = useState(true)
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [prevStats, setPrevStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (stats) {
      setPrevStats(stats);
    }
  }, [stats]);

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [vacanciesRes, resumeStorageRes] = await Promise.all([
        vacancyApi.getAll(),
        resumeStorageApi.getAll()
      ])
      setVacancies(vacanciesRes.data.items)
      setStats({
        totalResumes: resumeStorageRes.data.items.length,
        activeVacancies: vacanciesRes.data.items.length
      })
    } catch(error: unknown) {
      console.error(error)
      toast.error('Ошибка при загрузке данных')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredVacancies = useMemo(() => {
    if (!searchQuery.trim()) return vacancies;

    const query = searchQuery.toLowerCase().trim();
    return vacancies.filter(vacancy => 
      vacancy.title.toLowerCase().includes(query) ||
      (vacancy.area?.toLowerCase().includes(query) ?? false) ||
      (vacancy.work_format?.toLowerCase().includes(query) ?? false) ||
      `${vacancy.salary_from || ''} - ${vacancy.salary_to || ''}`.includes(query)
    );
  }, [vacancies, searchQuery]);

  const handleSave = async (vacancyData: Vacancy | VacancyCreate) => {
    try {
      console.log('Отправляемые данные:', vacancyData);
      
      if ('id' in vacancyData) {
        await vacancyApi.update(vacancyData.id, vacancyData);
        setVacancies(prev => prev.map(v => 
          v.id === vacancyData.id ? vacancyData as Vacancy : v
        ));
      } else {
        const response = await vacancyApi.create(vacancyData);
        setVacancies(prev => [...prev, response.data]);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Полная ошибка:', error);
        console.error('Ответ сервера:', error.response?.data);
      } else {
        console.error('Неизвестная ошибка:', error);
      }
      toast.error('Ошибка при сохранении вакансии');
    }
  };

  const handleDeleteVacancy = async (vacancy: Vacancy) => {
    try {
      await vacancyApi.delete(vacancy.id);
      setVacancies(vacancies.filter(v => v.id !== vacancy.id));
      loadData();
      toast.success('Вакансия удалена');
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      toast.error('Ошибка при удалении вакансии');
    }
  }

  

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Обзор</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`
                    bg-blue-100 rounded-lg p-4 
                    transition-all duration-300 
                    ${stats?.totalResumes !== prevStats?.totalResumes ? 'scale-105' : ''}
                    hover:scale-105 cursor-pointer
                  `}
                >
                  <p className="text-lg font-semibold text-blue-800">Резюме в базе данных</p>
                  <p className="text-3xl font-bold text-blue-600">{stats?.totalResumes || 0}</p>
                </div>
                <div 
                  className={`
                    bg-green-100 rounded-lg p-4 
                    transition-all duration-300 
                    ${stats?.activeVacancies !== prevStats?.activeVacancies ? 'scale-105' : ''}
                    hover:scale-105 cursor-pointer
                  `}
                >
                  <p className="text-lg font-semibold text-green-800">Активных вакансий</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.activeVacancies || 0}</p>
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
                  <VacancyList 
                    vacancies={filteredVacancies} 
                    onUpdateStats={loadData}
                    onDelete={handleDeleteVacancy}
                  />
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
              onSave={handleSave}
              onDelete={handleDeleteVacancy}
              vacancy={editingVacancy}
            />
          </>
        )}
      </div>
    </main>
  )
}