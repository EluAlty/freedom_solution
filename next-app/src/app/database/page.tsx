'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/button'
import {FileUp, Download, Trash2 } from 'lucide-react'
import { resumeStorageApi } from '@/services/api'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { ResumeItem} from '../types/resume_storage'
import { resumeApi } from '@/services/api'
import axios from 'axios'
import { Vacancy } from '../types/vacancy'
import { vacancyApi } from '@/services/api'


export default function DatabasePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [resumes, setResumes] = useState<ResumeItem[]>([])
  const [totalResumes, setTotalResumes] = useState(0)
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [selectedVacancy, setSelectedVacancy] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const totalResponse = await resumeStorageApi.getAll();
      setTotalResumes(totalResponse.data.items.length);
      
      if (selectedVacancy) {
        const vacancy = vacancies.find(v => v.id === selectedVacancy);
        if (!vacancy) {
          toast.error('Вакансия не найдена');
          return;
        }
        const response = await resumeStorageApi.getMatching(String(selectedVacancy));
        setResumes(response.data.items);
      } else {
        setResumes(totalResponse.data.items);
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      toast.error('Ошибка при загрузке данных');
    } finally {
      setIsLoading(false)
    }
  }, [selectedVacancy, vacancies]);

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const loadVacancies = async () => {
      try {
        const response = await vacancyApi.getAll();
        setVacancies(response.data.items);
      } catch (error) {
        console.error('Ошибка при загрузке вакансий:', error);
        toast.error('Ошибка при загрузке вакансий');
      }
    };
    
    loadVacancies();
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files?.length) return
      
      const formData = new FormData()
      formData.append('file', event.target.files[0])
      
      const response = await resumeStorageApi.uploadPdf(formData)
      
      if (response.data) {
        toast.success('Резюме успешно загружено')
        const totalResponse = await resumeStorageApi.getAll();
        setTotalResumes(totalResponse.data.items.length);
        
        if (!selectedVacancy) {
          setResumes(totalResponse.data.items);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке:', error)
      toast.error('Ошибка при загрузке файла')
    }
  }



  const handleDeleteResume = async (resume: ResumeItem) => {
    try {
      await resumeStorageApi.delete(Number(resume.id));
      setResumes(resumes.filter(r => r.id !== resume.id));
      setTotalResumes(prev => prev - 1);
      toast.success('Резюме удалено');
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      toast.error('Ошибка при удалении резюме');
    }
  };


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
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-blue-100 rounded-lg p-4">
                  <p className="text-lg font-semibold text-blue-800">Всего резюме в базе данных</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalResumes}
                  </p>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Вакансии</h3>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedVacancy(null)}
                      className={`${!selectedVacancy ? 'bg-blue-500 text-white' : ''}`}
                    >
                      Показать все резюме
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {vacancies.map(vacancy => (
                      <div
                        key={vacancy.id}
                        onClick={() => setSelectedVacancy(Number(vacancy.id))}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedVacancy === Number(vacancy.id) 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{vacancy.title}</h4>
                          <span className="text-sm">
                            {selectedVacancy === Number(vacancy.id) ? resumes.length : '0'}
                            {' подходящих резюме'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="space-y-4">
                {resumes.map(resume => (
                  <div key={resume.id} className="border rounded-lg p-4 hover:border-blue-500 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{resume.title}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <span>{resume.area}</span> • 
                          <span className="ml-2">{resume.experience}</span> •
                          <span className="ml-2">{resume.education}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteResume(resume)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={async () => {
                            try {
                              console.log('API_URL:', process.env.NEXT_PUBLIC_API_URL);
                              console.log('Начало скачивания', {
                                hh_url: resume.hh_url,
                                file_name: resume.file_name
                              });
              
                              let response;
                              if (resume.hh_url === "") {
                                console.log('Отправка запроса на /resume-storage/download');
                                response = await resumeApi.downloadFromStorage(resume.file_name);
                              } else {
                                console.log('Отравка запроса на /resume/download');
                                response = await resumeApi.downloadFromHh(
                                  resume.hh_url,
                                  resume.hh_id
                                );
                              }
              
                              console.log('Получен ответ:', {
                                status: response.status,
                                headers: response.headers,
                                contentType: response.headers['content-type']
                              });
              
                              const blob = new Blob([response.data], { 
                                type: response.headers['content-type'] 
                              });
                              console.log('Создан blob размером:', blob.size);
              
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = resume.hh_url === "" ? resume.file_name : `${resume.hh_id}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              window.URL.revokeObjectURL(url);
              
                              toast.success('айл успешно скачан');
                            } catch (error) {
                              console.error('Полная ошибка при скачивании:', error);
                              if (axios.isAxiosError(error)) {
                                console.error('Ответ сервера:', error.response?.data);
                                console.error('Статус ошибки:', error.response?.status);
                              }
                              toast.error('Ошибка при скачивании файла');
                            }
                          }}
                        >
                          <Download className="w-4 h-4" />
                          Скачать PDF
                        </Button>
                      </div>
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
          </>
        )}
      </div>
    </main>
  )
}