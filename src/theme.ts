import { createTheme } from '@mui/material/styles';

// 달력 테마 타입 정의
export interface CalendarTheme {
  name: string;
  description: string;
  table: {
    background: string;
    fontSize: string;
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
    name: '라이트',
    description: '밝고 심플한 회색',
    table: {
      background: '#fff',
      fontSize: '0.8rem',
    },
    header: {
      background: '#f2f2f2',
      border: '#e0e0e0',
      fontWeight: 900,
      color: '#000',
    },
    dateHeader: {
      background: '#cccccc',
      border: '#e0e0e0',
      fontWeight: 700,
      color: '#000',
    },
    labelHeader: {
      background: '#f2f2f2',
      fontWeight: 700,
    },
    cell: {
      background: '#fff',
      border: '#e0e0e0',
      color: '#000',
    },
    categoryLabels: {
      schedule: '#ffffff',
      dailyMeditation: '#ffffff',
      coffeeManagement: '#ffffff',
      workSchedule: '#ffffff',
      vehicleAndOther: '#ffffff',
    },
    today: {
      background: '#ff0000',
      color: '#fff',
    },
    weekend: {
      color: '#ff0000',
    },
    holiday: {
      color: '#ff0000',
    },
  },
  {
    name: '블루',
    description: '산뜻한 파란색',
    table: {
      background: '#ffffff',
      fontSize: '0.8rem',
    },
    header: {
      background: '#f2f2f2',
      border: '#e0e0e0',
      fontWeight: 600,
      color: '#000',
    },
    dateHeader: {
      background: '#e3f2fd',
      border: '#e0e0e0',
      fontWeight: 600,
      color: '#000',
    },
    labelHeader: {
      background: '#f2f2f2',
      fontWeight: 600,
    },
    cell: {
      background: '#ffffff',
      border: '#e0e0e0',
      color: '#000',
    },
    categoryLabels: {
      schedule: '#ffffff',
      dailyMeditation: '#ffffff',
      coffeeManagement: '#ffffff',
      workSchedule: '#ffffff',
      vehicleAndOther: '#ffffff',
    },
    today: {
      background: '#ff0000',
      color: '#fff',
    },
    weekend: {
      color: '#ff0000',
    },
    holiday: {
      color: '#ff0000',
    },
  },
  {
    name: '다크',
    description: '어두운 다크모드',
    table: {
      background: '#23272f',
      fontSize: '0.8rem',
    },
    header: {
      background: '#23272f',
      border: '#444',
      fontWeight: 700,
      color: '#fff',
    },
    dateHeader: {
      background: '#333843',
      border: '#444',
      fontWeight: 700,
      color: '#fff',
    },
    labelHeader: {
      background: '#23272f',
      fontWeight: 700,
    },
    cell: {
      background: '#23272f',
      border: '#444',
      color: '#fff',
    },
    categoryLabels: {
      schedule: '#23272f',
      dailyMeditation: '#23272f',
      coffeeManagement: '#23272f',
      workSchedule: '#23272f',
      vehicleAndOther: '#23272f',
    },
    today: {
      background: '#ff1744',
      color: '#fff',
    },
    weekend: {
      color: '#ff1744',
    },
    holiday: {
      color: '#ff1744',
    },
  },
  {
    name: '핑크',
    description: '파스텔톤 연핑크',
    table: {
      background: '#ffffff',
      fontSize: '0.8rem',
    },
    header: {
      background: '#f2f2f2',
      border: '#e0e0e0',
      fontWeight: 600,
      color: '#000',
    },
    dateHeader: {
      background: '#ffe4ef',
      border: '#e0e0e0',
      fontWeight: 600,
      color: '#000',
    },
    labelHeader: {
      background: '#f2f2f2',
      fontWeight: 600,
    },
    cell: {
      background: '#ffffff',
      border: '#e0e0e0',
      color: '#000',
    },
    categoryLabels: {
      schedule: '#ffffff',
      dailyMeditation: '#ffffff',
      coffeeManagement: '#ffffff',
      workSchedule: '#ffffff',
      vehicleAndOther: '#ffffff',
    },
    today: {
      background: '#ff0000',
      color: '#fff',
    },
    weekend: {
      color: '#ff0000',
    },
    holiday: {
      color: '#ff0000',
    },
  },
  {
    name: '네이비',
    description: '딥블루(네이비) 포인트',
    table: {
      background: '#ffffff',
      fontSize: '0.8rem',
    },
    header: {
      background: '#f2f2f2',
      border: '#e0e0e0',
      fontWeight: 700,
      color: '#000',
    },
    dateHeader: {
      background: '#e0e6ed',
      border: '#e0e0e0',
      fontWeight: 700,
      color: '#000',
    },
    labelHeader: {
      background: '#f2f2f2',
      fontWeight: 700,
    },
    cell: {
      background: '#ffffff',
      border: '#e0e0e0',
      color: '#000',
    },
    categoryLabels: {
      schedule: '#ffffff',
      dailyMeditation: '#ffffff',
      coffeeManagement: '#ffffff',
      workSchedule: '#ffffff',
      vehicleAndOther: '#ffffff',
    },
    today: {
      background: '#ff0000',
      color: '#fff',
    },
    weekend: {
      color: '#ff0000',
    },
    holiday: {
      color: '#ff0000',
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