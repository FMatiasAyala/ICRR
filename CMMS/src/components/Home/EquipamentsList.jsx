import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  useMediaQuery,
  TextField,
  InputAdornment,
  Typography,
} from '@mui/material';
import { Masonry } from '@mui/lab';
import SearchIcon from '@mui/icons-material/Search';
import DashboardDesktop from './Dashboard/DashboardDesktop';
import DashboardMobile from './Dashboard/DashboardMobile';
import { useWebSocketContext } from '../WebSocket/useWebSocketContext';

const EquipamentsList = ({ estadoEquipos, salas, onEquipoSeleccionado, allContratos }) => {
  const { state: { equipos } } = useWebSocketContext();
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
    const [estadoSeleccionado, setEstadoSeleccionado] = useState(null); 
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    setFilteredEquipos(equipos);
  }, [equipos]);

  const filterEquipos = (query) => {
    const lowerQuery = query.toLowerCase();

    return equipos.filter((equipo) => {
      const sala = salas.find((s) => s.id_ubicacion === equipo.id_ubicacion);

      const matchesText =
        !query || query.length < 3 || (
          equipo.modelo?.toLowerCase().includes(lowerQuery) ||
          equipo.serial_number?.toLowerCase().includes(lowerQuery) ||
          equipo.siglas_servicio?.toLowerCase().includes(lowerQuery) ||
          estadoEquipos[equipo.id]?.toLowerCase().includes(lowerQuery) ||
          sala?.sala?.toLowerCase().includes(lowerQuery)
        );

      return matchesText;
    });
  };



  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFilteredEquipos(filterEquipos(value));
  };



  const groupedEquipos = filteredEquipos.reduce((acc, equipo) => {
    const servicio = equipo.siglas_servicio;
    if (!acc[servicio]) {
      acc[servicio] = [];
    }
    acc[servicio].push(equipo);
    return acc;
  }, {});

  const getColorByEstado = (estado) => {
    switch (estado) {
      case 'OPERATIVO': return '#81C784';
      case 'NO OPERATIVO': return '#E57373';
      case 'REVISION': return '#FFD54F';
      default: return '#F5F5F5';
    }
  };

  const getHoverColorByEstado = (estado) => {
    switch (estado) {
      case 'OPERATIVO': return '#4CAF50';
      case 'NO OPERATIVO': return '#F44336';
      case 'REVISION': return '#FFB74D';
      default: return '#E0E0E0';
    }
  };

  if (!estadoEquipos || Object.keys(estadoEquipos).length === 0) {
    return <Typography sx={{ p: 2 }}>No hay datos disponibles o están cargando...</Typography>;
  }

  return (
    <Paper
      sx={{
        p: 2,
        width: '100%',
        overflowY: 'auto',
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          fullWidth
          placeholder="Buscar por serial, modelo, estado, sala o servicio..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
            '& input': { fontSize: '0.9rem' },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'gray' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {isMobile ? (
        <DashboardMobile
          groupedEquipos={groupedEquipos}
          handleOpenModal={onEquipoSeleccionado}
          getHoverColorByEstado={getHoverColorByEstado}
          getColorByEstado={getColorByEstado}
          salas={salas}
          estadoEquipos={estadoEquipos}
        />
      ) : (
        <Masonry columns={{ xs: 1, sm: 2, md: 2 }} spacing={2}>
          {Object.keys(groupedEquipos).map((key, i) => (
            <Box key={key}>
              <DashboardDesktop
                groupedEquipos={{ [key]: groupedEquipos[key] }}
                handleOpenModal={onEquipoSeleccionado}
                getHoverColorByEstado={getHoverColorByEstado}
                getColorByEstado={getColorByEstado}
                salas={salas}
                estadoEquipos={estadoEquipos}
                // resumen solo en la PRIMERA instancia
                showResumen={i === 0}
                // filtro controlado para que afecte a TODAS las columnas
                estadoSeleccionado={estadoSeleccionado}
                onEstadoSeleccionadoChange={setEstadoSeleccionado}
                allContratos={allContratos}
              />
            </Box>
          ))}
        </Masonry>
      )}
    </Paper>
  );
};

export default EquipamentsList;
