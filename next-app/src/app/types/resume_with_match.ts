export interface ResumeWithMatch {
  id: number;
  title: string;
  area: string;
  experience: string;
  education: string;
  file_name: string;
  hh_url?: string;
  hh_id?: string;
  match_details?: {
    bert_similarity: number;
    skills_match: number;
    total_score: number;
  };
} 