import React from 'react';
import { Drawer, Box, List, ListItem, ListItemButton,ListItemText, Divider } from '@mui/material';
import TechniciansList from './TechnicianList/TechnicianList';
import ContratoFormModal from '../Modal/ContratosFormModal';
import NewEquipamentModal from '../NewEquipo/NewEquipamentModal';
import { useNavigate } from 'react-router-dom';
import { BatteryChargingFull } from '@mui/icons-material';

const SideMenu = ({ open, onClose, equipos, salas }) => {
  const navigate = useNavigate(); // Inicializar el hook
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250 }} role="presentation">
        <List>
          <div onClick={(e) => e.stopPropagation()}>
            <TechniciansList />
          </div>
        </List>
        <List>
          <div onClick={(e) => e.stopPropagation()}>
            <ContratoFormModal equipos={equipos} salas={salas} />
          </div>
        </List>
        <List>
          <div onClick={(e) => e.stopPropagation()}>
            <NewEquipamentModal sala={salas} />
          </div>
        </List>
        <Divider />
        <List>
          {/* Botón para redirigir a UPS */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate('/ups')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                borderRadius: '8px',
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundColor: '#e0f7fa', // Color al hacer hover
                },
              }}
            >
              {/* Icono de UPS */}
              <BatteryChargingFull sx={{ marginRight: '10px', color: '#00838f'}} />
              <ListItemText primary="UPS" sx={{ fontWeight: 'bold' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default SideMenu;
