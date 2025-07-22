import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Modal
} from '@mui/material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import FormMaintenance from '../Form/FormMaintenance';

const NewMaintenance = ({ equipos, salas }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Box display="flex" justifyContent="center" alignItems="center" tabIndex={-1}>
        <Tooltip title="Programar mantenimiento" arrow>
          <IconButton
            onClick={handleOpen}
            sx={{
              backgroundColor: '#e0f2f1',
              '&:hover': {
                backgroundColor: '#009688',
                color:'#e0f2f1'
              },
              color: '#00796b',
              p: 1.5,
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            <BuildCircleIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <FormMaintenance equipos={equipos} salas={salas} tecnihandleClose={handleClose} />
      </Modal>
    </>
  );
};

export default NewMaintenance;
