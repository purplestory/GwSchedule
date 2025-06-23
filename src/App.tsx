import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Container, Box, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, Button, Collapse } from '@mui/material';
import { CalendarMonth, BarChart, Menu, Fullscreen, FullscreenExit, Assessment, TextFormat, FilterList, Refresh } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { format } from 'date-fns';
import ScheduleCalendar from './components/ScheduleCalendar';
import Statistics from './components/Statistics';
import StaffFilter from './components/StaffFilter';
import { getScheduleData, ScheduleData } from './services/googleSheetService';
import { useTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: { primary: { main: '#1976d2' }, secondary: { main: '#dc004e' } },
  typography: { fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(',') }
});

function App() {
  const theme = useTheme();
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [staffToFilter, setStaffToFilter] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showStats, setShowStats] = useState(false);
  const [showInitials, setShowInitials] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getUpdateInterval = useCallback(() => {
    const hour = new Date().getHours();
    
    // 아침 출근 시간대 (7-10시): 10분마다
    if (hour >= 7 && hour <= 10) {
      return 10 * 60 * 1000; // 10분
    }
    
    // 점심 시간대 (11-13시): 30분마다
    if (hour >= 11 && hour <= 13) {
      return 30 * 60 * 1000; // 30분
    }
    
    // 오후 업무 시간대 (14-18시): 1시간마다
    if (hour >= 14 && hour <= 18) {
      return 60 * 60 * 1000; // 1시간
    }
    
    // 저녁 이후 (19시 이후): 2시간마다
    return 2 * 60 * 60 * 1000; // 2시간
  }, []);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      console.log('Fetching schedule data...');
      const data = await getScheduleData();
      console.log('Schedule data fetched successfully:', data);
      setScheduleData(data);
      setStaffToFilter(data.staffMembers.map(s => s.name));
      if (selectedChips.length === 0) {
        setSelectedChips([]);
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to fetch schedule data:", error);
      setError(error instanceof Error ? error.message : '스케줄 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedChips.length]);

  useEffect(() => {
    fetchData(); // 초기 로드
    
    // 동적 업데이트 간격 설정
    const updateInterval = () => {
      const interval = getUpdateInterval();
      console.log(`Next update in ${interval / 60000} minutes`);
      
      setTimeout(() => {
        console.log('Auto-refreshing data...');
        fetchData();
        updateInterval(); // 재귀적으로 다음 업데이트 설정
      }, interval);
    };
    
    updateInterval();
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      // cleanup logic if needed
    };
  }, [fetchData, getUpdateInterval]);

  useEffect(() => {
    if (scheduleData) {
      if (selectedChips.length === 0) {
        setStaffToFilter(scheduleData.staffMembers.map(s => s.name));
      } else {
        setStaffToFilter(selectedChips);
      }
    }
  }, [selectedChips, scheduleData]);

  // 페이지 타이틀 설정
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
        <Typography variant="h6" sx={{ mb: 2 }}>스케줄 데이터를 불러오는 중...</Typography>
        <Typography variant="body2" color="text.secondary">Google Sheets에서 데이터를 가져오고 있습니다.</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>오류가 발생했습니다</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>{error}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          페이지 새로고침
        </Button>
      </Box>
    );
  }

  if (!scheduleData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>스케줄 데이터가 없습니다.</Typography>
      </Box>
    );
  }

  const { schedules, staffMembers, year, month } = scheduleData;
  const currentMonth = new Date(year, month - 1, 1);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'background.paper', flexShrink: 0 }}>
            <Toolbar sx={{ pr: { xs: 0, sm: undefined } }}>
              <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 700 }}>
                {isMobile ? `${year}년도 ${month}월 계획` : `${year}년 월간 계획`}
              </Typography>
              
              {/* Last Update Info */}
              {lastUpdate && (
                <Typography variant="caption" color="text.secondary" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                  마지막 업데이트: {lastUpdate.toLocaleTimeString()}
                </Typography>
              )}
              
              {/* Mobile Icon Buttons Container */}
              <Box sx={{ 
                display: { xs: 'flex', sm: 'none' }, 
                alignItems: 'center', 
                gap: 0.5,
                ml: 'auto'
              }}>
                {/* Manual Refresh Button */}
                <IconButton 
                  color="inherit" 
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  size="small"
                  title="데이터 새로고침"
                >
                  <Refresh sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                </IconButton>

                {/* Filter Icon */}
                <IconButton 
                  color="inherit" 
                  onClick={() => setShowFilter(!showFilter)} 
                  size="small"
                  title="필터"
                >
                  <FilterList />
                </IconButton>

                {/* Initials Toggle */}
                <IconButton 
                  color="inherit"
                  onClick={() => setShowInitials(prev => !prev)} 
                  size="small"
                  title={showInitials ? '이름 보기' : '이니셜 보기'}
                >
                  <TextFormat />
                </IconButton>
                
                {/* Stats Toggle */}
                <IconButton 
                  color="inherit"
                  onClick={() => setShowStats(!showStats)} 
                  size="small"
                  title={showStats ? '달력 보기' : '통계 보기'}
                >
                  <Assessment />
                </IconButton>
              </Box>

              {/* Desktop Buttons */}
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
                {/* Manual Refresh Button */}
                <IconButton 
                  color="inherit" 
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  sx={{ mr: 1 }}
                  title="데이터 새로고침"
                >
                  <Refresh sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                </IconButton>

                {/* Initials Toggle */}
                <Button variant="outlined" startIcon={<TextFormat />} onClick={() => setShowInitials(prev => !prev)} sx={{ mr: 1 }}>
                  {showInitials ? '이름 보기' : '이니셜 보기'}
                </Button>
                
                {/* Stats Toggle */}
                <Button variant="outlined" startIcon={<Assessment />} onClick={() => setShowStats(!showStats)} sx={{ mr: 1 }}>
                  {showStats ? '달력 보기' : '통계 보기'}
                </Button>

                {/* Fullscreen Toggle */}
                <IconButton color="inherit" onClick={toggleFullscreen}>
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Box>
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
              overflowY: 'auto'
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
                  <Typography variant="h1" component="h2" sx={{ fontWeight: 700, fontSize: { md: '6rem' }, lineHeight: 1, color: 'text.primary' }}>
                    {format(currentMonth, 'M월')}
                  </Typography>
                </Box>
                <StaffFilter
                  staffMembers={staffMembers}
                  selectedStaff={selectedChips}
                  onStaffSelect={handleStaffSelect}
                />
              </Box>
              
              <Collapse in={showFilter} sx={{ display: { xs: 'block', md: 'none' } }}>
                <StaffFilter
                  staffMembers={staffMembers}
                  selectedStaff={selectedChips}
                  onStaffSelect={handleStaffSelect}
                />
              </Collapse>

              <ScheduleCalendar
                schedules={schedules}
                year={year}
                month={month}
                staffMembers={staffMembers}
                staffToFilter={staffToFilter}
                showInitials={showInitials}
              />
            </Collapse>
          </Container>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App; 