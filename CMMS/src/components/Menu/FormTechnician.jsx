import React, { useState } from "react";
import { TextField, Button, Grid, Box, Typography, Snackbar, Alert, Autocomplete } from "@mui/material";
import { apiAltaTecnico } from "../utils/Fetch";

const NewTechnicianForm = ({ equipos, salas }) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        empresa: "",
        cobertura: "",
        numero: "",
        email: "",
        id_equipo: [],
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validar que los campos obligatorios no estén vacíos
        if (!formData.nombre || !formData.apellido || !formData.empresa) {
            setError("Por favor, completa los campos obligatorios.");
            return;
        }

        try {
            const response = await fetch(apiAltaTecnico, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setFormData({
                    nombre: "",
                    apellido: "",
                    empresa: "",
                    cobertura: "",
                    numero: "",
                    email: "",
                    id_equipo: ""
                });
                setSnackbarMessage('Técnico guardado correctamente.');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            } else {
                setSnackbarMessage(data.message || 'Error al guardar el técnico.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        } catch (err) {
            setError("Error al conectar con el servidor.");
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    return (
        <Box sx={{ p: 3, maxWidth: 500, mx: "auto", mt: 2, boxShadow: 3, borderRadius: 2, bgcolor: 'white' }}>
            <Typography variant="h6" align="center" gutterBottom>
                Alta de Técnico
            </Typography>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} required />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Empresa" name="empresa" value={formData.empresa} onChange={handleChange} required />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Cobertura" name="cobertura" value={formData.cobertura} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Contacto" name="numero" type="number" value={formData.numero} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Email" name="email" type="mail" value={formData.email} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            options={equipos}
                            getOptionLabel={(option) =>
                                `${option.modelo} - ${option.servicio} (${salas.find(sala => sala.id_sala === option.sala)?.sala || 'Desconocida'})`
                            }
                            onChange={(event, newValue) =>
                                setFormData({ ...formData, id_equipo: newValue.map(equipos => equipos.id)})
                            }
                            renderInput={(params) => (
                                <TextField {...params} label="Seleccionar Equipo" margin="normal"  />
                            )}
                        />
                    </Grid>
                </Grid>

                {error && <Typography color="error" mt={2}>{error}</Typography>}

                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                    Agregar Técnico
                </Button>
            </form>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default NewTechnicianForm;
