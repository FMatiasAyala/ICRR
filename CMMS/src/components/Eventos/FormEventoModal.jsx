import React, { useState } from "react";
import { Card, Box, CardContent, Modal, useMediaQuery, Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FormEvento from "./FormEvento";

const FormEventoModal = ({ equipo, salas }) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const isMobile = useMediaQuery("(max-width:600px)");

    return (
        <Box display="flex" flexDirection="column" gap={2} alignItems="center">
            <Card
                onClick={handleOpen}
                sx={{
                    cursor: "pointer",
                    p: isMobile ? 0.5 : 1,
                    borderRadius: "16px",
                    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#ffffff",
                    transition: "all 0.3s ease-in-out",
                    width: isMobile ? "80px" : "auto",
                    height: isMobile ? "80px" : "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    "&:hover": {
                        color: "#00796b",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                    },
                }}
            >
                <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                    <AddCircleOutlineIcon sx={{ fontSize: isMobile ? "1.5rem" : "2rem", color: "#00796b" }} />
                    <Typography>Nuevo evento</Typography>
                </CardContent>
            </Card>

            <Modal open={open} onClose={handleClose} closeAfterTransition>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                    <FormEvento open={open} handleClose={handleClose} equipo={equipo} salas={salas} />
                </Box>
            </Modal>
        </Box>
    );
};

export default FormEventoModal;
