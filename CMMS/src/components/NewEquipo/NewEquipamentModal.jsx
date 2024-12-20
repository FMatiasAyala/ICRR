import React, { useState } from "react";
import { Card, CardContent, Typography, Modal,ListItemIcon } from "@mui/material";
import NewEquipamentForm from "./NewEquipamentForm";
import { QueuePlayNextTwoTone } from "@mui/icons-material";


const NewEquipamentModal = ({sala}) => {
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
                    <QueuePlayNextTwoTone />
                </ListItemIcon>
                <Typography sx={{ fontWeight: 'bold' }}>Alta de equipo</Typography>
            </CardContent>
            <Modal open={open} onClose={handleClose}>
                <NewEquipamentForm handleClose={handleClose} sala={sala}/>
            </Modal>
        </Card>


    );
};

export default NewEquipamentModal;