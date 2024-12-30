import React, { useState, useEffect } from 'react';
import { Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import SideMenu from '../Menu/SideMenu';
import NavBar from '../NavBar';
import Dashboard from './Dashboard';
import { apiEquipos, apiSalas } from '../../utils/Fetch';
import EquipamentsVarious from './EquipamentsVarious';


const Layout = () => {
    const [equipos, setEquipos] = useState([]);
    const [salas, setSalas] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
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
            setEquipos(data);
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
    useEffect(() => {
        fetchEquipos();
        fetchSalas();
    }, []);
    return (<>

        <NavBar onMenuClick={toggleDrawer(true)} handleLogout={handleLogout} />
        <SideMenu open={drawerOpen} onClose={toggleDrawer(false)} equipos={equipos} salas={salas} />
        <div style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
                <Routes>
                    {/* Ruta principal al ingresar */}
                    <Route path="/cmms" element={<Dashboard />} />
                    <Route path="/ups" element={<EquipamentsVarious equipos={equipos} salas = {salas} />} />
                </Routes>
                <Outlet />
            </div>
        </div>
    </>
    );
};

export default Layout;
