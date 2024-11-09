'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Search } from 'lucide-react'
import { useVacancies } from '../context/VacancyContext'
import { VacancyCard } from '@/components/VacancyCard'

export default function ArchivePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { archivedVacancies } = useVacancies()

  const filteredVacancies = archivedVacancies.filter(vacancy => {
    const searchLower = searchQuery.toLowerCase()
    return (
      vacancy.title.toLowerCase().includes(searchLower) ||
      vacancy.area.toLowerCase().includes(searchLower)
    )
  })

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <div className="bg-yellow-100 rounded-lg p-4 transition-transform duration-300 hover:scale-[1.02] cursor-pointer">
            <p className="text-lg font-semibold text-yellow-800">Архивные вакансии</p>
            <p className="text-3xl font-bold text-yellow-600">{archivedVacancies.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по архивным вакансиям..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-gray-500">
                Найдено результатов: {filteredVacancies.length}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredVacancies.map(vacancy => (
              <VacancyCard 
                key={vacancy.id} 
                vacancy={vacancy} 
                isArchived={true}
              />
            ))}
            {filteredVacancies.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Архив вакансий пуст</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
} 