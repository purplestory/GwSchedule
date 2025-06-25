import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ScheduleItem, StaffMember } from '../types';

interface ScheduleDetailProps {
  open: boolean;
  schedule: ScheduleItem | null;
  staffMembers: StaffMember[];
  onClose: () => void;
}

const ScheduleDetail: React.FC<ScheduleDetailProps> = ({
  open,
  schedule,
  staffMembers,
  onClose
}) => {
  if (!schedule) return null;

  const getStaffInfo = (shortName: string) => {
    return staffMembers.find(staff => staff.shortName === shortName);
  };

  const renderStaffChips = (content: string) => {
    if (!content) return <Typography sx={{ color: '#666' }}>없음</Typography>;
    
    const staffNames = content.split(',').map(name => name.trim());
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {staffNames.map((name, index) => {
          const staffInfo = getStaffInfo(name);
          return (
            <Chip
              key={index}
              label={staffInfo ? `${staffInfo.name}(${name})` : name}
              color="primary"
              variant="outlined"
              size="small"
            />
          );
        })}
      </Box>
    );
  };

  const isWeekend = schedule.dayOfWeek === '토' || schedule.dayOfWeek === '일';

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">
            {format(parseISO(schedule.date), 'yyyy년 M월 d일', { locale: ko })}
          </Typography>
          <Chip 
            label={schedule.dayOfWeek} 
            color={isWeekend ? 'warning' : 'primary'}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                📅 일정
              </Typography>
              <Typography variant="body1">
                {schedule.schedule || '등록된 일정이 없습니다.'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                🙏 매일씨앗묵상
              </Typography>
              {renderStaffChips(schedule.dailyMeditation)}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                ☕ 커피관리
              </Typography>
              {renderStaffChips(schedule.coffeeManagement)}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                👥 근무
              </Typography>
              <Typography variant="body1">
                {schedule.workSchedule || '등록된 근무 정보가 없습니다.'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                🚗 차량/기타
              </Typography>
              <Typography variant="body1">
                {schedule.vehicleAndOther || '등록된 차량/기타 정보가 없습니다.'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleDetail; 