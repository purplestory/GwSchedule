import React from 'react';
import { Paper, Typography, useTheme, useMediaQuery } from '@mui/material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ScheduleItem, StaffMember } from '../types';
import { CalendarTheme } from '../theme';

// --- Helper: 동적으로 행 개수 계산 ---
function getCalendarRowCount(weeks: Date[][], scheduleCategories: any[]) {
  return 1 + 1 + weeks.length * (1 + scheduleCategories.length);
}

const convertContent = (content: string, staffMembers: StaffMember[], selectedStaff: string[] = [], showInitials: boolean, isMobile: boolean) => {
    let result = content;
    
    // 모바일에서 특정 패턴에만 강제 줄바꿈 추가
    if (isMobile) {
      // 긴 텍스트에서 괄호 앞에 줄바꿈 (예: "선교부나들이(석)")
      result = result.replace(/([가-힣]{4,})\(/g, '$1<br>(');
      // 특정 패턴에서 줄바꿈 (예: "나들이(석)")
      result = result.replace(/(나들이)\(/g, '$1<br>(');
    }
    
    const cssClassToColor: { [key: string]: string } = {
      's9': '#85200c', 's13': '#85200c', 's10': '#bf9000', 's17': '#bf9000', 's15': '#bf9000', 's16': '#6aa84f', 's12': '#9900ff', 's14': '#0000ff', 's18': '#674ea7',
    };
    
    Object.entries(cssClassToColor).forEach(([cssClass, color]) => {
      const flexiblePattern = new RegExp(`class="[^"]*${cssClass}[^"]*"`, 'g');
      result = result.replace(flexiblePattern, `style="color: ${color}; font-weight: bold; font-size: ${isMobile ? '0.35rem' : '0.8rem'};"`);
    });
    
    result = result.replace(/#00ffff/g, '#008080');
    result = result.replace(/color:\s*#000000/g, 'color: #2c3e50');

    staffMembers.forEach(staff => {
      if (staff.name) {
        const namePattern = new RegExp(staff.name, 'g');
        
        let replacementHtml: string;
        const fontSize = isMobile ? '0.35rem' : '0.8rem';
        const fontWeight = 'bold';
        
        if (showInitials) {
          if (!staff.shortName) return;
          
          const isSelected = selectedStaff.includes(staff.name);
          const chipSize = isMobile ? '12px' : '18px';
          const chipMargin = '1px';
          const chipShadow = isMobile ? '' : 'box-shadow: 0 1px 2px rgba(0,0,0,0.2);';
          
          replacementHtml = isSelected 
            ? `<span style="display: inline-flex; align-items: center; justify-content: center; width: ${chipSize}; height: ${chipSize}; background-color: ${staff.color}; color: white; border-radius: 50%; font-size: ${fontSize}; font-weight: ${fontWeight}; margin: ${chipMargin}; ${chipShadow}">${staff.shortName}</span>`
            : `<span style="display: inline-flex; align-items: center; justify-content: center; width: ${chipSize}; height: ${chipSize}; background-color: #e0e0e0; color: #666; border-radius: 50%; font-size: ${fontSize}; font-weight: ${fontWeight}; margin: ${chipMargin}; opacity: 0.7; ${chipShadow}">${staff.shortName}</span>`;
        } else {
          const isSelected = selectedStaff.includes(staff.name);
          replacementHtml = isSelected 
            ? `<span style="color: ${staff.color}; font-weight: ${fontWeight}; font-size: ${fontSize};">${staff.name}</span>`
            : `<span style="color: #666; font-weight: ${fontWeight}; font-size: ${fontSize}; opacity: 0.7;">${staff.name}</span>`;
        }
        
        result = result.replace(namePattern, replacementHtml);
      }
      
      if (staff.shortName && staff.shortName.trim() !== '') {
        let replacementHtml: string;
        const fontSize = isMobile ? '0.35rem' : '0.8rem';
        const fontWeight = 'bold';
        
        if (showInitials) {
          const chipSize = isMobile ? '12px' : '18px';
          const chipMargin = '1px';
          const chipShadow = isMobile ? '' : 'box-shadow: 0 1px 2px rgba(0,0,0,0.2);';
          
          const isSelected = selectedStaff.includes(staff.name);
          replacementHtml = isSelected 
            ? `<span style="display: inline-flex; align-items: center; justify-content: center; width: ${chipSize}; height: ${chipSize}; background-color: ${staff.color}; color: white; border-radius: 50%; font-size: ${fontSize}; font-weight: ${fontWeight}; margin: ${chipMargin}; ${chipShadow}">${staff.shortName}</span>`
            : `<span style="display: inline-flex; align-items: center; justify-content: center; width: ${chipSize}; height: ${chipSize}; background-color: #e0e0e0; color: #666; border-radius: 50%; font-size: ${fontSize}; font-weight: ${fontWeight}; margin: ${chipMargin}; opacity: 0.7; ${chipShadow}">${staff.shortName}</span>`;
        } else {
          const isSelected = selectedStaff.includes(staff.name);
          replacementHtml = isSelected 
            ? `<span style="color: ${staff.color}; font-weight: ${fontWeight}; font-size: ${fontSize};">${staff.name}</span>`
            : `<span style="color: #666; font-weight: ${fontWeight}; font-size: ${fontSize}; opacity: 0.7;">${staff.name}</span>`;
        }
        const initialPattern = new RegExp(`(^|[^가-힣])(${staff.shortName})([^가-힣]|$)`, 'g');
        result = result.replace(initialPattern, `$1${replacementHtml}$3`);
      }
    });
    
    if (showInitials) {
      result = result.replace(/<\/span>, <span/g, '</span> <span');
    }
  
  return result;
};

const extractSelectedStaffContent = (content: string, staffMembers: StaffMember[], selectedStaff: string[]) => {
  if (!content || selectedStaff.length === 0) return content;
  
  const selectedStaffInfo = selectedStaff.map(staffName => {
    const staff = staffMembers.find(s => s.name === staffName);
    return staff ? { name: staff.name, shortName: staff.shortName, color: staff.color } : null;
  }).filter(info => info !== null);
  
  const lines = content.split('<br>');
  const selectedParts: string[] = [];
  
  lines.forEach(line => {
    if (!line.trim()) return;
    
    const hasSelectedStaff = selectedStaffInfo.some(staff => {
      if (!staff) return false;
      const hasName = line.includes(staff.name);
      const hasShortName = staff.shortName && new RegExp(`([^가-힣]|^)${staff.shortName}([^가-힣]|$)`).test(line);
      const colorHex = staff.color.replace('#', '');
      const colorPatterns = [ `color:${staff.color}`, `color:#${colorHex}` ];
      const hasColor = colorPatterns.some(pattern => line.toLowerCase().includes(pattern.toLowerCase()));
      return hasName || hasShortName || hasColor;
    });
    
    if (hasSelectedStaff) {
      selectedParts.push(line);
    }
  });
  
  return selectedParts.join('<br>');
};

// --- Component ---
interface ScheduleCalendarProps {
  schedules: ScheduleItem[];
  year: number;
  month: number;
  staffMembers: StaffMember[];
  staffToFilter?: string[];
  showInitials: boolean;
  calendarTheme?: CalendarTheme;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  schedules,
  year,
  month,
  staffMembers,
  staffToFilter = [],
  showInitials,
  calendarTheme,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const is1280x2048Portrait = useMediaQuery('(min-width:1279px) and (max-width:1281px) and (min-height:2047px) and (max-height:2049px) and (orientation: portrait)');
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });
  const weeks: Date[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }
  const dayHeaders = ['주일', '월', '화', '수', '목', '금', '토'];
  const holidays = ['2025-06-06', '2025-06-03'];
  const scheduleCategories: { key: keyof ScheduleItem; label: string, mobileLabel?: string, bgColor?: string }[] = [
    { key: 'schedule', label: '일정', bgColor: calendarTheme?.categoryLabels.schedule },
    { key: 'dailyMeditation', label: '매일씨앗묵상', mobileLabel: '묵상', bgColor: calendarTheme?.categoryLabels.dailyMeditation },
    { key: 'coffeeManagement', label: '커피관리', mobileLabel: '커피', bgColor: calendarTheme?.categoryLabels.coffeeManagement },
    { key: 'workSchedule', label: '근무', bgColor: calendarTheme?.categoryLabels.workSchedule },
    { key: 'vehicleAndOther', label: '차량/기타', mobileLabel: '기타', bgColor: calendarTheme?.categoryLabels.vehicleAndOther },
  ];
  
  const renderCellContent = (daySchedules: ScheduleItem[], categoryKey: keyof ScheduleItem) => {
    if (!daySchedules.length) return null;
    const schedule = daySchedules[0];

    const content = schedule[categoryKey] as string;

    if (!content) return null;

    if (staffToFilter.length === 0 || staffToFilter.length === staffMembers.length) {
      const formattedContent = convertContent(content, staffMembers, staffToFilter, showInitials, isMobile);
      return (
        <Typography 
          variant="body1"
          fontWeight="bold"
          dangerouslySetInnerHTML={{ __html: formattedContent.replace(/\n/g, '<br />') }}
          sx={isMobile ? {
            width: '100%',
            textAlign: 'center',
            fontSize: '0.4rem',
            lineHeight: 1.6,
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            minWidth: 0,
          } : {
            width: '100%',
            textAlign: 'center',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: { xs: 5, sm: 'unset' },
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        />
      );
    }

    const filteredContent = extractSelectedStaffContent(content, staffMembers, staffToFilter);
    if (!filteredContent || filteredContent.trim() === '') {
      return null;
    }
    
    const formattedContent = convertContent(filteredContent, staffMembers, staffToFilter, showInitials, isMobile);
    
    return (
      <Typography 
        variant="body1"
        fontWeight="bold"
        dangerouslySetInnerHTML={{ __html: formattedContent.replace(/\n/g, '<br />') }}
        sx={isMobile ? {
          width: '100%',
          textAlign: 'center',
          fontSize: '0.4rem',
          lineHeight: 1.6,
          whiteSpace: 'normal',
          overflowWrap: 'break-word',
          minWidth: 0,
        } : {
          width: '100%',
          textAlign: 'center',
          fontSize: '0.8rem',
          lineHeight: 1.6,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: { xs: 5, sm: 'unset' },
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      />
    );
  };

  // --- table 스타일 ---
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'auto',
    background: calendarTheme?.table.background || '#fff',
    fontSize: isMobile ? '0.4rem' : (calendarTheme?.table.fontSize || '0.8rem'),
  };
  const thStyle: React.CSSProperties = {
    border: isMobile ? `1px solid ${calendarTheme?.header.border || '#999'}` : `1px solid ${calendarTheme?.header.border || '#000'}`,
    background: calendarTheme?.header.background || '#c8e6c9',
    fontWeight: calendarTheme?.header.fontWeight || 900,
    textAlign: 'center',
    padding: isMobile ? '2px' : '6px',
    fontSize: isMobile ? '0.4rem' : (calendarTheme?.table.fontSize || '0.8rem'),
    whiteSpace: 'nowrap',
    height: isMobile ? '30px' : '40px',
    color: calendarTheme?.header.color || '#000',
  };
  const dateThStyle: React.CSSProperties = {
    ...thStyle,
    background: calendarTheme?.dateHeader.background || '#f5f5f5',
    border: isMobile ? `1px solid ${calendarTheme?.dateHeader.border || '#999'}` : `1px solid ${calendarTheme?.dateHeader.border || '#000'}`,
    fontWeight: calendarTheme?.dateHeader.fontWeight || 700,
    height: isMobile ? '30px' : '40px',
  };
  const labelThStyle: React.CSSProperties = {
    ...thStyle,
    background: calendarTheme?.labelHeader.background || '#f5f5f5',
    fontWeight: calendarTheme?.labelHeader.fontWeight || 700,
    width: isMobile ? 40 : 80,
    minWidth: 30,
    maxWidth: 120,
  };
  const tdStyle: React.CSSProperties = {
    border: isMobile ? `1px solid ${calendarTheme?.cell.border || '#999'}` : `1px solid ${calendarTheme?.cell.border || '#000'}`,
    background: calendarTheme?.cell.background || '#fff',
    textAlign: 'center',
    padding: isMobile ? '2px' : '6px',
    fontSize: isMobile ? '0.4rem' : (calendarTheme?.table.fontSize || '0.8rem'),
    wordBreak: 'break-all',
    minWidth: 0,
    whiteSpace: isMobile ? 'normal' : 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    height: isMobile ? 'auto' : '40px',
    color: calendarTheme?.cell.color || '#000',
  };

  const categoryLabelTdStyle = (bgColor?: string): React.CSSProperties => ({
    ...tdStyle,
    background: bgColor || calendarTheme?.cell.background || '#fff',
    fontWeight: 700,
    textAlign: 'center',
    width: isMobile ? 40 : 80,
    minWidth: 30,
    maxWidth: 120,
  });
  const dateTdStyle: React.CSSProperties = {
    ...tdStyle,
    background: calendarTheme?.dateHeader.background || '#f5f5f5',
    fontWeight: 700,
    border: isMobile ? `1px solid ${calendarTheme?.dateHeader.border || '#999'}` : `1px solid ${calendarTheme?.dateHeader.border || '#000'}`,
  };
  
  return (
    <Paper elevation={0} sx={{ width: '100%', overflow: 'hidden', borderRadius: 0, borderTop: '2px solid #000', borderBottom: '2px solid #000', p: 0 }}>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>요일</th>
              {dayHeaders.map((day, idx) => (
                <th key={day} style={{ ...thStyle, color: idx === 0 ? (calendarTheme?.weekend.color || theme.palette.error.main) : undefined }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIdx) => (
              <React.Fragment key={weekIdx}>
                {/* 날짜 행 */}
                <tr>
                  <th style={dateThStyle}>날짜</th>
                  {week.map((day, dayIdx) => (
                    <th key={format(day, 'T') + '-date'} style={dateThStyle}>
                  {isSameMonth(day, monthStart) && (
                        <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                          gap: '4px',
                          height: '100%',
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            color: isToday(day) && isMobile ? (calendarTheme?.today.color || '#fff') : (getDay(day) === 0 || holidays.includes(format(day, 'yyyy-MM-dd')) ? (calendarTheme?.holiday.color || theme.palette.error.main) : (calendarTheme?.cell.color || '#222')),
                            background: isToday(day) && isMobile ? (calendarTheme?.today.background || theme.palette.error.main) : undefined,
                            borderRadius: isToday(day) && isMobile ? '50%' : undefined,
                            width: isToday(day) && isMobile ? 20 : undefined,
                            height: isToday(day) && isMobile ? 20 : undefined,
                            fontSize: isMobile ? '0.8rem' : '1.68rem',
                            lineHeight: 1,
                          }}>{format(day, 'd')}</span>
                          {isToday(day) && !isMobile && (
                            <span style={{
                              minWidth: 32, height: 32, background: calendarTheme?.today.background || theme.palette.error.main, color: calendarTheme?.today.color || '#fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', lineHeight: 1, boxSizing: 'border-box',
                            }}>오늘</span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
                {/* 카테고리별 일정 행 */}
                {scheduleCategories.map((category, catIdx) => (
                  <tr key={category.key}>
                    <td style={categoryLabelTdStyle(category.bgColor)}>
                      {isMobile && category.mobileLabel ? category.mobileLabel : category.label}
                    </td>
                    {week.map((day, dayIdx) => {
                      const scheduleForDay = schedules.filter(s => s.date === format(day, 'yyyy-MM-dd'));
                      const isOtherMonth = !isSameMonth(day, monthStart);
                  return (
                        <td key={format(day, 'T') + '-' + category.key} style={{ ...tdStyle, background: category.bgColor || calendarTheme?.cell.background || '#fff', opacity: isOtherMonth ? 0.3 : 1 }}>
                          {renderCellContent(scheduleForDay, category.key)}
                        </td>
                  );
                })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Paper>
  );
};

export default ScheduleCalendar;