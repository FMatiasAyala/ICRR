import React, { useState, useEffect } from 'react';
import { Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import SideMenu from '../Menu/SideMenu';
import NavBar from '../NavBar';
import { Box } from '@mui/material';
import Dashboard from './Dashboard';
import UpsTable from './UpsTable';
import { jwtDecode } from 'jwt-decode';
import { useWebSocket } from '../hooks/useWebScoket';
import { apiEquipos, apiSalas, apiTecnicos, apiCantidadesEventos, apiMantenimiento, apiEventos, apiUps } from '../../utils/Fetch';


const Layout = () => {
    const { estadoEquipos, setEstadoEquipos, sendSocketMessage } = useWebSocket();
    const [equipos, setEquipos] = useState([]);
    const [salas, setSalas] = useState([]);
    const [filteredEquipos, setFilteredEquipos] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [uniqueEquipos, setUniqueEquipos] = useState([]);
    const [mantenimiento, setMantenimiento] = useState([]);
    const [cantidadEventos, setCantidadEventos] = useState([]);
    const [ultimoEstado, setUltimoEstado] = useState([]);
    const [ups, setUps] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const user = token ? jwtDecode(token) : null;



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
    const fetchUps= async () => {
        try {
            const response = await fetch(apiUps);
            const data = await response.json();
            setUps(data);
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
    useEffect(() => {
        fetchEventos();
        fetchSalas();
        fetchEquipos();
        fetchTecnicos();
        fetchUps();
        obtenerMantenimiento();
        fetchCantidadEventos();
    }, []);

    const reloadEquipos = () => {
        fetchEquipos();
        fetchEventos();
        sendSocketMessage({ type: 'update' });
    };
    return (<>
    

        <NavBar onMenuClick={toggleDrawer(true)} handleLogout={handleLogout} user={user} />

        {user.role === 'sistemas' &&(<SideMenu open={drawerOpen} onClose={toggleDrawer(false)} equipos={equipos} salas={salas} />)}

        <div style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
                <Routes>
                    {/* Ruta principal al ingresar */}
                    <Route path="/cmms"
                        element={<Dashboard user={user}
                            equipos={equipos}
                            salas={salas}
                            tecnicos={tecnicos}
                            uniqueEquipos={uniqueEquipos}
                            mantenimiento={mantenimiento}
                            cantidadEventos={cantidadEventos}
                            ultimoEstado={ultimoEstado}
                            reloadEquipos={reloadEquipos}
                            estadoEquipos={estadoEquipos}
                        />} />
                    <Route path="/ups" element={<UpsTable salas={salas} ups={ups} />} />
                </Routes>
                <Outlet />
            </div>
        </div>
    </>
    );
};

export default Layout;
