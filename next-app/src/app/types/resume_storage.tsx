export interface ResumeItem {
    title: string;
    area: string;
    experience: string;
    education: string;
    file_name: string;
    hh_url: string;
    hh_id: string;
    id: string;
}

export interface ResumeStorage {
    items: ResumeItem[];
}
    

