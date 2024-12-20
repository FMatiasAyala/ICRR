import React, {useState} from "react";
import { Card, Box, CardContent, Typography, Modal } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FormEquipament from "../Form/FormEquipament";

const FormEquipamentModal = ({ onEventCreate, equipo, salas }) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);



    return (
        <Box display="flex" flexDirection="column" gap={2}>
            <Card
                onClick={handleOpen}
                sx={{
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: '16px',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        color: '#fff',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                    },
                }}
            >
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <AddCircleOutlineIcon sx={{ fontSize: '2rem', color: '#00796b' }} />
                </CardContent>
            </Card>

            <Modal open={open} onClose={handleClose} closeAfterTransition>
                <FormEquipament open={open} handleClose={handleClose} onEventCreate={onEventCreate} equipo ={equipo} salas={salas}/>
            </Modal>
        </Box>
    );
};

export default FormEquipamentModal;
