// src/components/Dashboard/Dashboard.jsx
import React from 'react';
import { Box, Grid } from '@mui/material';
import EquipamentsList from './EquipamentsList';
import CardsMantenimiento from '../CardsMantenimiento';
import Graphic from '../Graphic';
import Cards from '../Cards';


const Dashboard = ({user, reloadEquipos, equipos, tecnicos, uniqueEquipos, salas, mantenimiento, cantidadEventos, ultimoEstado, estadoEquipos}) => {

  return (
    <>
      <Box sx={{ flexGrow: 1, padding: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} container spacing={1}>
              <Grid item xs={12} sm={12}>
                <Cards equipo={equipos || []} sala={salas || []} estadoEquipo={ultimoEstado || []} />
                <CardsMantenimiento equipos={equipos || []} mantenimiento={mantenimiento || []} />
              </Grid>
          </Grid>
          <Grid item xs={12} md={8}>
            <Graphic equipos={equipos || []} cantidadEventos={cantidadEventos || []} />
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
