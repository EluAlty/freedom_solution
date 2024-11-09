import React from 'react';
import { Resume } from '../app/types/resume';
import { ResumeCard } from './ResumeCard';

interface ResumeListProps {
  resumes: Resume[];
  onEdit: (resume: Resume) => void;
}

export const ResumeList: React.FC<ResumeListProps> = ({ resumes, onEdit }) => (
  <div className="space-y-4">
    {resumes.map(resume => (
      <ResumeCard key={resume.id} resume={resume} onEdit={onEdit} />
    ))}
  </div>
);