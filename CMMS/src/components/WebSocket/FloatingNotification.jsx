import React from 'react';
import { Box, Typography, IconButton, Slide, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useWebSocketContext } from '../WebSocket/useWebSocketContext';

const StackedNotifications = () => {
  const { notificaciones, setNotificaciones } = useWebSocketContext();

  const handleClose = (index) => {
    setNotificaciones((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        zIndex: 1400,
      }}
    >
      {notificaciones.map((noti, index) => (
        <Slide key={index} direction="left" in={true} mountOnEnter unmountOnExit>
          <Paper
            sx={{
              minWidth: 300,
              px: 2,
              py: 1,
              bgcolor: '#1976d2',
              color: 'white',
              borderRadius: 2,
              boxShadow: 4,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight="bold">
                {noti.mensaje}
              </Typography>
              <IconButton onClick={() => handleClose(index)} size="small" sx={{ color: 'white' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        </Slide>
      ))}
    </Box>
  );
};

export default StackedNotifications;
