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
import { getScheduleData, setGoogleSheetUrl as setSheetUrl, getCurrentGoogleSheetUrl, getSheetTabList } from './services/googleSheetService';
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
  const [settingsOpen, setSettingsOpen] = useState<boolean>(() => {
    console.log('=== useState 초기화 함수 실행 ===');
    const initialValue = false;
    console.log('초기값 설정:', initialValue);
    console.log('=== useState 초기화 함수 끝 ===');
    return initialValue;
  });
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>('');
  const [sheetTabs, setSheetTabs] = useState<{ name: string; gid: string }[]>([]);
  const [sheetTabModalOpen, setSheetTabModalOpen] = useState(false);
  const [selectedSheetTab, setSelectedSheetTab] = useState<string>('');

  // 앱 시작 시 서버에서 구글시트 URL 불러오기
  useEffect(() => {
    fetch('/api/sheet-url')
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          setGoogleSheetUrl(data.url);
          setSheetUrl(data.url);
        }
      })
      .catch(err => {
        console.error('sheet-url fetch error:', err);
      });
  }, []);

  // settingsOpen 상태 변화 추적 (모든 변화를 로그로 출력)
  useEffect(() => {
    console.log('=== settingsOpen 상태 변화 감지 ===');
    console.log('settingsOpen 상태 변화:', settingsOpen);
    console.log('settingsOpen 타입:', typeof settingsOpen);
    console.log('변화 위치:', new Error().stack?.split('\n')[2]?.trim());
    console.log('=== 상태 변화 감지 끝 ===');
  }, [settingsOpen]);

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

  // URL 저장 버튼 클릭 시 서버에 저장
  const handleSaveGoogleSheetUrl = async () => {
    if (googleSheetUrl.trim()) {
      // 서버에 저장
      const res = await fetch('/api/sheet-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: googleSheetUrl }),
      });
      if (res.ok) {
        setSheetUrl(googleSheetUrl);
        handleSetSettingsOpen(false);
        setIsLoading(true);
        setError(null);
        try {
          const data = await getScheduleData();
          setScheduleData(data);
          setError(null);
        } catch (e: any) {
          setError(e.message || '스케줄 데이터를 불러오지 못했습니다.');
        } finally {
          setIsLoading(false);
        }
      } else {
        alert('서버에 URL저장을 실패했습니다.');
      }
    } else {
      alert('URL을 입력해주세요.');
    }
  };

  // setSettingsOpen 함수 래핑
  const handleSetSettingsOpen = (value: boolean) => {
    console.log('=== handleSetSettingsOpen 호출 ===');
    console.log('호출 위치:', new Error().stack?.split('\n')[2]?.trim());
    console.log('setSettingsOpen 호출됨:', value);
    console.log('호출 전 settingsOpen 값:', settingsOpen);
    setSettingsOpen(value);
    console.log('setSettingsOpen 호출 후 즉시 확인:', settingsOpen);
    console.log('=== handleSetSettingsOpen 끝 ===');
  };

  let mainContent = null;
  if (isLoading) {
    mainContent = (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ mb: 2, color: calendarTheme.cell.color }}>스케줄 데이터를 불러오는 중...</Typography>
        <Typography variant="body2" sx={{ color: calendarTheme.cell.color }}>Google Sheets에서 데이터를 가져오고 있습니다.</Typography>
      </Box>
    );
  } else if (error) {
    const isNoUrlError = error.includes('구글 시트 URL이 설정되지 않았습니다');
    mainContent = (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>오류가 발생했습니다</Typography>
        <Typography variant="body1" sx={{ mb: 2, color: calendarTheme.cell.color }}>{error}</Typography>
        {isNoUrlError ? (
          <Button variant="contained" onClick={() => handleSetSettingsOpen(true)}>
            구글 시트 URL 입력
          </Button>
        ) : (
          <Button variant="contained" onClick={() => window.location.reload()}>
            페이지 새로고침
          </Button>
        )}
      </Box>
    );
  } else if (!scheduleData) {
    mainContent = (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography sx={{ color: calendarTheme.cell.color }}>스케줄 데이터가 없습니다.</Typography>
      </Box>
    );
  }

  if (mainContent) {
    return (
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
          <CssBaseline />
          {mainContent}
          <Dialog open={settingsOpen} onClose={() => handleSetSettingsOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>구글 스프레드시트 URL 설정</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                파일 &gt; 공유 &gt; <strong>웹에 게시</strong> 메뉴를 선택 후<br />
                <strong>전체 문서</strong> 풀다운 메뉴를 눌러서 공유를 원하는 월을 선택하고,<br />
                오른쪽 풀다운 메뉴에서 <strong>웹페이지</strong>를 선택한 뒤<br />
                <strong>게시</strong> 버튼을 눌러서 나오는 주소를 복사해 아래 URL 입력창에 붙여넣으세요.<br />
                <br />
                예시: https://docs.google.com/spreadsheets/d/e/.../pubhtml?gid=518662115&single=true
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
                placeholder="https://docs.google.com/spreadsheets/d/e/.../pubhtml?gid=...&single=true"
                helperText="웹에 게시된 해당 월(시트) URL을 입력하세요"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleSetSettingsOpen(false)} color="primary">
                취소
              </Button>
              <Button onClick={handleSaveGoogleSheetUrl} color="primary">
                저장
              </Button>
            </DialogActions>
          </Dialog>
        </LocalizationProvider>
      </ThemeProvider>
    );
  }

  if (!scheduleData) return null;
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
                  onClick={() => {
                    console.log('설정 버튼 클릭됨');
                    handleSetSettingsOpen(true);
                  }}
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
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;