// src/components/Dashboard/Dashboard.jsx
import React, { useState } from 'react';
import { Box, Grid, IconButton } from '@mui/material';
import EquipamentsList from '../EquipamentsList';
import CardsMantenimiento from '../../Mantenimiento/CardsMantenimiento';
import Cards from '../../Cards';
import ProfileEquipament from '../../Equipos/PerfilEquipo';
import { ArrowBack } from '@mui/icons-material';
import { useWebSocketContext } from '../../WebSocket/useWebSocketContext';



const Dashboard = ({tecnicos, salas, estadoEquipos }) => {
  const { setEquiposConEventoNuevo } = useWebSocketContext();
  const [vista, setVista] = useState('listado');
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);

  const handleEquipoSeleccionado = (equipo) => {
    setEquipoSeleccionado(equipo);
    setEquiposConEventoNuevo(prev => prev.filter(id => id !== equipo.id));
    setVista('detalle');
  };


  const handleVolver = () => {
    setVista('listado');
  };
  return (
    <Box sx={{ flexGrow: 1, padding: 2, mt: '10px' }}>
      {vista === 'listado' ? (
        <>
          <Grid container spacing={3}>
            {/* IZQUIERDA */}
            <Grid item xs={12} md={2} container spacing={2} direction="column">
              <Grid item>
                <Cards/>
              </Grid>
              <Grid item>
                <CardsMantenimiento salas={salas}/>
              </Grid>
            </Grid>

            {/* DERECHA */}
            <Grid item xs={12} md={10}>
              <EquipamentsList
                estadoEquipos={estadoEquipos || {}}
                salas={salas || []}
                onEquipoSeleccionado={handleEquipoSeleccionado}
              />
            </Grid>
          </Grid>

        </>
      ) : (
        <>
          <IconButton onClick={() => setVista('listado')}>
            <ArrowBack /> Volver
          </IconButton>
          <ProfileEquipament
            equipo={equipoSeleccionado}
            tecnicos={tecnicos.filter(t => t.id_tecnico === equipoSeleccionado.id_tecnico)}
            salas={salas}
            onVolver={handleVolver}
          />
        </>
      )}
    </Box>
  );
};

export default Dashboard;
