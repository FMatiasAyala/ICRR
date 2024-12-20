import React, {useState} from "react";
import { Card, Box, CardContent, Typography, Modal } from "@mui/material";
import FormChangePass from "./FormChangePass";

const ModalChangePass = () => {
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
                    <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>
                        Cambiar clave
                    </Typography>
                </CardContent>
            </Card>

            <Modal open={open} onClose={handleClose} closeAfterTransition>
                <FormChangePass/>
            </Modal>
        </Box>
    );
};

export default ModalChangePass;
