'use client'

import React, { createContext, useContext } from 'react'
import type { Vacancy } from '../types/vacancy'

interface VacancyContextType {
  // Можно добавить другие методы если нужно
}

const VacancyContext = createContext<VacancyContextType | undefined>(undefined)

export function VacancyProvider({ children }: { children: React.ReactNode }) {
  return (
    <VacancyContext.Provider value={{}}>
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