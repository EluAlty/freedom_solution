export interface Resume {
  id: number;
  fullName: string;
  name: string;
  position: string;
  age: number;
  birthDate: string;
  experience: 'no_experience' | '1-3' | '3-5' | '5+';
  education: 'high_school' | 'bachelor' | 'master' | 'phd';
  skills: string[];
  desiredSalary: number;
  currency: 'KZT' | 'USD' | 'RUB';
  workFormat: 'office' | 'remote' | 'hybrid';
  relocation: boolean;
  location: string;
  contacts: {
    phone: string;
    email: string;
  };
}