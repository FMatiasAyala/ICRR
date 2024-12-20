import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Modal } from '@mui/material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import FormMaintenance from '../Form/FormMaintenance';



const NewMaintenance = ({ equipos, tecnicos, salas }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        sx={{
          width: { xs: '100%', sm: 'auto' },
          padding: { xs: 2, sm: 0 },
          alignItems: 'center',
        }}
      >
        <Card
          onClick={handleOpen}
          sx={{
            cursor: 'pointer',
            p: { xs: 2, sm: 1 }, // Más espacio en pantallas pequeñas
            width: { xs: '100%', sm: '400px' }, // Ocupa todo el ancho en móvil y tiene un ancho fijo en pantallas grandes
            borderRadius: '16px', // Bordes redondeados
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)', // Sombra suave
            backgroundColor: '#ffffff', // Fondo blanco
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              color: '#fff',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              flexDirection: { xs: 'column', sm: 'row' }, // Apila el icono y el texto verticalmente en móvil
              textAlign: 'center',
            }}
          >
            <BuildCircleIcon sx={{ fontSize: '2rem', color: '#00796b' }} /> {/* Icono de mantenimiento */}
            <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>
              Programar Mantenimiento
            </Typography>
          </CardContent>
        </Card>

        {/* Modal */}
        <Modal open={open} onClose={handleClose}>
          <FormMaintenance equipos={equipos} tecnicos={tecnicos} salas={salas} handleClose={handleClose} />
        </Modal>
      </Box>

    </>
  );
};

export default NewMaintenance;
