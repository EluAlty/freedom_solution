export interface Area {
  id: string;
  name: string;
  url?: string;
}

export interface Gender {
  id: 'male' | 'female';
  name: string;
}

export interface Salary {
  amount: number;
  currency: string;
}

export interface Education {
  level: {
    id: 'secondary' | 'bachelor' | 'master' | 'higher' | 'unfinished_higher';
    name: string;
  };
  primary: Array<{
    id: string;
    name: string;
    organization: string;
    result: string;
    year: number;
  }>;
}

export interface Experience {
  start: string;
  end?: string;
  company: string;
  position: string;
  area?: Area;
  company_url?: string;
}

export interface Resume {
  id: string;
  title: string;
  fullName?: string;
  position?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
  area?: Area;
  age?: number;
  gender?: Gender;
  salary?: Salary;
  total_experience?: {
    months: number;
  };
  education?: Education;
  experience?: Experience[];
  alternate_url?: string;
  download?: {
    pdf: { url: string };
    rtf: { url: string };
  };
}

export interface ResumeResponse {
  found: number;
  items: Resume[];
  page: number;
  pages: number;
  per_page: number;
}

export interface ResumeAnalysisResponse {
  data: {
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