import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Palette, Check } from '@mui/icons-material';
import { CalendarTheme, calendarThemes } from '../theme';

interface ThemeSelectorProps {
  currentTheme: CalendarTheme;
  onThemeChange: (theme: CalendarTheme) => void;
  open: boolean;
  onClose: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange, open, onClose }) => {
  const handleThemeSelect = (theme: CalendarTheme) => {
    onThemeChange(theme);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Palette />
          <Typography variant="h6">달력 테마 선택</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {calendarThemes.map((theme) => (
            <Grid item xs={12} sm={6} md={4} key={theme.name}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: currentTheme.name === theme.name ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  '&:hover': {
                    border: '2px solid #1976d2',
                    boxShadow: 2,
                  },
                  position: 'relative',
                  bgcolor: theme.name === '다크' ? '#23272f' : 'background.paper',
                  color: theme.name === '다크' ? '#fff' : 'text.primary',
                }}
                onClick={() => handleThemeSelect(theme)}
              >
                {currentTheme.name === theme.name && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: '#1976d2',
                      color: 'white',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                    }}
                  >
                    <Check sx={{ fontSize: 16 }} />
                  </Box>
                )}
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: theme.name === '다크' ? '#fff' : 'text.primary' }}>
                    {theme.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: theme.name === '다크' ? '#ccc' : theme.cell.color }}>
                    {theme.description}
                  </Typography>
                  
                  {/* 테마 미리보기 */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {/* 날짜 헤더 미리보기 */}
                    <Box
                      sx={{
                        height: 20,
                        backgroundColor: theme.dateHeader.background,
                        border: `1px solid ${theme.dateHeader.border}`,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.dateHeader.color,
                          fontWeight: theme.dateHeader.fontWeight,
                        }}
                      >
                        날짜
                      </Typography>
                    </Box>
                    
                    {/* 일정 셀 미리보기 */}
                    <Box
                      sx={{
                        height: 20,
                        backgroundColor: theme.cell.background,
                        border: `1px solid ${theme.cell.border}`,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.cell.color,
                        }}
                      >
                        일정
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ThemeSelector; 