import React, { useState } from "react";
import { Modal, IconButton, Box, Button } from "@mui/material";
import FormContratos from "./FormContratos";
import { AddCircleOutlineOutlined } from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';


const ContratoFormModal = ({ open, onOpen, onClose, equipo, salas }) => {
    return (
        <Box display="flex" justifyContent="center" mt={3}>
            <Button
                onClick={onOpen}
                variant="outlined"
                startIcon={<AddCircleOutlineOutlined sx={{ fontSize: '2rem' }} />}
                sx={{
                    px: 4,
                    py: 2,
                    borderRadius: 3,
                    borderWidth: 2,
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: '#00796b',
                    borderColor: '#00796b',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    '&:hover': {
                        backgroundColor: '#00796b',
                        color: '#fff',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                        borderColor: '#00796b',
                    }
                }}
            >
                Nuevo contrato
            </Button>

            <Modal open={open} onClose={onClose}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        width: '90%',
                        maxWidth: 600,
                        outline: 'none',
                    }}
                >
                    <IconButton
                        onClick={onClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <FormContratos contratoClose={onClose} equipo={equipo} salas={salas} />
                </Box>
            </Modal>
        </Box>

    );
};

export default ContratoFormModal;
