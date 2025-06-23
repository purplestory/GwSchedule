export interface RawScheduleItem {
  id: string;
  date: string;
  dayOfWeek: string;
  morning: string;
  afternoon: string;
  evening: string;
  note: string;
}

export interface ScheduleItem {
  id: string;
  date: string;
  dayOfWeek: string;
  schedule: string;
  dailyMeditation: string;
  coffeeManagement: string;
  workSchedule: string;
  vehicleAndOther: string;
  // Staff information based on color matching
  scheduleStaff?: string[];
  dailyMeditationStaff?: string[];
  coffeeManagementStaff?: string[];
  workScheduleStaff?: string[];
  vehicleAndOtherStaff?: string[];
}

export interface StaffMember {
  id: string;
  name: string;
  shortName: string;
  department: string;
  color: string;
}

export interface MonthlySchedule {
  year: number;
  month: number;
  schedules: ScheduleItem[];
}

export interface FilterOptions {
  staffMember?: string;
  scheduleType?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export type ScheduleType = '일정' | '근무' | '차량' | '매일씨앗묵상' | '커피관리' | '기타';

export interface ScheduleData {
  year: number;
  month: number;
  schedules: ScheduleItem[];
  staffMembers: StaffMember[];
  textGrid: (string | null)[][]; // For debugging
}

export interface VacationStats {
  [key: string]: number;
}

export interface SchedulePackage {
  scheduleData: { [date: string]: ScheduleItem[] };
  staffMembers: StaffMember[];
  rawScheduleItems: RawScheduleItem[];
  holidays: string[];
} 