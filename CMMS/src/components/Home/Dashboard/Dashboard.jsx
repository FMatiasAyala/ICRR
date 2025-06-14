// src/components/Dashboard/Dashboard.jsx
import React, { useState } from 'react';
import { Box, Grid, IconButton } from '@mui/material';
import EquipamentsList from '../EquipamentsList';
import TableEvents from '../../TableEvents';
import CardsMantenimiento from '../../Maintenance/CardsMantenimiento';
import Cards from '../../Cards';
import ProfileEquipament from '../../Equipos/ProfileEquipament';
import { ArrowBack } from '@mui/icons-material';
import { useWebSocketContext } from '../../hooks/useWebSocketContext';



const Dashboard = ({ user, equipos, tecnicos, salas, estadoEquipos }) => {
  const {setEquiposConEventoNuevo} = useWebSocketContext();
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
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      {vista === 'listado' ? (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} container spacing={1}>
              <Grid item xs={12} sm={12}>
                <Cards equipo={equipos || []} sala={salas || []} estadoEquipos={estadoEquipos}/>
                <CardsMantenimiento salas={salas} equipos={equipos || []} />
              </Grid>
            </Grid>
            <Grid item xs={12} md={8} sx={{ display: { xs: 'none', md: 'block' } }}>
              <TableEvents sala={salas || []} />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <EquipamentsList
              estadoEquipos={estadoEquipos || {}}
              equipo={equipos || []}
              tecnicos={tecnicos || []}
              salas={salas || []}
              user={user}
              onEquipoSeleccionado={handleEquipoSeleccionado}
            />
          </Grid>
        </>
      ) : (
        <>
          <IconButton onClick={() => setVista('listado')}>
            <ArrowBack />
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
