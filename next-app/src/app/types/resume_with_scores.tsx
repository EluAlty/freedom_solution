import type { Resume } from './resume';

export interface ResumeWithScores extends Resume {
  score?: number;
  matchDetails?: {
    bert_similarity: number;
    skills_match: number;
    total_score: number;
    title_match?: number;
    experience_match?: number;
    education_match?: number;
    location_match?: number;
    salary_match?: number;
  };
}

// Для обратной совместимости
export type ResumeWithScore = ResumeWithScores;