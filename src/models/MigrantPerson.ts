export interface WorkExperience {
  role: string;
  company: string;
  durationYears: number;
}

export interface Education {
  degree: string;
  institution: string;
  year?: number;
}

export interface MigrantPerson {
  id: string;
  fullName: string;
  originCountry: string;
  currentCountry: string;
  email?: string;
  phone?: string;
  skills: string[];
  languages: string[];
  education: Education[];
  experience: WorkExperience[];
  rawText: string;
}
