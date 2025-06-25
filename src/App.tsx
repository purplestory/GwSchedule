import React, { useState, useEffect, useCallback } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  useMediaQuery,
  Button,
  Collapse,
  Chip,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Assessment, FilterList, Refresh, Fullscreen, FullscreenExit, Person, Palette, Settings } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { format } from 'date-fns';
import ScheduleCalendar from './components/ScheduleCalendar';
import StaffFilter from './components/StaffFilter';
import Statistics from './components/Statistics';
import ThemeSelector from './components/ThemeSelector';
import { getScheduleData, setGoogleSheetUrl as setSheetUrl, getCurrentGoogleSheetUrl } from './services/googleSheetService';
import { defaultCalendarTheme, CalendarTheme } from './theme';
import { ScheduleData } from './types';

const theme = createTheme({
  palette: { primary: { main: '#1976d2' }, secondary: { main: '#dc004e' } },
  typography: { fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(',') }
});

function App() {
  const muiTheme = theme; // for useMediaQuery
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [staffToFilter, setStaffToFilter] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showInitials, setShowInitials] = useState<boolean>(true);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [calendarTheme, setCalendarTheme] = useState<CalendarTheme>(defaultCalendarTheme);
  const [themeSelectorOpen, setThemeSelectorOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>('');

  // localStorage에서 저장된 URL 불러오기
  useEffect(() => {
    const savedUrl = localStorage.getItem('googleSheetUrl');
    if (savedUrl) {
      setGoogleSheetUrl(savedUrl);
    }
  }, []);

  const getUpdateInterval = useCallback(() => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 10) return 10 * 60 * 1000;
    if (hour >= 11 && hour <= 13) return 30 * 60 * 1000;
    if (hour >= 14 && hour <= 18) return 60 * 60 * 1000;
    return 2 * 60 * 60 * 1000;
  }, []);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);
      const data = await getScheduleData();
      setScheduleData(data);
      setStaffToFilter(data.staffMembers.map(s => s.name));
      if (selectedChips.length === 0) setSelectedChips([]);
      setLastUpdate(new Date());
    } catch (error) {
      setError(error instanceof Error ? error.message : '스케줄 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedChips.length]);

  useEffect(() => {
    fetchData();
    const updateInterval = () => {
      const interval = getUpdateInterval();
      setTimeout(() => {
        fetchData();
        updateInterval();
      }, interval);
    };
    updateInterval();
    return () => {};
  }, [fetchData, getUpdateInterval]);

  useEffect(() => {
    if (scheduleData) {
      if (selectedChips.length === 0) setStaffToFilter(scheduleData.staffMembers.map(s => s.name));
      else setStaffToFilter(selectedChips);
    }
  }, [selectedChips, scheduleData]);

  useEffect(() => {
    if (scheduleData) {
      document.title = `높은뜻씨앗이되어 ${scheduleData.month}월 월간계획`;
    }
  }, [scheduleData]);

  const handleStaffSelect = (staffName: string) => {
    setSelectedChips(prev => prev.includes(staffName) ? prev.filter(name => name !== staffName) : [...prev, staffName]);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleManualRefresh = () => {
    fetchData(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ mb: 2, color: calendarTheme.cell.color }}>스케줄 데이터를 불러오는 중...</Typography>
        <Typography variant="body2" sx={{ color: calendarTheme.cell.color }}>Google Sheets에서 데이터를 가져오고 있습니다.</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>오류가 발생했습니다</Typography>
        <Typography variant="body1" sx={{ mb: 2, color: calendarTheme.cell.color }}>{error}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          페이지 새로고침
        </Button>
      </Box>
    );
  }

  if (!scheduleData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography sx={{ color: calendarTheme.cell.color }}>스케줄 데이터가 없습니다.</Typography>
      </Box>
    );
  }

  const { schedules, staffMembers, year, month } = scheduleData;
  const currentMonth = new Date(year, month - 1, 1);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: calendarTheme.table.background }}>
          <AppBar position="static" color="default" elevation={0} sx={{ 
            bgcolor: calendarTheme.name === '다크' ? calendarTheme.table.background : 'background.paper', 
            borderBottom: calendarTheme.name === '다크' ? `1.5px solid ${calendarTheme.cell.border}` : '1.5px solid #e0e0e0', 
            flexShrink: 0 
          }}>
            <Toolbar sx={{ pr: { xs: 0, sm: undefined } }}>
              <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 700, color: calendarTheme.cell.color }}>
                {isMobile ? `${month}월 계획` : `${year}년 계획`}
              </Typography>
              {/* Last Update Info */}
              {lastUpdate && (
                <Typography variant="caption" sx={{ mr: 2, display: { xs: 'none', sm: 'block' }, color: calendarTheme.cell.color }}>
                  마지막 업데이트: {lastUpdate.toLocaleTimeString()}
                </Typography>
              )}
              {/* 오른쪽 Chip 버튼 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1, pr: 2 }}>
                <IconButton 
                  color="inherit" 
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  sx={{ 
                    borderRadius: '16px',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  title="데이터 새로고침"
                >
                  <Refresh sx={{ 
                    fontSize: 18, 
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} />
                </IconButton>
                <Chip
                  icon={<Person sx={{ fontSize: 18 }} />}
                  label="이니셜"
                  color={showInitials ? 'primary' : 'default'}
                  variant={showInitials ? 'filled' : 'outlined'}
                  size="small"
                  sx={{
                    borderRadius: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: showInitials ? 2 : 0,
                    bgcolor: showInitials ? 'primary.main' : 'background.paper',
                    color: showInitials ? '#fff' : 'text.primary',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 4, bgcolor: 'primary.light' }
                  }}
                  onClick={() => setShowInitials(v => !v)}
                  title="이니셜 표시 토글"
                />
                <Chip
                  icon={<Palette sx={{ fontSize: 18 }} />}
                  label="테마"
                  color="primary"
                  variant={themeSelectorOpen ? 'filled' : 'outlined'}
                  size="small"
                  sx={{
                    borderRadius: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: themeSelectorOpen ? 2 : 0,
                    bgcolor: themeSelectorOpen ? 'primary.main' : 'background.paper',
                    color: themeSelectorOpen ? '#fff' : 'text.primary',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 4, bgcolor: 'primary.light' }
                  }}
                  onClick={() => setThemeSelectorOpen(true)}
                  title="테마 변경"
                />
                <Chip
                  icon={<Settings sx={{ fontSize: 18 }} />}
                  label="설정"
                  color="primary"
                  variant={settingsOpen ? 'filled' : 'outlined'}
                  size="small"
                  sx={{
                    borderRadius: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: settingsOpen ? 2 : 0,
                    bgcolor: settingsOpen ? 'primary.main' : 'background.paper',
                    color: settingsOpen ? '#fff' : 'text.primary',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 4, bgcolor: 'primary.light' }
                  }}
                  onClick={() => setSettingsOpen(true)}
                  title="설정"
                />
              </Box>
              <IconButton color="inherit" onClick={toggleFullscreen} sx={{ ml: 1, display: { xs: 'none', sm: 'flex' } }}>
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Toolbar>
          </AppBar>
          <Container 
            maxWidth={false} 
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              py: { xs: 0, sm: 2 }, 
              px: { xs: 0, sm: 2 }, 
              overflowY: 'auto',
              bgcolor: calendarTheme.table.background
            }}
          >
            <Collapse in={showStats}>
              <Box>
                <Statistics schedules={schedules} staffMembers={staffMembers} />
              </Box>
            </Collapse>
            <Collapse in={!showStats}>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h1" component="h2" sx={{ fontWeight: 700, fontSize: { md: '6rem' }, lineHeight: 1, color: calendarTheme.cell.color }}>
                    {format(currentMonth, 'M월')}
                  </Typography>
                </Box>
                <StaffFilter
                  staffMembers={staffMembers}
                  selectedStaff={selectedChips}
                  onStaffSelect={handleStaffSelect}
                  calendarTheme={calendarTheme}
                />
              </Box>
              <Collapse in={showFilter} sx={{ display: { xs: 'block', md: 'none' } }}>
                <StaffFilter
                  staffMembers={staffMembers}
                  selectedStaff={selectedChips}
                  onStaffSelect={handleStaffSelect}
                  calendarTheme={calendarTheme}
                />
              </Collapse>
              <Box sx={{ width: '100%' }}>
                <ScheduleCalendar
                  schedules={schedules}
                  year={year}
                  month={month}
                  staffMembers={staffMembers}
                  staffToFilter={staffToFilter}
                  showInitials={showInitials}
                  calendarTheme={calendarTheme}
                />
              </Box>
            </Collapse>
          </Container>
        </Box>
        <ThemeSelector
          currentTheme={calendarTheme}
          onThemeChange={theme => { setCalendarTheme(theme); setThemeSelectorOpen(false); }}
          open={themeSelectorOpen}
          onClose={() => setThemeSelectorOpen(false)}
        />
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>구글 스프레드시트 URL 설정</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              구글 스프레드시트를 공개하려면:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, pl: 2 }}>
              1. 구글 스프레드시트에서 <strong>파일</strong> → <strong>공유</strong> → <strong>전체문서</strong> 클릭
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, pl: 2 }}>
              2. <strong>웹페이지로</strong> 선택 후 <strong>게시 시작</strong> 버튼 클릭
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
              3. 생성된 공개 URL을 아래에 입력하세요
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              id="googleSheetUrl"
              label="구글 스프레드시트 URL"
              type="url"
              fullWidth
              value={googleSheetUrl}
              onChange={(e) => setGoogleSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=html"
              helperText="웹에 게시된 공개 URL을 입력하세요"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)} color="primary">
              취소
            </Button>
            <Button onClick={() => {
              // Handle the submission of the Google Sheet URL
              if (googleSheetUrl.trim()) {
                const success = setSheetUrl(googleSheetUrl);
                if (success) {
                  localStorage.setItem('googleSheetUrl', googleSheetUrl);
                  // 새로운 URL로 데이터 다시 가져오기
                  fetchData(true);
                  setSettingsOpen(false);
                } else {
                  alert('올바른 구글 스프레드시트 URL을 입력해주세요.');
                }
              } else {
                alert('URL을 입력해주세요.');
              }
            }} color="primary">
              저장
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;