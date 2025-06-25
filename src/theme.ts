import { createTheme } from '@mui/material/styles';

// 달력 테마 타입 정의
export interface CalendarTheme {
  name: string;
  description: string;
  table: {
    background: string;
    fontSize: string;
    borderColor?: string;
    borderWidth?: string;
    borderRadius?: string;
    boxShadow?: string;
  };
  header: {
    background: string;
    border: string;
    fontWeight: number;
    color: string;
  };
  dateHeader: {
    background: string;
    border: string;
    fontWeight: number;
    color: string;
  };
  labelHeader: {
    background: string;
    fontWeight: number;
  };
  cell: {
    background: string;
    border: string;
    color: string;
  };
  categoryLabels: {
    schedule: string;
    dailyMeditation: string;
    coffeeManagement: string;
    workSchedule: string;
    vehicleAndOther: string;
  };
  today: {
    background: string;
    color: string;
  };
  weekend: {
    color: string;
  };
  holiday: {
    color: string;
  };
}

// 기본 테마들
export const calendarThemes: CalendarTheme[] = [
  {
    name: '기본',
    description: '현재 사용 중인 기본 스타일',
    table: {
      background: '#fff',
      fontSize: '0.8rem',
      borderColor: '#000',
      borderWidth: '2px',
      borderRadius: '0',
      boxShadow: 'none',
    },
    header: {
      background: '#c8e6c9',
      border: '#000',
      fontWeight: 900,
      color: '#000',
    },
    dateHeader: {
      background: '#f5f5f5',
      border: '#000',
      fontWeight: 700,
      color: '#222',
    },
    labelHeader: {
      background: '#f5f5f5',
      fontWeight: 700,
    },
    cell: {
      background: '#fff',
      border: '#000',
      color: '#000',
    },
    categoryLabels: {
      schedule: '#ffffff',
      dailyMeditation: '#faf8f0',
      coffeeManagement: '#ffffff',
      workSchedule: '#f1f8e9',
      vehicleAndOther: '#ffffff',
    },
    today: {
      background: '#f44336',
      color: '#fff',
    },
    weekend: {
      color: '#f44336',
    },
    holiday: {
      color: '#f44336',
    },
  },
  {
    name: '모던',
    description: '깔끔하고 현대적인 스타일',
    table: {
      background: '#ffffff',
      fontSize: '0.8rem',
      borderColor: '#e0e0e0',
      borderWidth: '1px',
      borderRadius: '0',
      boxShadow: 'none',
    },
    header: {
      background: '#2196f3',
      border: '#e0e0e0',
      fontWeight: 600,
      color: '#222',
    },
    dateHeader: {
      background: '#f8f9fa',
      border: '#e0e0e0',
      fontWeight: 600,
      color: '#222',
    },
    labelHeader: {
      background: '#f8f9fa',
      fontWeight: 600,
    },
    cell: {
      background: '#ffffff',
      border: '#e0e0e0',
      color: '#333333',
    },
    categoryLabels: {
      schedule: '#ffffff',
      dailyMeditation: '#e3f2fd',
      coffeeManagement: '#ffffff',
      workSchedule: '#e8f5e8',
      vehicleAndOther: '#ffffff',
    },
    today: {
      background: '#2196f3',
      color: '#ffffff',
    },
    weekend: {
      color: '#f44336',
    },
    holiday: {
      color: '#ff9800',
    },
  },
  {
    name: '다크',
    description: '어두운 테마',
    table: {
      background: '#2d2d2d',
      fontSize: '0.8rem',
      borderColor: '#555555',
      borderWidth: '1px',
      borderRadius: '0',
      boxShadow: 'none',
    },
    header: {
      background: '#424242',
      border: '#555555',
      fontWeight: 600,
      color: '#ffffff',
    },
    dateHeader: {
      background: '#3a3a3a',
      border: '#555555',
      fontWeight: 600,
      color: '#fff',
    },
    labelHeader: {
      background: '#3a3a3a',
      fontWeight: 600,
    },
    cell: {
      background: '#2d2d2d',
      border: '#555555',
      color: '#ffffff',
    },
    categoryLabels: {
      schedule: '#2d2d2d',
      dailyMeditation: '#3d3d2d',
      coffeeManagement: '#2d2d2d',
      workSchedule: '#2d3d2d',
      vehicleAndOther: '#2d2d2d',
    },
    today: {
      background: '#ff5722',
      color: '#ffffff',
    },
    weekend: {
      color: '#ff9800',
    },
    holiday: {
      color: '#f44336',
    },
  },
  {
    name: '파스텔',
    description: '부드러운 파스텔 톤',
    table: {
      background: '#fefefe',
      fontSize: '0.8rem',
      borderColor: '#e1bee7',
      borderWidth: '1px',
      borderRadius: '0',
      boxShadow: 'none',
    },
    header: {
      background: '#ffb3d9',
      border: '#ff80ab',
      fontWeight: 600,
      color: '#222',
    },
    dateHeader: {
      background: '#f8f4ff',
      border: '#e1bee7',
      fontWeight: 600,
      color: '#222',
    },
    labelHeader: {
      background: '#f8f4ff',
      fontWeight: 600,
    },
    cell: {
      background: '#fefefe',
      border: '#e1bee7',
      color: '#6a4c93',
    },
    categoryLabels: {
      schedule: '#fefefe',
      dailyMeditation: '#fff3e0',
      coffeeManagement: '#fefefe',
      workSchedule: '#e8f5e8',
      vehicleAndOther: '#fefefe',
    },
    today: {
      background: '#ff80ab',
      color: '#ffffff',
    },
    weekend: {
      color: '#ff6b9d',
    },
    holiday: {
      color: '#ff9e80',
    },
  },
  {
    name: '비즈니스',
    description: '전문적이고 깔끔한 스타일',
    table: {
      background: '#ffffff',
      fontSize: '0.8rem',
      borderColor: '#bdc3c7',
      borderWidth: '1px',
      borderRadius: '0',
      boxShadow: 'none',
    },
    header: {
      background: '#2c3e50',
      border: '#34495e',
      fontWeight: 700,
      color: '#222',
    },
    dateHeader: {
      background: '#ecf0f1',
      border: '#bdc3c7',
      fontWeight: 700,
      color: '#222',
    },
    labelHeader: {
      background: '#ecf0f1',
      fontWeight: 700,
    },
    cell: {
      background: '#ffffff',
      border: '#bdc3c7',
      color: '#2c3e50',
    },
    categoryLabels: {
      schedule: '#ffffff',
      dailyMeditation: '#f7f9fa',
      coffeeManagement: '#ffffff',
      workSchedule: '#e8f4f8',
      vehicleAndOther: '#ffffff',
    },
    today: {
      background: '#3498db',
      color: '#ffffff',
    },
    weekend: {
      color: '#e74c3c',
    },
    holiday: {
      color: '#f39c12',
    },
  },
];

// 기본 테마
export const defaultCalendarTheme = calendarThemes[0];

// Material-UI 테마
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // A professional and clean blue
    },
    secondary: {
      main: '#dc004e', // A contrasting color for accents
    },
    background: {
      default: '#f4f6f8', // A very light grey for the page background
      paper: '#ffffff', // White for cards, dialogs, etc.
    },
    text: {
      primary: '#1c1c1c',
      secondary: '#5a5a5a',
    },
  },
  typography: {
    fontFamily: '"Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme; 