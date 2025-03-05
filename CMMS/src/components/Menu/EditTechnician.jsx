import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Modal, Typography, IconButton, Snackbar, Alert } from "@mui/material";
import { Close } from "@mui/icons-material";
import { apiModificacionTecnico } from "../utils/Fetch";

const EditTechnician = ({ technicianData, openEditModal, setOpenEditModal, reloadTechnicians }) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        numero: "",
        email: "",
        cobertura: "",
        empresa: "",
    });

    // Se ejecuta cada vez que cambia technicianData o se abre el modal
    useEffect(() => {
        if (technicianData) {
            setFormData({
                nombre: technicianData.nombre || "",
                apellido: technicianData.apellido || "",
                numero: technicianData.numero || "",
                email: technicianData.email || "",
                cobertura: technicianData.cobertura || "",
                empresa: technicianData.empresa || "",
            });
        }
    }, [technicianData, openEditModal]); // Dependencias para actualizar los valores

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiModificacionTecnico}${technicianData.id_tecnico}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                reloadTechnicians();
                setSnackbarMessage('Técnico guardado correctamente.');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            } else {
                setSnackbarMessage(data.message || 'Error al guardar el técnico.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        } catch (error) {
            console.error("Error en la actualización:", error);
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    return (
        <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: { xs: "90%", sm: 500 },
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}
            >
                <IconButton
                    onClick={() => setOpenEditModal(false)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                >
                    <Close />
                </IconButton>

                <Typography variant="h6" sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}>
                    Editar Técnico
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth required />
                    <TextField label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} fullWidth required />
                    <TextField label="Número" name="numero" value={formData.numero} onChange={handleChange} fullWidth />
                    <TextField label="Email" name="email" value={formData.email} onChange={handleChange} fullWidth />
                    <TextField label="Cobertura" name="cobertura" value={formData.cobertura} onChange={handleChange} fullWidth />
                    <TextField label="Empresa" name="empresa" value={formData.empresa} onChange={handleChange} fullWidth />

                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Guardar Cambios
                    </Button>
                </Box>
                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Modal>
    );
};

export default EditTechnician;
