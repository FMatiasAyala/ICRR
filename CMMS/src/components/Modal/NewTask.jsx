import React, {useState} from "react";
import FormTask from "../Form/FormTask"
import { Card, Box, CardContent, Typography, Modal } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const NewTask = ({ onEventCreate, equipo, salas }) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
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
            width: { xs: '100%', sm: 'auto' }, // Ocupa todo el ancho en móvil
            borderRadius: '16px',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#ffffff',
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
              flexDirection: { xs: 'column', sm: 'row' }, // Cambia la orientación en móvil
              textAlign: 'center',
            }}
          >
            <AddCircleOutlineIcon sx={{ fontSize: '2rem', color: '#00796b' }} />
            <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>
              Cargar nueva tarea
            </Typography>
          </CardContent>
        </Card>
      
        <Modal open={open} onClose={handleClose} closeAfterTransition>
          <FormTask handleClose={handleClose} onEventCreate={onEventCreate} equipo={equipo} salas={salas} />
        </Modal>
      </Box>
      
    );
};

export default NewTask;
