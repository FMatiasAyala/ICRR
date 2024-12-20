import React, { useState } from "react";
import { Card, CardContent, Typography, Modal, ListItemIcon } from "@mui/material";
import FormContratos from "../Form/FormContratos";
import { FileCopyTwoTone } from "@mui/icons-material";


const ContratoFormModal = ({equipos, salas}) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (

        <Card
            onClick={handleOpen}
            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#0277bd', color: 'white' }, transition: 'background-color 0.3s ease' }}
        >
            <CardContent
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    flexDirection: { xs: 'column', sm: 'row' }, // Cambia la orientación en móvil
                    textAlign: 'center',
                }}
            >
                <ListItemIcon>
                    <FileCopyTwoTone/>
                </ListItemIcon>
                <Typography sx={{ fontWeight: 'bold' }}>Cargar contrato</Typography>
            </CardContent>
            <Modal open={open} onClose={handleClose}>
                <FormContratos handleClose={handleClose}  equipo={equipos} salas={salas}/>
            </Modal>
        </Card>


    );
};

export default ContratoFormModal;
