import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Modal,
    ListItemIcon,
    Card,
    CardContent,
    IconButton,
    Grid,
    Tabs,
    Tab,
    TextField
} from '@mui/material';
import HandymanIcon from '@mui/icons-material/Handyman';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Close, Search } from '@mui/icons-material';
import { apiTecnicos } from '../../components/utils/Fetch';

const TechniciansList = () => {
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [open, setOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const response = await fetch(apiTecnicos);
                const data = await response.json();
                setTechnicians(data);
            } catch (error) {
                console.error('Error fetching technicians:', error);
            }
        };
        fetchTechnicians();
    }, []);

    // Filtrar técnicos según la búsqueda
    const filteredTechnicians = technicians.filter((tech) =>
        tech.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChange = (_, newValue) => {
        if (newValue < filteredTechnicians.length) {
            setSelectedTab(newValue);
        }
    };

    useEffect(() => {
        if (filteredTechnicians.length === 0) {
            setSelectedTab(0);
        } else if (selectedTab >= filteredTechnicians.length) {
            setSelectedTab(0);
        }
    }, [filteredTechnicians]);

    return (
        <>
            {/* Botón para abrir el modal */}
            <Card
                onClick={() => setOpen(true)}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#0277bd', color: 'white' }, transition: 'background-color 0.3s ease' }}
            >
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexDirection: { xs: 'column', sm: 'row' }, textAlign: 'center' }}>
                    <ListItemIcon>
                        <HandymanIcon />
                    </ListItemIcon>
                    <Typography sx={{ fontWeight: 'bold' }}>Ficha de técnicos</Typography>
                </CardContent>
            </Card>

            {/* Modal */}
            <Modal open={open} onClose={() => setOpen(false)}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 900 },
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        borderRadius: 4,
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <IconButton onClick={() => setOpen(false)} sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <Close />
                    </IconButton>

                    <Typography variant="h4" align="center" sx={{ color: '#004d99', mb: 2 }}>
                        Ficha de técnicos
                    </Typography>

                    {/* Campo de búsqueda */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Search sx={{ color: "gray", mr: 1 }} />
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Buscar técnico..."
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Box>

                    {/* Tabs */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, height: '50vh' }}>
                        <Tabs
                            orientation="vertical"
                            value={selectedTab}
                            onChange={handleChange}
                            variant="scrollable"
                            sx={{
                                flexShrink: 0,
                                overflowY: 'auto',
                                minWidth: { xs: '100%', sm: 200 }, // Ajuste responsivo
                                borderRight: { sm: 1, xs: 0 }, // Borde solo en pantallas grandes
                                mb: { xs: 2, sm: 0 } // Margen en móviles
                            }}
                        >
                            {filteredTechnicians.length > 0 ? (
                                filteredTechnicians.map((tech, index) => (
                                    <Tab key={index} label={tech.nombre} />
                                ))
                            ) : (
                                <Typography align="center" sx={{ color: "gray", mt: 2 }}>
                                    No se encontraron técnicos
                                </Typography>
                            )}
                        </Tabs>

                        {/* Contenido de cada Tab */}
                        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
                            {filteredTechnicians.map((tech, index) => (
                                <TabPanel key={index} value={selectedTab} index={index}>
                                    <Card sx={{ p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                                        <CardContent sx={{ textAlign: "center" }}>
                                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                                {tech.nombre} {tech.apellido}
                                            </Typography>
                                            <Typography variant="body2">
                                                Empresa: {tech.empresa}
                                            </Typography>
                                            <Typography variant="body2">
                                                Contacto: {tech.numero}
                                            </Typography>
                                            <Typography variant="body2">
                                                Especialidad: {tech.cobertura}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </TabPanel>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

// Componente de TabPanel para mostrar contenido según la pestaña activa
const TabPanel = ({ children, value, index }) => {
    return value === index ? <Box sx={{ p: 2 }}>{children}</Box> : null;
};

export default TechniciansList;
