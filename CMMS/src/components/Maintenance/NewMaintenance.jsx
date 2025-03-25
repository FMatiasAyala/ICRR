import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Modal } from '@mui/material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import FormMaintenance from '../Form/FormMaintenance';



const NewMaintenance = ({ equipos, tecnicos, salas }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        sx={{
          width: { xs: '100%', sm: 'auto' },
          padding: { xs: 2, sm: 0 },
          alignItems: 'center',
        }}
      >
        <Card
          onClick={handleOpen}
          sx={{
            cursor: "pointer",
            p: { xs: 2, sm: 1 },
            width: { xs: "100%", sm: "200px" },
            borderRadius: "16px",
            backgroundColor: "#ffffff",
            transition: "all 0.3s ease-in-out",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "&:hover": {
              backgroundColor: "#00796b",
              boxShadow: "0px 6px 15px rgba(0, 121, 107, 0.3)",
              "& .icono": {
                color: "#fff", // Cambia color del icono al pasar el mouse
              },
              "& .texto": {
                color: "#fff", // Cambia color del texto al pasar el mouse
              },
            },
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              flexDirection: { xs: "column", sm: "row" },
              textAlign: "center",
            }}
          >
            <BuildCircleIcon
              className="icono"
              sx={{
                fontSize: "1.5rem",
                color: "#00796b",
                transition: "all 0.3s ease-in-out",
              }}
            />
            <Typography
              className="texto"
              sx={{
                fontWeight: "bold",
                fontSize: "0.8rem",
                color: "#333",
                transition: "all 0.3s ease-in-out",
              }}
            >
              Programar Mantenimiento
            </Typography>
          </CardContent>
        </Card>


        {/* Modal */}
        <Modal open={open} onClose={handleClose}>
          <FormMaintenance equipos={equipos} tecnicos={tecnicos} salas={salas} tecnihandleClose={handleClose} />
        </Modal>
      </Box>

    </>
  );
};

export default NewMaintenance;
