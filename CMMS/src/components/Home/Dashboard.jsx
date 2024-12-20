// src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import EquipamentsList from './EquipamentsList';
import CardsMantenimiento from '../CardsMantenimiento';
import Graphic from '../Graphic';
import SideMenu from '../Menu/SideMenu';
import NavBar from '../NavBar';
import Cards from '../Cards';
import { apiEquipos, apiEventos, apiSalas, apiTecnicos, apiMantenimiento, apiCantidadesEventos } from '../../utils/Fetch';
import { useWebSocket } from '../hooks/useWebScoket'; // Importa el hook de WebSocket
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { estadoEquipos, setEstadoEquipos, sendSocketMessage } = useWebSocket(); // Usamos el hook aquí
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [uniqueEquipos, setUniqueEquipos] = useState([]);
  const [salas, setSalas] = useState([]);
  const [mantenimiento, setMantenimiento] = useState([]);
  const [cantidadEventos, setCantidadEventos] = useState([]);
  const [ultimoEstado, setUltimoEstado] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const fetchEquipos = async () => {
    try {
      const response = await fetch(apiEquipos);
      const data = await response.json();
      const uniqueEquipos = Array.from(new Set(data.map(equipo => equipo.id)))
        .map(id => data.find(equipo => equipo.id === id));
      setUniqueEquipos(uniqueEquipos);
      setEquipos(data);
      setFilteredEquipos(data);
      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al cargar los equipos:', error);
    }
  };

  const fetchEventos = async () => {
    try {
      const response = await fetch(apiEventos);
      const data = await response.json();
      const estadoMap = data.reduce((acc, evento) => {
        acc[evento.id_equipo] = evento.estado;
        return acc;
      }, {});

      const ultimoEstadoPorEquipo = data.reduce((acc, item) => {
        const { id_equipo, desde } = item;
        if (!acc[id_equipo] || new Date(acc[id_equipo].desde) < new Date(desde)) {
          acc[id_equipo] = item;
        }
        return acc;
      }, {});

      setUltimoEstado(Object.values(ultimoEstadoPorEquipo));
      setEstadoEquipos(estadoMap);
      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al cargar los eventos:', error);
    }
  };

  const fetchSalas = async () => {
    try {
      const response = await fetch(apiSalas);
      const data = await response.json();
      setSalas(data);
      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al cargar las salas:', error);
    }
  };

  const fetchTecnicos = async () => {
    try {
      const response = await fetch(apiTecnicos);
      const data = await response.json();
      setTecnicos(data);
      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al cargar los técnicos:', error);
    }
  };

  const obtenerMantenimiento = async () => {
    try {
      const response = await fetch(apiMantenimiento);
      const data = await response.json();
      setMantenimiento(data);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      setError('Error al obtener los datos');
    }
  };

  const fetchCantidadEventos = async () => {
    try {
      const response = await fetch(apiCantidadesEventos);
      const data = await response.json();
      setCantidadEventos(data);
    } catch (error) {
      console.error('Error al obtener los eventos:', error);
    }
  };

  const reloadEquipos = () => {
    fetchEquipos();
    fetchEventos();
    sendSocketMessage({ type: 'update' });
  };

  useEffect(() => {
    fetchEventos();
    fetchSalas();
    fetchEquipos();
    fetchTecnicos();
    obtenerMantenimiento();
    fetchCantidadEventos();
  }, []);

  return (
    <>
      <NavBar onMenuClick={toggleDrawer(true)} handleLogout={handleLogout} />
      <Box sx={{ flexGrow: 1, padding: 2 }}>
        <SideMenu open={drawerOpen} onClose={toggleDrawer(false)} equipos={equipos} salas={salas} />
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
            reloadEquipos={reloadEquipos}
          />
        </Grid>
      </Box>
    </>
  );
};

export default Dashboard;
