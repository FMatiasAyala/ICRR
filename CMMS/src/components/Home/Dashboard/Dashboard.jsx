// src/components/Dashboard/Dashboard.jsx
import React from 'react';
import { Box, Grid } from '@mui/material';
import EquipamentsList from '../EquipamentsList';
import TableEvents from '../../TableEvents';
import CardsMantenimiento from '../../Maintenance/CardsMantenimiento';
import Cards from '../../Cards';


const Dashboard = ({user, reloadEquipos, equipos, tecnicos, uniqueEquipos, salas, mantenimiento, ultimoEstado, estadoEquipos}) => {

  return (
    <>
      <Box sx={{ flexGrow: 1, padding: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} container spacing={1}>
              <Grid item xs={12} sm={12}>
                <Cards equipo={equipos || []} sala={salas || []} estadoEquipo={ultimoEstado || []} />
                <CardsMantenimiento salas={salas} equipos={equipos || []} tecnicos={tecnicos} reload={reloadEquipos}/>
              </Grid>
          </Grid>
          <Grid item xs={12} md={8} sx={{display:{xs:'none', md:'block'}}}>
            <TableEvents equipo={equipos || []} sala={salas || []} ultimoEquipo={ultimoEstado || []} reload={reloadEquipos} estadoEquipos={estadoEquipos} />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <EquipamentsList
            estadoEquipos={estadoEquipos || {}}
            equipos={uniqueEquipos || []}
            equipo={equipos || []}
            tecnicos={tecnicos || []}
            salas={salas || []}
            mantenimiento={mantenimiento || []}
            reloadEquipos={reloadEquipos}
            user={user}
          />
        </Grid>
      </Box>
    </>
  );
};

export default Dashboard;
