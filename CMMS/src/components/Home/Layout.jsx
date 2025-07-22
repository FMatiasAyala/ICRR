import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import SideMenu from '../Menu/SideMenu';
import NavBar from '../NavBar';
import Dashboard from './Dashboard/Dashboard';
import UpsDashboard from './UpsDashboard';
import { jwtDecode } from 'jwt-decode';
import { useWebSocketContext } from "../WebSocket/useWebSocketContext"
import { apiEquipos, apiSalas, apiTecnicos, apiMantenimiento, apiEventos, apiUps } from '../utils/Fetch'
import ReportEquipament from './ReportEquipament';
import NewEquipamentModal from '../Equipos/NuevoEquipoModal';
import Footer from '../utils/Footer'


const Layout = () => {
    const { state: { estadoEquipos, equipos, tecnicos }, dispatch } = useWebSocketContext();
    const [salas, setSalas] = useState([]);
    const [ups, setUps] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const user = token ? jwtDecode(token) : null;

    const [openEquipModal, setOpenEquipModal] = useState(false);


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
            dispatch({ type: 'SET_EVENTOS', payload: data })
            dispatch({ type: 'SET_ESTADOS_INICIALES', payload: estadoMap });
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
            dispatch({ type: 'SET_EQUIPOS_INICIALES', payload: data });
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
    const fetchUps = async () => {
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
            dispatch({ type: 'SET_TECNICOS_INICIALES', payload: data });
            if (!response.ok) {
                throw new Error(`Error en la respuesta del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Error al cargar los técnicos:', error);
        }
    };
    const fetchMantenimiento = async () => {
        try {
            const response = await fetch(apiMantenimiento);
            const data = await response.json();
            dispatch({ type: 'MANTENIMIENTO_NUEVO', payload: data });
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            setError('Error al obtener los datos');
        }
    };
    useEffect(() => {
        fetchEquipos();
        fetchEventos();
        fetchSalas();
        fetchTecnicos();
        fetchUps();
        fetchMantenimiento();
    }, []);

    return (<>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <NavBar onMenuClick={toggleDrawer(true)} handleLogout={handleLogout} user={user} />

            <><SideMenu open={drawerOpen} onClose={toggleDrawer(false)} equipos={equipos} salas={salas} onNewEquipClick={() => setOpenEquipModal(true)} />
                <NewEquipamentModal
                    open={openEquipModal}
                    onClose={() => setOpenEquipModal(false)}
                    sala={salas}
                />
            </>

            <div style={{ display: 'flex' }}>
                <div style={{ flex: 1 }}>
                    <Routes>
                        {/* Ruta principal al ingresar */}
                        <Route path="/cmms/*"
                            element={<Dashboard
                                salas={salas}
                                tecnicos={tecnicos}
                                estadoEquipos={estadoEquipos}
                            />} />
                        <Route path="/ups" element={<UpsDashboard salas={salas} ups={ups} />} />
                        <Route path="/reportEquipament" element={<ReportEquipament equipos={equipos} salas={salas} />} />
                    </Routes>
                    <Outlet />
                </div>
            </div>
            <Footer />
        </Box>
    </>
    );
};

export default Layout;
