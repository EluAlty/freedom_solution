import React from 'react';
import { Resume } from '../app/types/resume';
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Card, CardContent, CardFooter } from "@/components/card"
import { 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Calendar,
  Mail,
  Phone,
  Settings2,
  Eye,
  Download
} from 'lucide-react'

interface ResumeCardProps {
  resume: Resume;
  onEdit: (resume: Resume) => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ resume, onEdit }) => {
  return (
    <Card className="w-full bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">{resume.fullName}</h3>
            <p className="text-lg text-gray-600">{resume.position}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(resume)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Settings2 className="w-5 h-5" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-gray-600">
            <Mail className="w-5 h-5 mr-2" />
            {resume.contacts.email}
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="w-5 h-5 mr-2" />
            {resume.contacts.phone}
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-2" />
            {resume.location}
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-2" />
            {resume.birthDate}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
            <Briefcase className="w-4 h-4 mr-2" />
            {resume.experience} лет опыта
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
            <GraduationCap className="w-4 h-4 mr-2" />
            {resume.education}
          </Badge>
          {resume.skills.map((skill, index) => (
            <Badge key={index} variant="outline" className="px-3 py-1 text-sm font-medium">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0 flex gap-4">
        <Button 
          variant="default"
          size="lg"
          className="flex-1 text-base font-medium"
          icon={<Eye className="w-5 h-5" />}
        >
          Просмотреть резюме
        </Button>
        <Button 
          variant="outline"
          size="lg"
          className="flex-1 text-base font-medium"
          icon={<Download className="w-5 h-5" />}
        >
          Скачать PDF
        </Button>
      </CardFooter>
    </Card>
  );
};