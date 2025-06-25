import React from 'react';
import { Box, Grid, Chip, useTheme } from '@mui/material';
import { StaffMember } from '../types';
import { CalendarTheme } from '../theme';

interface StaffFilterProps {
  staffMembers: StaffMember[];
  selectedStaff: string[];
  onStaffSelect: (staffName: string) => void;
  calendarTheme?: CalendarTheme;
}

const StaffFilter: React.FC<StaffFilterProps> = ({
  staffMembers,
  selectedStaff,
  onStaffSelect,
  calendarTheme,
}) => {
  const theme = useTheme();
  // Define the exact order and content for the filter as seen in the image
  const filterableMemberNames = [
    "박일섭", "이은철", "김선민", "서동진",
    "공선희", "박기태", "이우석", "신현덕",
    "김완종", "서정화", "백요한", "방사무엘",
    "이진우", "박부환", "씨앗학교", "교회학교"
  ];

  const orderedStaff = filterableMemberNames
    .map(name => staffMembers.find(s => s.name === name))
    .filter((s): s is StaffMember => s !== undefined);

  const chipRows = [
    orderedStaff.slice(0, 8),
    orderedStaff.slice(8, 16),
  ];

  const isDarkTheme = calendarTheme?.name === '다크';
  const chipBackground = isDarkTheme ? 'transparent' : '#fff';
  const chipHoverBackground = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0, sm: 0.3 }, p: { xs: 1, sm: 0 } }}>
      {chipRows.map((row, rowIdx) => (
        <Box key={rowIdx} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mb: 0, gap: { xs: 0.4, sm: 0.7 }, py: { xs: 0, sm: 0.7 } }}>
          {row.map((staff) => {
            const isSelected = selectedStaff.includes(staff.name);
            return (
              <Chip
                key={staff.id}
                label={staff.name}
                variant={isSelected ? 'filled' : 'outlined'}
                onClick={() => onStaffSelect(staff.name)}
                sx={{
                  m: { xs: 0.7, sm: 0.2 },
                  width: { xs: '38px', sm: '70px' },
                  height: { xs: '14px', sm: '22px' },
                  fontSize: { xs: '0.4rem', sm: '0.8rem' },
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  color: isSelected ? '#fff' : staff.color,
                  backgroundColor: isSelected ? staff.color : chipBackground,
                  borderColor: staff.color,
                  '& .MuiChip-label': {
                    width: '100%',
                    textAlign: 'center',
                    padding: '0 2px',
                  },
                  '&:hover': {
                    backgroundColor: isSelected ? staff.color : chipHoverBackground,
                    color: isSelected ? '#fff' : staff.color,
                    borderColor: staff.color,
                    opacity: isSelected ? 0.9 : 1,
                  },
                }}
              />
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export default StaffFilter; 