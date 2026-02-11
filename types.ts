
export type SchoolingLevel = 'Fundamental I' | 'Fundamental II' | 'Ensino Médio' | 'Superior';

export interface Student {
  id: string;
  name: string;
  cpf: string;
  dob: string;
  schooling: SchoolingLevel;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  dayOfWeek: string;
  shift: '1º Horário' | '2º Horário';
}

export interface LessonPlan {
  id: string;
  teacherId: string;
  date: string;
  shift: '1º Horário' | '2º Horário';
  description: string;
}

export interface Attendance {
  studentId: string;
  lessonPlanId: string;
  status: 'P' | 'F'; // Presente | Falta
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  description: string;
  value: number;
}

export interface AppState {
  students: Student[];
  teachers: Teacher[];
  lessonPlans: LessonPlan[];
  attendances: Attendance[];
  grades: Grade[];
  portalUrl?: string;
}
