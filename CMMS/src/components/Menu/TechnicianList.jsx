import React, { useState, useEffect } from 'react';
import { Box, Typography, Modal, ListItemIcon, Card, CardContent, IconButton, Grid } from '@mui/material';
import HandymanIcon from '@mui/icons-material/Handyman';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { apiTecnicos } from '../../components/utils/Fetch';
import { Close } from '@mui/icons-material';
const TechniciansList = () => {
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [open, setOpen] = useState(false);

    const handleOpenGeneral = () => {
        setSelectedTechnician(null); // Asegurarse de que no haya ningún técnico seleccionado
        setOpen(true);
    };

    const handleOpenDetails = (technician) => {
        setSelectedTechnician(technician);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedTechnician(null);
    };

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

    return (
        <>
            {/* Botón para abrir el modal general */}
            <Card onClick={handleOpenGeneral} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#0277bd', color: 'white' }, transition: 'background-color 0.3s ease' }}>
                <CardContent
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        flexDirection: { xs: 'column', sm: 'row' }, // Cambia la orientación en móvil
                        textAlign: 'center',
                    }}>
                    <ListItemIcon>
                        <HandymanIcon /> {/* Icono de grupo (puedes cambiarlo por otro según lo necesites) */}
                    </ListItemIcon>
                    <Typography sx={{ fontWeight: 'bold' }}>
                        Ficha de tecnicos</Typography>
                </CardContent>
            </Card>

            {/* Modal que muestra la lista general o los detalles del técnico */}
            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 700,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        borderRadius: 4,
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',

                    }}
                >
                    <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <Close />
                    </IconButton>
                    <Box display="flex" alignItems="center" mb={2}>
                        <Typography variant="h4" gutterBottom align="center" sx={{ color: '#004d99' }}>Ficha de tecnicos</Typography>
                    </Box>
                    {selectedTechnician ? (
                        // Si hay un técnico seleccionado, mostrar sus detalles
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }} >
                                <IconButton onClick={() => setSelectedTechnician(null)}>
                                    <ArrowBackIcon />
                                </IconButton>
                            </Box >
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: '#bbdefb',
                                        boxShadow: 1,
                                        borderRadius: '8px',
                                        borderLeft: '5px solid #1e88e5',
                                    }}>
                                        <Typography variant="body1" sx={{ color: '#1e88e5' }}>
                                            Nombre: <strong>{selectedTechnician.nombre}</strong>
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        mt: 2,
                                        p: 2,
                                        bgcolor: '#bbdefb',
                                        boxShadow: 1,
                                        borderRadius: '8px',
                                        borderLeft: '5px solid #1e88e5',
                                    }}>
                                        <Typography variant="body1" sx={{ color: '#1e88e5' }}>
                                            Empresa: <strong>{selectedTechnician.empresa}</strong>
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={6}>
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: '#bbdefb',
                                        boxShadow: 1,
                                        borderRadius: '8px',
                                        borderLeft: '5px solid #1e88e5',
                                    }}>

                                        <Typography variant="body1" sx={{ color: '#1e88e5' }}>
                                            Número: <strong>{selectedTechnician.numero}</strong>
                                        </Typography>
                                    </Box>
                                    {selectedTechnician.serial_number && (
                                        <Box sx={{
                                            mt: 2,
                                            p: 2,
                                            bgcolor: '#bbdefb',
                                            boxShadow: 1,
                                            borderRadius: '8px',
                                            borderLeft: '5px solid #1e88e5',
                                        }}>
                                            <Typography variant="body1" sx={{ color: '#1e88e5' }}>
                                                Serial Number: <strong>{selectedTechnician.serial_number}</strong>
                                            </Typography>
                                        </Box>
                                    )}

                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{
                                    mt: 2,
                                    p: 2,
                                    bgcolor: '#bbdefb',
                                    boxShadow: 1,
                                    borderRadius: '8px',
                                    borderLeft: '5px solid #1e88e5',
                                    textAlign: 'center',
                                }}>


                                    <Typography variant="body1" sx={{ color: '#1e88e5' }}>
                                        Cobertura: <strong>{selectedTechnician.cobertura}</strong>
                                    </Typography>

                                </Box>


                            </Grid>

                        </>
                    ) : (
                        // Si no hay técnico seleccionado, mostrar la lista general de técnicos
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: 2,
                                p: 2,
                                backgroundColor: '#f5f5f5',
                                borderRadius: '8px',
                            }}
                        >
                            {technicians.map((technician) => (
                                <Card
                                    key={technician.id}
                                    onClick={() => handleOpenDetails(technician)}
                                    sx={{
                                        cursor: 'pointer',
                                        backgroundColor: 'white',
                                        '&:hover': {
                                            backgroundColor: '#e3f2fd',
                                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                            transform: 'translateY(-5px)',
                                        },
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0288d1' }}>{technician.nombre}</Typography>
                                        <Typography variant="body2" sx={{ color: '#757575' }}>{technician.empresa}</Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </Box>
            </Modal>
        </>
    );
};

export default TechniciansList;
