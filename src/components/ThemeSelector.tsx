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
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  const [open, setOpen] = React.useState(false);

  const handleThemeSelect = (theme: CalendarTheme) => {
    onThemeChange(theme);
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="달력 테마 변경">
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.12)',
            },
          }}
        >
          <Palette />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
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
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {theme.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {theme.description}
                    </Typography>
                    
                    {/* 테마 미리보기 */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {/* 헤더 미리보기 */}
                      <Box
                        sx={{
                          height: 20,
                          backgroundColor: theme.header.background,
                          border: `1px solid ${theme.header.border}`,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.header.color,
                            fontWeight: theme.header.fontWeight,
                          }}
                        >
                          헤더
                        </Typography>
                      </Box>
                      
                      {/* 셀 미리보기 */}
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
                          셀
                        </Typography>
                      </Box>
                      
                      {/* 카테고리 색상 미리보기 */}
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {Object.entries(theme.categoryLabels).map(([key, color]) => (
                          <Box
                            key={key}
                            sx={{
                              width: 16,
                              height: 16,
                              backgroundColor: color,
                              border: `1px solid ${theme.cell.border}`,
                              borderRadius: 0.5,
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ThemeSelector; 