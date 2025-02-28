import { useState } from "react";
import { Box, Button, Modal, IconButton, Typography } from "@mui/material";
import { AddCircleOutline, Close } from "@mui/icons-material";
import NewTechinicianForm from "./FormTechnician";

const NewTechnician = ({ equipos, salas }) => {
    const [open, setOpen] = useState(false);

    const handleOpenModal = () => {
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
    };

    return (
        <>
            {/* Botón estilizado */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddCircleOutline />}
                    sx={{
                        fontSize: '16px',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        textTransform: 'none',
                        width: { xs: '100%', sm: 'auto' },
                        boxShadow: 2,
                        transition: '0.3s',
                        '&:hover': {
                            backgroundColor: '#1565c0',
                            transform: 'scale(1.05)'
                        }
                    }}
                    onClick={handleOpenModal}
                >
                    Alta Técnico
                </Button>
            </Box>

            {/* Modal estilizado */}
            <Modal open={open} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'white',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        minWidth: { xs: '90%', sm: 400 },
                        maxWidth: 600,
                        textAlign: 'center'
                    }}
                >
                    {/* Encabezado del modal */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Registrar Nuevo Técnico
                        </Typography>
                        <IconButton onClick={handleCloseModal} sx={{ color: 'gray' }}>
                            <Close />
                        </IconButton>
                    </Box>

                    {/* Formulario */}
                    <NewTechinicianForm equipos={equipos} salas={salas} />
                </Box>
            </Modal>
        </>
    );
};

export default NewTechnician;
