import React, { useState } from "react";
import { Box, TextField, Button, Modal, Typography, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { apiModificacionTecnico } from "../utils/Fetch";

const EditTechnician = ({ technicianData, openEditModal, setOpenEditModal }) => {
    const [formData, setFormData] = useState({
        nombre: technicianData?.nombre || "",
        apellido: technicianData?.apellido || "",
        numero: technicianData?.numero || "",
        email: technicianData?.email || "",
        cobertura: technicianData?.cobertura || "",
        empresa: technicianData?.empresa || "",
    });

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
                alert("Técnico actualizado correctamente");
                setOpenEditModal(false);
            } else {
                alert("Error al actualizar técnico");
            }
        } catch (error) {
            console.error("Error en la actualización:", error);
        }
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
                    <TextField label="Número" name="numero" value={formData.numero} onChange={handleChange} fullWidth required />
                    <TextField label="Email" name="email" value={formData.email} onChange={handleChange} fullWidth />
                    <TextField label="Especialidad" name="cobertura" value={formData.cobertura} onChange={handleChange} fullWidth required />
                    <TextField label="Empresa" name="empresa" value={formData.empresa} onChange={handleChange} fullWidth required />

                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Guardar Cambios
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditTechnician;
