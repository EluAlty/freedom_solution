from dataclasses import dataclass, field
from typing import Optional, List, Dict
from pydantic import BaseModel

@dataclass
class Area:
    id: str
    name: str
    url: str

@dataclass
class Gender:
    id: str
    name: str

@dataclass
class Salary:
    amount: int
    currency: str

@dataclass
class TotalExperience:
    months: int

@dataclass
class Comments:
    url: str
    counters: Dict[str, int]

@dataclass
class Owner:
    id: str
    comments: Comments

@dataclass
class Download:
    pdf: Dict[str, str]
    rtf: Dict[str, str]

@dataclass
class Actions:
    download: Download

@dataclass
class Platform:
    id: str

@dataclass
class EducationPrimary:
    id: str
    name: str
    organization: str
    result: str
    year: int
    name_id: Optional[str] = None
    organization_id: Optional[str] = None
    result_id: Optional[str] = None

@dataclass
class EducationLevel:
    id: str
    name: str

@dataclass
class Education:
    level: EducationLevel
    primary: List[EducationPrimary]

@dataclass
class Experience:
    start: str
    end: Optional[str]
    company: str
    company_id: Optional[str]
    industry: Optional[str]
    industries: List[str]
    area: Area
    company_url: Optional[str]
    employer: Optional[str]
    position: str

@dataclass
class Resume:
    last_name: Optional[str]
    first_name: Optional[str]
    middle_name: Optional[str]
    title: str
    created_at: str
    updated_at: str
    area: Area
    age: int
    gender: Gender
    salary: Salary
    photo: Optional[str]
    total_experience: TotalExperience
    certificate: List
    owner: Owner
    can_view_full_info: bool
    negotiations_history: Dict[str, str]
    hidden_fields: List
    actions: Actions
    url: str
    alternate_url: str
    id: str
    download: Download
    platform: Platform
    education: Education
    experience: List[Experience]
    favorited: bool
    viewed: bool
    marked: bool
    last_negotiation: Optional[str]



class ResumeResponse:
    found: int
    items: List[Resume]
    page: int
    pages: int
    per_page: int

    def __init__(self, found: int, items: List[dict], page: int, pages: int, per_page: int):
        self.found = found
        self.items = [Resume(**item) for item in items]
        self.page = page
        self.pages = pages
        self.per_page = per_page

class DownloadResumeRequest(BaseModel):
    resume_url: str
    resume_id: str
