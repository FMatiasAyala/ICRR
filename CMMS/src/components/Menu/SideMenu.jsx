import React from 'react';
import { Drawer, Box, List, Divider } from '@mui/material';
import TechniciansList from './TechnicianList';
import ContratoFormModal from '../Modal/ContratosFormModal';
import NewEquipamentModal from '../NewEquipo/NewEquipamentModal';

const SideMenu = ({ open, onClose, equipos, salas }) => {

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
            <ContratoFormModal equipos={equipos} salas={salas}/>
          </div>
         </List>
         <List>
          <div onClick={(e) => e.stopPropagation()}>
            <NewEquipamentModal sala = {salas}/>
          </div>
         </List>
      </Box>
    </Drawer>
  );
};

export default SideMenu;
