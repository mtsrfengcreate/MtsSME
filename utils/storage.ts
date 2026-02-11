
import { AppState } from '../types';

const STORAGE_KEY = 'educontrol_pro_data_v2';

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save state to localStorage:", error);
  }
};

export const loadState = (): AppState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        students: [],
        teachers: [],
        lessonPlans: [],
        attendances: [],
        grades: [],
        portalUrl: ''
      };
    }
    const parsed = JSON.parse(data);
    return {
      students: parsed.students || [],
      teachers: parsed.teachers || [],
      lessonPlans: parsed.lessonPlans || [],
      attendances: parsed.attendances || [],
      grades: parsed.grades || [],
      portalUrl: parsed.portalUrl || ''
    };
  } catch (error) {
    console.error("Failed to load state from localStorage:", error);
    return {
      students: [],
      teachers: [],
      lessonPlans: [],
      attendances: [],
      grades: [],
      portalUrl: ''
    };
  }
};
