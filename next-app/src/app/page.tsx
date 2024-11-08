'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { VacancyList } from '@/components/VacancyList'
import { VacancyModal } from '@/components/VacancyModal'
import type { Vacancy } from './types/types'

interface DashboardStats {
  totalResumes: number
  reviewedResumes: number
}

export default function Page() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null)
  const [dashboardStats] = useState<DashboardStats>({
    totalResumes: 156,
    reviewedResumes: 89
  })

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Обзор вакансий</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-100 rounded-lg p-4">
              <p className="text-lg font-semibold text-blue-800">Резюме в базе данных</p>
              <p className="text-3xl font-bold text-blue-600">{dashboardStats.totalResumes}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-4">
              <p className="text-lg font-semibold text-green-800">Активных вакансий</p>
              <p className="text-3xl font-bold text-green-600">{vacancies.length}</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-4">
              <p className="text-lg font-semibold text-yellow-800">Рассмотренных резюме</p>
              <p className="text-3xl font-bold text-yellow-600">{dashboardStats.reviewedResumes}</p>
            </div>
          </div>
          {vacancies.length > 0 && (
            <button 
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full transition duration-300 ease-in-out"
              onClick={() => setIsModalOpen(true)}
            >
              Создать вакансию
            </button>
          )}
        </div>

        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Активные вакансии</h2>
        
        {vacancies.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <VacancyList vacancies={vacancies} onEdit={handleEditVacancy} />
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
          vacancy={editingVacancy}
        />
      </div>
    </main>
  )
}