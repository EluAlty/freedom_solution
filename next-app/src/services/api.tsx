import axios from 'axios';
import type { Vacancy } from '../app/types/vacancy';
import type { ResumeResponse } from '../app/types/resume';
import type { Resume } from '../app/types/resume';
import type { ResumeItem } from '@/app/types/resume_storage';
import type { ResumeItemSend } from '@/app/types/resume_item_send';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

interface DashboardStats {
  totalResumes: number;
  activeVacancies: number;
}

export interface SearchParams {
  text: string;
  page?: number;
  experience?: 'employment' | 'between1And3' | 'between3And6' | 'moreThan6';
  area?: number;
  salary_from?: number;
  salary_to?: number;
  currency?: string;
  education?: 'bachelor' | 'master' | 'unfinished_higher';
  employment?: 'full' | 'part' | 'project';
  schedule?: 'remote' | 'fullDay' | 'flexible';
  relocation?: 'living_or_relocation';
}

export const statsApi = {
  getDashboardStats: () => api.get<DashboardStats>('/resume/stats'),
};


export const resumeStorageApi = {
  uploadPdf: (formData: FormData) => 
    api.post<ResumeItem>('/resume-storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  getAll: () => api.get<{ items: ResumeItem[] }>('/resume-storage/'),
  delete: (id: number) => api.delete(`/resume-storage/${id}`),
  getMatching: (vacancyId: string) => 
    api.get<{ items: ResumeItem[], total: number }>(`/resume-storage/matching/${vacancyId}`)
};

export const vacancyApi = {
  getAll: () => api.get<{ items: Vacancy[] }>('/vacancies/'),
  getById: (id: number) => api.get<Vacancy>(`/vacancies/${id}/`),
  create: (vacancy: Partial<Omit<Vacancy, 'id'>>) => {
    if (!vacancy.title) {
      throw new Error('Title is required');
    }

    const payload = {
      title: vacancy.title,
      experience: vacancy.experience || '',
      salary_from: vacancy.salary_from || 0,
      salary_to: vacancy.salary_to || 0,
      currency: vacancy.currency || 'KZT',
      work_format: vacancy.work_format || '',
      education: vacancy.education || '',
      age_from: vacancy.age_from || '',
      age_to: vacancy.age_to || '',
      relocation: vacancy.relocation || false,
      area: vacancy.area || ''
    };

    return api.post<Vacancy>('/vacancies/', payload);
  },
  update: (id: number, vacancy: Partial<Vacancy>) => api.put<Vacancy>(`/vacancies/${id}/`, vacancy),
  delete: (id: number) => api.delete(`/vacancies/${id}/`)
};

export const resumeApi = {
  search: (params: SearchParams) => api.get<ResumeResponse>('/resume/', { params }),

  getById: (id: string) => api.get<Resume>(`/resume/`, { 
    params: { id }
  }),

  saveToDb: (resumes: ResumeItemSend[]) => {
    const items = resumes.map(resume => ({
      title: resume.title,
      area: resume.area,
      experience: resume.experience,
      education: resume.education,
      file_name: resume.file_name,
      hh_url: resume.hh_url || '',
      hh_id: resume.hh_id || ''
    }));
    
    return api.post('/resume-storage/', { items });
  },

  downloadPdf: (url: string) => api.get(url, {
    responseType: 'blob',
    headers: {
      'Accept': 'application/pdf'
    }
  }),

  getFromDb: (params: {
    query?: string;
    position?: string;
    page?: number;
    limit?: number;
  }) => api.get<{
    items: Resume[];
    total: number;
  }>('/resume/', { params }),

  deleteFromDb: (id: string) => api.post('/resume/', { 
    action: 'delete',
    id 
  }),

  updateInDb: (id: string, resume: Partial<Resume>) => 
    api.post('/resume/', {
      action: 'update',
      id,
      data: resume
    }),

  getStats: () => api.get<{
    byPosition: Record<string, number>;
    totalResumes: number;
  }>('/resume/'),

  downloadFromHh: (resumeUrl: string, resumeId: string) => 
    api.post('/resume/download', {
      resume_url: resumeUrl,
      resume_id: resumeId
    }, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    }),
    

  downloadFromStorage: (filename: string) => 
    api.get(`/resume-storage/download`, {
      params: { filename },
      responseType: 'blob',
      headers: {
        'Accept': 'application/octet-stream'
      }
    }),

    analyzeResume: (resumeId: number, vacancyId: string) => 
      api.post<{
        total_score: number;
        bert_similarity: number;
        skills_match: number;
      }>('/resume-storage/analyze', {
        resume_id: resumeId,
        vacancy_id: vacancyId
      })
}; 