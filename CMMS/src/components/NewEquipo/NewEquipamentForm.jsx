import React, { useState, forwardRef, useEffect } from 'react';
import { Box, Typography, TextField, Button, Snackbar, Alert, Autocomplete } from '@mui/material';
import { AccountCircle, Build, Cloud, CalendarToday } from '@mui/icons-material';
import { apiAltaEquipos } from '../../components//utils/Fetch';


const NewEquipamentForm = forwardRef(({ handleClose, sala }, ref) => {
    const [modelo, setModelo] = useState('');
    const [marca, setMarca] = useState('');
    const [servicio, setServicio] = useState('');
    const [aetitle, setAetitle] = useState('');
    const [compra, setCompra] = useState('');
    const [mascara, setMascara] = useState('');
    const [ip, setIp] = useState('');
    const [tipo, setTipo] = useState('');
    const [puerto, setPuerto] = useState(''); // Nuevo estado
    const [gateway, setGateway] = useState(''); // Nuevo estado
    const [serialNumber, setSerialNumber] = useState('');
    const [selectedSala, setSelectedSala] = useState(null)
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');



    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();


        const nuevoEquipo = {
            marca: marca,
            modelo: modelo,
            serial_number: serialNumber,
            tipo: tipo,
            servicio: servicio,
            ip: ip,
            mascara: mascara,
            gateway: gateway,
            aetitle: aetitle,
            puerto: puerto, 
            compra_año: compra,
            sala: selectedSala.id_sala,
        }
        try {
            const response = await fetch(apiAltaEquipos, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                  },
                body: JSON.stringify(nuevoEquipo),
            });

            if (response.ok) {
                setSnackbarMessage('Contrato cargado exitosamente.');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                handleClose();
            } else {
                const error = await response.json();
                console.error('Error del servidor:', error);
                throw new Error('Error al cargar el contrato.');
            }
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Error al cargar el contrato.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };


    return (
        <Box
            ref={ref}
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: 600 },
                bgcolor: 'background.paper',
                boxShadow: 24,
                borderRadius: 4,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
            }}
        >
            <Typography variant="h5" mb={2}>Alta de equipo médico</Typography>
            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                        label="Modelo"
                        value={modelo}
                        variant="outlined" // Label fuera del input
                        sx={{ marginBottom: '10px' }}
                        onChange={(e) => setModelo(e.target.value)}
                        fullWidth
                        required
                        InputProps={{
                            startAdornment: (
                                <AccountCircle sx={{ marginRight: '8px' }} />
                            ),
                        }}
                    />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Marca"
                        value={marca}
                        variant="outlined"
                        sx={{ marginBottom: '10px' }}
                        onChange={(e) => setMarca(e.target.value)}
                        fullWidth
                        required
                        InputProps={{
                            startAdornment: (
                                <Build sx={{ marginRight: '8px' }} />
                            ),
                        }}
                    />
                    <TextField
                        label="Servicio"
                        value={servicio}
                        variant="outlined"
                        sx={{ marginBottom: '10px' }}
                        onChange={(e) => setServicio(e.target.value)}
                        fullWidth
                        required
                        InputProps={{
                            startAdornment: (
                                <Cloud sx={{ marginRight: '8px' }} />
                            ),
                        }}
                    />
                </Box>
                {/* Campos adicionales */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Serial Number"
                        value={serialNumber}
                        variant="outlined"
                        sx={{ marginBottom: '10px' }}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <AccountCircle sx={{ marginRight: '8px' }} />
                            ),
                        }}
                    />
                    <TextField
                        label="Tipo"
                        value={tipo}
                        variant="outlined"
                        onChange={(e) => setTipo(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <Build sx={{ marginRight: '8px' }} />
                            ),
                        }}
                    />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="AETITLE"
                        value={aetitle}
                        variant="outlined"
                        sx={{ marginBottom: '10px' }}
                        onChange={(e) => setAetitle(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <Cloud sx={{ marginRight: '8px' }} />
                            ),
                        }}
                    />
                    <TextField
                        label="Máscara"
                        value={mascara}
                        variant="outlined"
                        sx={{ marginBottom: '10px' }}
                        onChange={(e) => setMascara(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <Cloud sx={{ marginRight: '8px' }} />
                            ),
                        }}
                    />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Gateway"
                        value={gateway}
                        variant="outlined"
                        sx={{ marginBottom: '10px' }}
                        onChange={(e) => setGateway(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <Cloud sx={{ marginRight: '8px' }} />
                            ),
                        }}
                    />
                    <TextField
                        label="Puerto"
                        type="number"
                        value={puerto}
                        variant="outlined"
                        sx={{ marginBottom: '10px' }}
                        onChange={(e) => setPuerto(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <Cloud sx={{ marginRight: '8px' }} />
                            ),
                        }}
                    />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="IP"
                        value={ip}
                        variant="outlined"
                        sx={{ marginBottom: '10px' }}
                        onChange={(e) => setIp(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <Cloud sx={{ marginRight: '8px' }} />
                            ),
                        }}
                    />
                    <TextField
                        label="Año de compra"
                        value={compra}
                        type="number"
                        variant="outlined"
                        sx={{ marginBottom: '10px' }}
                        onChange={(e) => setCompra(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <CalendarToday sx={{ marginRight: '8px' }} />
                            ),
                        }}
                    />
                </Box>
                <Autocomplete
                    options={sala}
                    value={selectedSala}
                    onChange={(event, newValue) => setSelectedSala(newValue)}
                    isOptionEqualToValue={(option, value) => option.id_sala === value.id_sala} // Comparar por ID único
                    getOptionLabel={(option) => `${option.sala} - ${option.sector}`}
                    renderInput={(params) => (
                        <TextField {...params} label="Seleccionar Sala" margin="normal" required />
                    )}
                />

                {/* Botones */}
                < Box mt={3} display="flex" justifyContent="flex-end" gap={2} >
                    <Button variant="contained" color="primary" type="submit">Cargar equipo</Button>
                </Box >
            </form >
            {/* Snackbar */}
            < Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar >
        </Box >
    );
});

export default NewEquipamentForm;
