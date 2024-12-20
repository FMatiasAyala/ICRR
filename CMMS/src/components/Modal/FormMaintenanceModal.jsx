import React, {useState } from 'react';
import { Box, Card, CardContent, Typography, Modal} from '@mui/material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import FormEquipamentM from '../Form/FormEquipamentM';



const FormMaintenanceModal = ({equipos, tecnicos, salas, onEventCreate}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Box display="flex" flexDirection="column" gap={2}>
        <Card
          onClick={handleOpen}
          sx={{
            cursor: 'pointer',
            p: 1,
            borderRadius: '16px', // Bordes más redondeados
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)', // Sombra suave
            backgroundColor: '#ffffff', // Fondo blanco para un aspecto profesional
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              color: '#fff',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <BuildCircleIcon sx={{ fontSize: '2rem', color: '#00796b' }} />
          </CardContent>
        </Card>

        {/* Modal */}
        <Modal open={open} onClose={handleClose}>
          <FormEquipamentM equipos={equipos} tecnicos={tecnicos} handleClose={handleClose} onEventCreate={onEventCreate}/>
        </Modal>
      </Box>
    </>
  );
};

export default FormMaintenanceModal;
