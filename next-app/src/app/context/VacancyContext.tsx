'use client'

import React, { createContext, useContext, useState } from 'react'
import type { Vacancy } from '../types/vacancy'

interface VacancyContextType {
  archivedVacancies: Vacancy[]
  addToArchive: (vacancy: Vacancy) => void
}

const VacancyContext = createContext<VacancyContextType | undefined>(undefined)

export function VacancyProvider({ children }: { children: React.ReactNode }) {
  const [archivedVacancies, setArchivedVacancies] = useState<Vacancy[]>([])

  const addToArchive = (vacancy: Vacancy) => {
    setArchivedVacancies(prev => [...prev, vacancy])
  }

  return (
    <VacancyContext.Provider value={{ archivedVacancies, addToArchive }}>
      {children}
    </VacancyContext.Provider>
  )
}

export function useVacancies() {
  const context = useContext(VacancyContext)
  if (context === undefined) {
    throw new Error('useVacancies must be used within a VacancyProvider')
  }
  return context
} 