import React, { useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Collapse,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ScheduleItem, StaffMember } from '../types';

interface StatisticsProps {
  schedules: ScheduleItem[];
  staffMembers: StaffMember[];
}

const Statistics: React.FC<StatisticsProps> = ({ schedules, staffMembers }) => {
  // 토글 상태 관리
  const [showMeditationDetails, setShowMeditationDetails] = useState(false);
  const [showCoffeeDetails, setShowCoffeeDetails] = useState(false);
  const [showVacationDetails, setShowVacationDetails] = useState(false);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [showVisitationDetails, setShowVisitationDetails] = useState(false);
  const [selectedVisitationStaff, setSelectedVisitationStaff] = useState<string | null>(null);
  const [selectedVacationStaff, setSelectedVacationStaff] = useState<string | null>(null);
  const [selectedCoffeeStaff, setSelectedCoffeeStaff] = useState<string | null>(null);
  const [selectedMeditationStaff, setSelectedMeditationStaff] = useState<string | null>(null);

  // 휴무 통계 (반차, off, 연차 등)
  const getVacationStatistics = () => {
    const vacationStats: { [key: string]: { [key: string]: number } } = {};
    const vacationDetails: { staffName: string; date: string; vacationType: string; content: string }[] = [];
    const fullTimeMinisters = ['박일섭', '이은철', '김선민', '서동진', '공선희', '박기태'];
    
    schedules.forEach(schedule => {
      // 6월 2일 특별 처리: workSchedule 텍스트에 '업무'가 포함된 경우 전임교역자 대체휴무 1일 추가
      if (schedule.date === '2025-06-02' && schedule.workSchedule.includes('업무')) {
        fullTimeMinisters.forEach(minister => {
          if (!vacationStats[minister]) vacationStats[minister] = {};
          vacationStats[minister]['대체휴무'] = (vacationStats[minister]['대체휴무'] || 0) + 1;
          vacationDetails.push({
            staffName: minister,
            date: schedule.date,
            vacationType: '대체휴무',
            content: '업무일 대체휴무'
          });
        });
      }
      
      if (schedule.workSchedule) {
        const workItems = schedule.workSchedule.split('<br>').map(w => w.trim()).filter(w => w);
        const staffOnSchedule = schedule.workScheduleStaff || [];
        
        workItems.forEach((item, index) => {
          const cleanItem = item.replace(/<[^>]*>/g, '');
          
          if (cleanItem.includes('반차') || cleanItem.includes('off') || cleanItem.includes('연차') || 
              cleanItem.includes('휴가') || cleanItem.includes('병가') || cleanItem.includes('공가') ||
              cleanItem.includes('대체휴무') || cleanItem.includes('휴무')) {
            
            let staffName = '기타';
            
            // 1. 텍스트에 이름이 명시적으로 포함된 경우 (예: '박부환 off')
            const explicitNameMatch = staffMembers.find(staff => cleanItem.includes(staff.name));
            
            if (explicitNameMatch) {
              staffName = explicitNameMatch.name;
            } else {
              // 2. 이니셜 매칭 (정확한 단어 경계 사용)
              const initialMatch = staffMembers.find(staff => 
                staff.shortName && new RegExp(`(^|[^가-힣])${staff.shortName}([^가-힣]|$)`).test(cleanItem)
              );
              
              if (initialMatch) {
                staffName = initialMatch.name;
                console.log(`이니셜 매칭 성공: "${cleanItem}" → ${initialMatch.name} (이니셜: ${initialMatch.shortName})`);
              } else {
                // 3. 색상 매칭 (HTML 내 스타일)
                const colorMatch = staffMembers.find(staff => {
                  const colorHex = staff.color.replace('#', '');
                  const colorPatterns = [
                    `color:${staff.color}`,
                    `color: ${staff.color}`,
                    `color:${staff.color};`,
                    `color: ${staff.color};`,
                    `color:#${colorHex}`,
                    `color: #${colorHex}`,
                    `color:#${colorHex.toLowerCase()}`,
                    `color: #${colorHex.toLowerCase()}`,
                    `style="color:${staff.color}"`,
                    `style="color: ${staff.color}"`,
                    `style="color:${staff.color};"`,
                    `style="color: ${staff.color};"`,
                    `style="color:#${colorHex}"`,
                    `style="color: #${colorHex}"`,
                    `background-color:${staff.color}`,
                    `background-color: ${staff.color}`,
                    `background-color:#${colorHex}`,
                    `background-color: #${colorHex}`,
                    `<span[^>]*color:${staff.color}[^>]*>`,
                    `<span[^>]*color: ${staff.color}[^>]*>`,
                    `<span[^>]*color:#${colorHex}[^>]*>`,
                    `<span[^>]*color: #${colorHex}[^>]*>`,
                    `color:${staff.color.toLowerCase()}`,
                    `color: ${staff.color.toLowerCase()}`,
                    `color:${staff.color.toUpperCase()}`,
                    `color: ${staff.color.toUpperCase()}`,
                  ];
                  return colorPatterns.some(pattern => item.toLowerCase().includes(pattern.toLowerCase()));
                });
                
                if (colorMatch) {
                  staffName = colorMatch.name;
                  console.log(`색상 매칭 성공: "${cleanItem}" → ${colorMatch.name} (색상: ${colorMatch.color})`);
                } else if (staffOnSchedule.length > 0) {
                  // 4. workScheduleStaff에 담당자가 지정된 경우
                  // 휴무 항목이 여러 개일 경우, 순서에 맞게 담당자를 매칭
                  staffName = staffOnSchedule[index] || staffOnSchedule[0];
                }
              }
            }

            // 휴무 유형 분류
            let vacationType = '기타';
            if (cleanItem.includes('반차')) vacationType = '반차';
            else if (cleanItem.includes('off')) vacationType = 'off';
            else if (cleanItem.includes('연차')) vacationType = '연차';
            else if (cleanItem.includes('휴가')) vacationType = '휴가';
            else if (cleanItem.includes('병가')) vacationType = '병가';
            else if (cleanItem.includes('공가')) vacationType = '공가';
            else if (cleanItem.includes('대체휴무')) vacationType = '대체휴무';
            else if (cleanItem.includes('휴무')) vacationType = '휴무';
            
            if (staffName !== '기타') {
              if (!vacationStats[staffName]) {
                vacationStats[staffName] = {};
              }
              // 반차는 0.5일로 계산
              const count = cleanItem.includes('반차') ? 0.5 : 1;
              vacationStats[staffName][vacationType] = (vacationStats[staffName][vacationType] || 0) + count;
              
              vacationDetails.push({
                staffName: staffName,
                date: schedule.date,
                vacationType: vacationType,
                content: cleanItem
              });
            }
          }
        });
      }
    });
    
    // 총 휴무일수 계산 (반차 포함, 실제 휴무일수)
    const totalVacationDays: { [key: string]: number } = {};
    Object.entries(vacationStats).forEach(([staffName, vacations]) => {
      totalVacationDays[staffName] = Object.entries(vacations)
        .reduce((sum, [type, count]) => {
          // count는 이미 올바른 값으로 계산됨 (반차는 0.5, 나머지는 1)
          return sum + count;
        }, 0);
    });
    
    // 막대그래프용 데이터로 변환 (총 휴무일수)
    const barChartData = Object.entries(totalVacationDays)
      .map(([staffName, totalDays]) => ({ staffName, totalDays }))
      .sort((a, b) => b.totalDays - a.totalDays);
    
    return {
      summary: barChartData,
      details: vacationDetails,
      byType: vacationStats
    };
  };

  // 직원별 매일씨앗묵상 통계 (풀네임, 일수)
  const getMeditationStatistics = () => {
    const meditationStats: { [key: string]: number } = {};
    const meditationDetails: { staffName: string; date: string; content: string }[] = [];
    
    schedules.forEach(schedule => {
      if (schedule.dailyMeditation) {
        const content = schedule.dailyMeditation;
        staffMembers.forEach(staff => {
          // 스태프 이름이나 이니셜이 포함되어 있는지 확인
          if (content.includes(staff.name) || (staff.shortName && content.includes(staff.shortName))) {
            meditationStats[staff.name] = (meditationStats[staff.name] || 0) + 1;
            meditationDetails.push({
              staffName: staff.name,
              date: schedule.date,
              content: content.replace(/<[^>]*>/g, '')
            });
          }
        });
      }
    });
    
    return {
      summary: Object.entries(meditationStats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      details: meditationDetails
    };
  };

  // 직원별 커피관리 통계 (풀네임, 일수)
  const getCoffeeStatistics = () => {
    const coffeeStats: { [key: string]: number } = {};
    const coffeeDetails: { staffName: string; date: string; content: string }[] = [];
    
    schedules.forEach(schedule => {
      if (schedule.coffeeManagement) {
        const content = schedule.coffeeManagement;
        staffMembers.forEach(staff => {
          // 스태프 이름이나 이니셜이 포함되어 있는지 확인
          if (content.includes(staff.name) || (staff.shortName && content.includes(staff.shortName))) {
            coffeeStats[staff.name] = (coffeeStats[staff.name] || 0) + 1;
            coffeeDetails.push({
              staffName: staff.name,
              date: schedule.date,
              content: content.replace(/<[^>]*>/g, '')
            });
          }
        });
      }
    });
    
    return {
      summary: Object.entries(coffeeStats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      details: coffeeDetails
    };
  };

  // 차량/기타 사용 통계 (차량번호별, 장소별)
  const getVehicleAndOtherStatistics = () => {
    const vehicleStats: { [key: string]: number } = {};
    const locationStats: { [key: string]: number } = {};
    const vehicleDetails: { date: string; vehicle: string; location: string; purpose: string; staffName: string }[] = [];
    
    schedules.forEach(schedule => {
      if (schedule.vehicleAndOther) {
        const content = schedule.vehicleAndOther;
        
        // 차량 번호 패턴 찾기 (예: 12가3456, 123가4567 등)
        const vehiclePattern = /[0-9]{2,3}[가-힣][0-9]{4}/g;
        const vehicles = content.match(vehiclePattern) || [];
        
        // 사용자 찾기
        let staffName = '미상';
        staffMembers.forEach(staff => {
          if (content.includes(staff.name) || (staff.shortName && content.includes(staff.shortName))) {
            staffName = staff.name;
          }
        });
        
        vehicles.forEach(vehicle => {
          vehicleStats[vehicle] = (vehicleStats[vehicle] || 0) + 1;
        });
        
        // 장소 패턴 찾기 (예: 서울, 부산, 대구 등)
        const locationPattern = /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/g;
        const locations = content.match(locationPattern) || [];
        
        locations.forEach(location => {
          locationStats[location] = (locationStats[location] || 0) + 1;
        });
        
        // 상세 정보 수집
        if (vehicles.length > 0 || locations.length > 0) {
          vehicleDetails.push({
            date: schedule.date,
            vehicle: vehicles[0] || '미상',
            location: locations[0] || '미상',
            purpose: content.replace(/<[^>]*>/g, '').substring(0, 50) + '...',
            staffName: staffName
          });
        }
      }
    });
    
    return {
      vehicles: Object.entries(vehicleStats).map(([vehicle, count]) => ({ vehicle, count })),
      locations: Object.entries(locationStats).map(([location, count]) => ({ location, count })),
      details: vehicleDetails
    };
  };

  // 직원별 심방 통계 (풀네임, 횟수, 상세내역)
  const getVisitationStatistics = () => {
    const visitationStats: { [key: string]: number } = {};
    const visitationDetails: { staffName: string; date: string; content: string }[] = [];
    
    schedules.forEach(schedule => {
      // 일정(schedule) 셀에서만 분석
      if (schedule.schedule && schedule.scheduleStaff && schedule.scheduleStaff.length > 0) {
        const scheduleItems = schedule.schedule.split('<br>').map(s => s.trim()).filter(Boolean);
        
        scheduleItems.forEach(item => {
          const cleanItem = item.replace(/<[^>]*>/g, '');
          
          // 휴무 관련 키워드 제외
          const isVacation = ['off', '휴무', '반차', '연차', '휴가', '병가', '공가', '대체휴무'].some(keyword => cleanItem.includes(keyword));
          
          // 설교(박일섭)와 인도(이은철) 제외
          const isPersonalEvent = cleanItem.includes('설교') || cleanItem.includes('인도');
          
          // 심방/행사로 간주할 수 있는 내용만 처리
          if (cleanItem.length > 0 && !isVacation && !isPersonalEvent) {
            // 1. 일정 셀에서 사용된 색상 추출
            const colorRegex = /color\s*:\s*(#[0-9a-fA-F]{6})/g;
            const foundColors: string[] = [];
            let match;
            while ((match = colorRegex.exec(item)) !== null) {
              foundColors.push(match[1].toLowerCase());
            }
            if (foundColors.length > 0) {
              console.log('=== 일정 셀 색상 추출 ===');
              console.log('일정 내용:', cleanItem);
              console.log('HTML:', item);
              console.log('추출된 색상:', foundColors);
              staffMembers.forEach(staff => {
                if (foundColors.includes(staff.color.toLowerCase())) {
                  console.log(`→ ${staff.name} (색상: ${staff.color})와 매칭됨`);
                }
              });
            }
            
            // 해당 일정의 담당자들 중에서만 심방 통계 집계
            schedule.scheduleStaff?.forEach(staffName => {
              const staffMember = staffMembers.find(staff => staff.name === staffName);
              if (staffMember) {
                // 이름 매칭
                const hasStaffName = cleanItem.includes(staffMember.name);
                // 이니셜 매칭 (정확한 단어 경계)
                const hasStaffInitial = staffMember.shortName && new RegExp(`(^|[^가-힣])${staffMember.shortName}([^가-힣]|$)`).test(cleanItem);
                // 색상 매칭 (HTML 내 스타일)
                const colorHex = staffMember.color.replace('#', '');
                const colorPatterns = [
                  `color:${staffMember.color}`,
                  `color: ${staffMember.color}`,
                  `color:${staffMember.color};`,
                  `color: ${staffMember.color};`,
                  `color:#${colorHex}`,
                  `color: #${colorHex}`,
                  `color:#${colorHex.toLowerCase()}`,
                  `color: #${colorHex.toLowerCase()}`,
                  `style="color:${staffMember.color}"`,
                  `style="color: ${staffMember.color}"`,
                  `style="color:${staffMember.color};"`,
                  `style="color: ${staffMember.color};"`,
                  `style="color:#${colorHex}"`,
                  `style="color: #${colorHex}"`,
                  `background-color:${staffMember.color}`,
                  `background-color: ${staffMember.color}`,
                  `background-color:#${colorHex}`,
                  `background-color: #${colorHex}`,
                  `<span[^>]*color:${staffMember.color}[^>]*>`,
                  `<span[^>]*color: ${staffMember.color}[^>]*>`,
                  `<span[^>]*color:#${colorHex}[^>]*>`,
                  `<span[^>]*color: #${colorHex}[^>]*>`,
                  `color:${staffMember.color.toLowerCase()}`,
                  `color: ${staffMember.color.toLowerCase()}`,
                  `color:${staffMember.color.toUpperCase()}`,
                  `color: ${staffMember.color.toUpperCase()}`,
                ];
                const hasStaffColor = colorPatterns.some(pattern => item.toLowerCase().includes(pattern.toLowerCase()));
                
                if (hasStaffName || hasStaffInitial || hasStaffColor) {
                  visitationStats[staffName] = (visitationStats[staffName] || 0) + 1;
                  visitationDetails.push({
                    staffName: staffName,
                    date: schedule.date,
                    content: cleanItem
                  });
                }
              }
            });
          }
        });
      }
    });
    
    return {
      summary: Object.entries(visitationStats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      details: visitationDetails
    };
  };

  const vacationStats = getVacationStatistics();
  const meditationStats = getMeditationStatistics();
  const coffeeStats = getCoffeeStatistics();
  const vehicleStats = getVehicleAndOtherStatistics();
  const visitationStats = getVisitationStatistics();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        📊 월간 통계
      </Typography>
      
      <Grid container spacing={3}>
        {/* 심방 통계 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                🎉 행사/일정/심방 통계
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={visitationStats.summary}
                  onClick={(data) => {
                    if (data && data.activePayload && data.activePayload[0]) {
                      const staffName = data.activePayload[0].payload.name;
                      setSelectedVisitationStaff(selectedVisitationStaff === staffName ? null : staffName);
                      setShowVisitationDetails(true);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value}회`, '심방 횟수']} />
                  <Bar 
                    dataKey="count" 
                    fill="#ff7300"
                    style={{ cursor: 'pointer' }}
                  />
                </BarChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => {
                    setShowVisitationDetails(!showVisitationDetails);
                    if (!showVisitationDetails) {
                      setSelectedVisitationStaff(null);
                    }
                  }}
                  sx={{ mb: 1 }}
                >
                  {showVisitationDetails ? '상세내역 숨기기' : '상세내역 보기'}
                </Button>
                {selectedVisitationStaff && showVisitationDetails && (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => setSelectedVisitationStaff(null)}
                    sx={{ mb: 1, ml: 1 }}
                  >
                    전체 보기
                  </Button>
                )}
                <Collapse in={showVisitationDetails}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    상세 내역:
                    {selectedVisitationStaff && ` (${selectedVisitationStaff}만)`}
                  </Typography>
                  <List dense>
                    {(selectedVisitationStaff 
                      ? visitationStats.details.filter(detail => detail.staffName === selectedVisitationStaff)
                      : visitationStats.details
                    ).map((detail, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemText 
                          primary={`${detail.date}: ${detail.staffName}`}
                          secondary={detail.content}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 매일씨앗묵상 통계 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                🌱 매일씨앗묵상 통계
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={meditationStats.summary}
                  onClick={(data) => {
                    if (data && data.activePayload && data.activePayload[0]) {
                      const staffName = data.activePayload[0].payload.name;
                      setSelectedMeditationStaff(selectedMeditationStaff === staffName ? null : staffName);
                      setShowMeditationDetails(true);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis allowDecimals={false} domain={[0, 'dataMax + 1']} />
                  <Tooltip formatter={(value) => [`${value}일`, '담당일수']} />
                  <Bar 
                    dataKey="count" 
                    fill="#8bc34a"
                    style={{ cursor: 'pointer' }}
                  />
                </BarChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => {
                    setShowMeditationDetails(!showMeditationDetails);
                    if (!showMeditationDetails) {
                      setSelectedMeditationStaff(null);
                    }
                  }}
                  sx={{ mb: 1 }}
                >
                  {showMeditationDetails ? '상세내역 숨기기' : '상세내역 보기'}
                </Button>
                {selectedMeditationStaff && showMeditationDetails && (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => setSelectedMeditationStaff(null)}
                    sx={{ mb: 1, ml: 1 }}
                  >
                    전체 보기
                  </Button>
                )}
                <Collapse in={showMeditationDetails}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    상세 내역:
                    {selectedMeditationStaff && ` (${selectedMeditationStaff}만)`}
                  </Typography>
                  <List dense>
                    {(selectedMeditationStaff 
                      ? meditationStats.details.filter(detail => detail.staffName === selectedMeditationStaff)
                      : meditationStats.details
                    ).map((detail, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemText 
                          primary={`${detail.date}: ${detail.staffName}`}
                          secondary={detail.content}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 커피관리 통계 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                ☕ 커피관리 통계
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={coffeeStats.summary}
                  onClick={(data) => {
                    if (data && data.activePayload && data.activePayload[0]) {
                      const staffName = data.activePayload[0].payload.name;
                      setSelectedCoffeeStaff(selectedCoffeeStaff === staffName ? null : staffName);
                      setShowCoffeeDetails(true);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis allowDecimals={false} domain={[0, 'dataMax + 1']} />
                  <Tooltip formatter={(value) => [`${value}일`, '담당일수']} />
                  <Bar 
                    dataKey="count" 
                    fill="#82ca9d"
                    style={{ cursor: 'pointer' }}
                  />
                </BarChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => {
                    setShowCoffeeDetails(!showCoffeeDetails);
                    if (!showCoffeeDetails) {
                      setSelectedCoffeeStaff(null);
                    }
                  }}
                  sx={{ mb: 1 }}
                >
                  {showCoffeeDetails ? '상세내역 숨기기' : '상세내역 보기'}
                </Button>
                {selectedCoffeeStaff && showCoffeeDetails && (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => setSelectedCoffeeStaff(null)}
                    sx={{ mb: 1, ml: 1 }}
                  >
                    전체 보기
                  </Button>
                )}
                <Collapse in={showCoffeeDetails}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    상세 내역:
                    {selectedCoffeeStaff && ` (${selectedCoffeeStaff}만)`}
                  </Typography>
                  <List dense>
                    {(selectedCoffeeStaff 
                      ? coffeeStats.details.filter(detail => detail.staffName === selectedCoffeeStaff)
                      : coffeeStats.details
                    ).map((detail, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemText 
                          primary={`${detail.date}: ${detail.staffName}`}
                          secondary={detail.content}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 휴무 통계 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                🏖️ 휴무 통계
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={vacationStats.summary}
                  onClick={(data) => {
                    if (data && data.activePayload && data.activePayload[0]) {
                      const staffName = data.activePayload[0].payload.staffName;
                      setSelectedVacationStaff(selectedVacationStaff === staffName ? null : staffName);
                      setShowVacationDetails(true);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="staffName" angle={-45} textAnchor="end" height={80} />
                  <YAxis allowDecimals={true} tickCount={6} domain={[0, 'dataMax + 0.5']} />
                  <Tooltip formatter={(value) => [`${value}일`, '총 휴무일수']} />
                  <Bar 
                    dataKey="totalDays" 
                    fill="#8884d8"
                    style={{ cursor: 'pointer' }}
                  />
                </BarChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => {
                    setShowVacationDetails(!showVacationDetails);
                    if (!showVacationDetails) {
                      setSelectedVacationStaff(null);
                    }
                  }}
                  sx={{ mb: 1 }}
                >
                  {showVacationDetails ? '상세내역 숨기기' : '상세내역 보기'}
                </Button>
                {selectedVacationStaff && showVacationDetails && (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => setSelectedVacationStaff(null)}
                    sx={{ mb: 1, ml: 1 }}
                  >
                    전체 보기
                  </Button>
                )}
                <Collapse in={showVacationDetails}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    상세 내역:
                    {selectedVacationStaff && ` (${selectedVacationStaff}만)`}
                  </Typography>
                  <List dense>
                    {(selectedVacationStaff 
                      ? vacationStats.details.filter(detail => detail.staffName === selectedVacationStaff)
                      : vacationStats.details
                    ).map((detail, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemText 
                          primary={`${detail.date}: ${detail.staffName} (${detail.vacationType})`}
                          secondary={detail.content}
                        />
                      </ListItem>
                    ))}
                  </List>
                  {selectedVacationStaff && vacationStats.byType[selectedVacationStaff] && (
                    <>
                      <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ mt: 2 }}>
                        휴무 종류별 내역:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {Object.entries(vacationStats.byType[selectedVacationStaff]).map(([type, count]) => (
                          <Chip 
                            key={type} 
                            label={`${type}: ${count}일`} 
                            color="primary" 
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </Collapse>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 차량 사용 통계 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                🚗 차량 사용 통계
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">차량별 사용 횟수:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {vehicleStats.vehicles.map((item) => (
                    <Chip 
                      key={item.vehicle} 
                      label={`${item.vehicle}: ${item.count}회`} 
                      color="secondary" 
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setShowVehicleDetails(!showVehicleDetails)}
                sx={{ mb: 1 }}
              >
                {showVehicleDetails ? '상세내역 숨기기' : '상세내역 보기'}
              </Button>
              <Collapse in={showVehicleDetails}>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">차량별 사용 상세 내역:</Typography>
                  <List dense>
                    {vehicleStats.details.map((detail, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemText 
                          primary={`${detail.date}: ${detail.vehicle} (${detail.staffName})`}
                          secondary={`${detail.location} - ${detail.purpose}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* 요약 정보 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                📋 요약 정보
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {schedules.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" fontWeight="bold">
                      총 일정 수
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary" fontWeight="bold">
                      {staffMembers.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" fontWeight="bold">
                      총 직원 수
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {meditationStats.summary.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" fontWeight="bold">
                      묵상 참여자
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {vehicleStats.vehicles.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" fontWeight="bold">
                      사용 차량 수
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistics; 