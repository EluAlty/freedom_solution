'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { ResumeList } from '@/components/ResumeList'
import { ResumeModal } from '@/components/ResumeModal'
import { Button } from '@/components/button'
import { Card, CardContent } from '@/components/card'
import { Search, UserPlus } from 'lucide-react'
import type { Resume } from '../types/resume'

interface DatabaseStats {
  totalResumes: number
  newResumes: number
  matchedResumes: number
}

export default function DatabasePage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingResume, setEditingResume] = useState<Resume | null>(null)
  const [databaseStats] = useState<DatabaseStats>({
    totalResumes: 1234,
    newResumes: 56,
    matchedResumes: 78
  })

  const handleSaveResume = (resume: Resume) => {
    if (editingResume) {
      setResumes(resumes.map(r => r.id === editingResume.id ? resume : r))
    } else {
      setResumes([...resumes, { ...resume, id: Date.now() }])
    }
    setIsModalOpen(false)
    setEditingResume(null)
  }

  const handleEditResume = (resume: Resume) => {
    setEditingResume(resume)
    setIsModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Обзор базы данных</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-lg font-semibold text-gray-600">Всего резюме</p>
                <p className="text-3xl font-bold text-blue-600">{databaseStats.totalResumes}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-lg font-semibold text-gray-600">Новых резюме</p>
                <p className="text-3xl font-bold text-green-600">{databaseStats.newResumes}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-lg font-semibold text-gray-600">Подходящих резюме</p>
                <p className="text-3xl font-bold text-yellow-600">{databaseStats.matchedResumes}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">База данных резюме</h2>
          <div className="flex gap-4">
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 hover:bg-green-700"
              icon={<UserPlus className="w-5 h-5" />}
            >
              Добавить резюме
            </Button>
            <Button 
              variant="outline"
              icon={<Search className="w-5 h-5" />}
            >
              Поиск
            </Button>
          </div>
        </div>
        
        {resumes.length > 0 ? (
          <ResumeList resumes={resumes} onEdit={handleEditResume} />
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 mb-8">В базе данных пока нет резюме.</p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              size="lg"
              icon={<UserPlus className="w-6 h-6" />}
            >
              Добавить первое резюме
            </Button>
          </div>
        )}

        <ResumeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingResume(null)
          }}
          onSave={handleSaveResume}
          resume={editingResume}
        />
      </div>
    </main>
  )
}