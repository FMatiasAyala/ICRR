import React from 'react';
import { Slide, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useWebSocketContext } from '../hooks/useWebSocketContext';

const BannerSocketNotification = () => {
  const { alertaSocket, setAlertaSocket } = useWebSocketContext();

  if (!alertaSocket) return null;

  return (
    <Slide in={true} direction="down" mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          bgcolor: '#1976d2',
          color: 'white',
          px: 2,
          py: 1.5,
          zIndex: 1500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 3,
        }}
      >
        <Typography variant="body1">{alertaSocket.mensaje}</Typography>
        <IconButton size="small" onClick={() => setAlertaSocket(null)} sx={{ color: 'white' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Slide>
  );
};

export default BannerSocketNotification;
