'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/button'
import { Search, FileUp, Download} from 'lucide-react'
import type { Resume } from '../types/resume'

interface ResumeStats {
  totalResumes: number;
  byPosition: {
    [key: string]: number;
  }
}

export default function DatabasePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [resumeStats] = useState<ResumeStats>({
    totalResumes: 1234,
    byPosition: {
      'Frontend Developer': 45,
      'Backend Developer': 38,
      'Full Stack Developer': 29,
      'UI/UX Designer': 22,
      'Project Manager': 15
    }
  })

  const handleFileUpload = () => {
    // Здесь будет логика загрузки PDF файлов
    console.log('File upload logic here')
  }

  // Временные данные для демонстрации
  const resumes: Resume[] = [
    {
      id: 1,
      fullName: 'Иван Иванов',
      name: 'Иван',
      position: 'Frontend Developer',
      age: 25,
      birthDate: '1999-01-01',
      experience: '3-5',
      education: 'bachelor',
      skills: ['React', 'TypeScript', 'JavaScript'],
      desiredSalary: 150000,
      currency: 'KZT',
      workFormat: 'office',
      relocation: false,
      location: 'Алматы',
      contacts: {
        phone: '+7 777 123 45 67',
        email: 'ivan@example.com'
      }
    },
    {
      id: 2,
      fullName: 'Петр Петров',
      name: 'Петр',
      position: 'Backend Developer',
      age: 28,
      birthDate: '1996-05-15',
      experience: '5+',
      education: 'master',
      skills: ['Python', 'Django', 'PostgreSQL'],
      desiredSalary: 200000,
      currency: 'KZT',
      workFormat: 'remote',
      relocation: true,
      location: 'Астана',
      contacts: {
        phone: '+7 777 987 65 43',
        email: 'petr@example.com'
      }
    }
  ]

  const getExperienceText = (experience: string): string => {
    const experienceMap: { [key: string]: string } = {
      'no_experience': 'Без опыта',
      '1-3': '1-3 года',
      '3-5': '3-5 лет',
      '5+': 'Более 5 лет'
    }
    return experienceMap[experience] || experience
  }

  const [showStats, setShowStats] = useState(false)

  // Функция фильтрации резюме
  const filteredResumes = resumes.filter(resume => {
    const searchLower = searchQuery.toLowerCase()
    return (
      resume.fullName.toLowerCase().includes(searchLower) ||
      resume.position.toLowerCase().includes(searchLower) ||
      resume.location.toLowerCase().includes(searchLower)
    )
  })

  // Группировка отфильтрованных резюме по позициям
  const groupedResumes = Object.entries(resumeStats.byPosition).reduce((acc, [position]) => {
    const positionResumes = filteredResumes.filter(resume => resume.position === position)
    if (positionResumes.length > 0) {
      acc[position] = positionResumes
    }
    return acc
  }, {} as { [key: string]: Resume[] })

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <div 
            onClick={() => setShowStats(!showStats)}
            className="bg-blue-100 rounded-lg p-4 transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
          >
            <p className="text-lg font-semibold text-blue-800">Резюме в базе данных</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-blue-600">{resumeStats.totalResumes}</p>
            </div>
          </div>
          
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showStats ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(resumeStats.byPosition).map(([position, count]) => (
                <div key={position} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600">{position}</p>
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по резюме..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
          
          <div className="space-y-8">
            {Object.entries(resumeStats.byPosition).map(([position]) => (
              <div key={position}>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{position}</h3>
                <div className="space-y-4">
                  {groupedResumes[position]?.map(resume => (
                    <div key={resume.id} className="border rounded-lg p-4 flex justify-between items-center hover:border-blue-500 transition-all">
                      <div>
                        <h3 className="text-lg font-semibold">{resume.fullName}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <span>{resume.position}</span> • 
                          <span className="ml-2">{resume.age} лет</span> • 
                          <span className="ml-2">{getExperienceText(resume.experience)}</span> •
                          <span className="ml-2">{resume.location}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => {/* Логика скачивания */}}
                      >
                        <Download className="w-4 h-4" />
                        Скачать PDF
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-8 right-8">
          <label className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300 ease-in-out cursor-pointer flex items-center gap-2 shadow-lg hover:shadow-xl">
            <FileUp className="w-5 h-5" />
            Загрузить резюме
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </main>
  )
}