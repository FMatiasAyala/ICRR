import React, { useState, forwardRef, useEffect } from 'react';
import { Box, Typography, TextField, Button, Snackbar, Alert, MenuItem, FormControl, InputLabel, Select, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { format, set } from 'date-fns';
import { apiCargaContrato } from '../../utils/Fetch';


const FormContratos = forwardRef(({ contratoClose, equipo, salas }, ref) => {
    const [description, setDescription] = useState('');
    const [update, setUpdate] = useState('');
    const [desde, setDesde] = useState(null);
    const [hasta, setHasta] = useState(null);
    const [idEquipo, setIdEquipo] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
    const [coberturaPartes, setCoberturaPartes] = useState(''); // Nuevo estado
    const [coberturaManoDeObra, setCoberturaManoDeObra] = useState(''); // Nuevo estado
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');




    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        console.log('aca deberia estar le id', idEquipo);

        if (!selectedFile) {
            setSnackbarMessage('Por favor, seleccione un archivo.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }


        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('descripcion', description);
        formData.append('actualizacion', update);
        formData.append('desde', desde ? format(desde, 'yyyy-MM-dd') : null);
        formData.append('hasta', hasta ? format(hasta, 'yyyy-MM-dd') : null);
        formData.append('cobertura_partes', coberturaPartes); // Nuevo campo
        formData.append('cobertura_manoDeObra', coberturaManoDeObra);
        formData.append('id_equipo', idEquipo); // Nuevo campo


        try {
            const response = await fetch(apiCargaContrato, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setSnackbarMessage('Contrato cargado exitosamente.');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                handleClose();
            } else {
                throw new Error('Error al cargar el contrato.');

            }
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Error al cargar el contrato.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };


    // Filtrar equipos según el término de búsqueda por nombre, servicio 
    const filteredEquipos = Array.isArray(equipo) ? equipo.filter(equipo =>
        equipo?.modelo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        equipo?.servicio?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];


    // Mostrar info del equipo seleccionado
    const handleEquipoSeleccionado = (equipoId) => {
        setIdEquipo(equipoId);
        if (equipoId) {
            const equipoEncontrado = equipo.find(e => e.id === equipoId);
            setIdEquipo(equipoId);

            setEquipoSeleccionado(equipoEncontrado);
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
            <IconButton onClick={contratoClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
                <Close />
            </IconButton>
            <Typography variant="h6" mb={2}>Cargar Contrato</Typography>
            <form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center" gap={2} mb={2}>
                    <TextField
                        label="Buscar por nombre, sala o servicio"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                    />
                    <FormControl fullWidth>
                        <InputLabel>Seleccionar Equipo</InputLabel>
                        <Select
                            value={idEquipo}
                            onChange={(e) => handleEquipoSeleccionado(e.target.value)}
                            required
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 200,
                                        overflowY: 'auto',
                                    },
                                },
                            }}
                        >
                            {filteredEquipos.map((equipo) => (
                                <MenuItem key={equipo.id} value={equipo.id}>
                                    {equipo.modelo} ({salas.find(sala => sala.ubicacion === equipo.sala)?.sala || 'Desconocida'})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box>
                    <TextField
                        label="Observacion"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        sx={{ marginBottom: '5px' }}
                        rows={3}
                        required
                    />
                </Box>
                <Box>
                    <TextField
                        label="Actualizacion"
                        value={update}
                        onChange={(e) => setUpdate(e.target.value)}
                        fullWidth
                        multiline
                        sx={{ marginBottom: '5px' }}
                        rows={3}
                        required
                    />
                </Box>

                {/* Campos adicionales */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Cobertura Partes"
                        value={coberturaPartes}
                        onChange={(e) => setCoberturaPartes(e.target.value)}
                        sx={{ marginBottom: '5px' }}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Cobertura Mano de Obra"
                        value={coberturaManoDeObra}
                        onChange={(e) => setCoberturaManoDeObra(e.target.value)}
                        sx={{ marginBottom: '5px' }}
                        fullWidth
                        required
                    />
                </Box>

                {/* Botones */}
                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="contained" color="primary" type="submit">Guardar</Button>
                </Box>
            </form>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
});

export default FormContratos;
