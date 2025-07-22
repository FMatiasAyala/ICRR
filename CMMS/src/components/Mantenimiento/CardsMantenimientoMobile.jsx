import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DoneIcon from '@mui/icons-material/Done';
import ScheduleIcon from '@mui/icons-material/Schedule';

const CardsMantenimientoMobile = ({ mantenimientosProgramados, obtenerNombreEquipo, handleOpenForm}) => {


  return (
    <Box sx={{ width: '100%' }}>
      {mantenimientosProgramados.length > 0 ? (
        mantenimientosProgramados.map((mantenimiento) => (
          <Accordion key={mantenimiento.id_mantenimiento}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">
                {obtenerNombreEquipo(mantenimiento.id_equipo)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2"><strong>Tipo:</strong> {mantenimiento.tipo}</Typography>
              <Typography variant="body2"><strong>Detalle:</strong> {mantenimiento.detalle}</Typography>
              <Typography variant="body2"><strong>Fecha:</strong> {new Date(mantenimiento.fecha).toLocaleDateString()}</Typography>
              <Typography variant="body2">
                <strong>Horario:</strong> {new Date(`2024-11-01T${mantenimiento.desde}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(`2024-11-01T${mantenimiento.hasta}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                <IconButton onClick={() => handleOpenForm(mantenimiento, 'done')} color="primary">
                  <DoneIcon />
                </IconButton>
                <IconButton onClick={() => handleOpenForm(mantenimiento, 'postpone')} color="secondary">
                  <ScheduleIcon />
                </IconButton>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography align="center" sx={{ mt: 2 }}>No hay mantenimientos programados disponibles</Typography>
      )}
    </Box>
  );
};

export default CardsMantenimientoMobile;
