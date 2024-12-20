import React, {useState} from "react";
import { Button, Snackbar, Alert } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import { apiContrato } from "../../utils/Fetch";

const FileDownloadButton = ({ equipo }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const downloadFile = async (idEquipo) => {
    try {
      const response = await fetch(`${apiContrato}?id_equipo=${idEquipo}`);

        if (!response.ok) {
        throw new Error("Error al descargar el archivo");
      }

      // Convertir la respuesta en un Blob
      const blob = await response.blob();

      // Crear una URL para el Blob
      const url = window.URL.createObjectURL(blob);

      // Crear un enlace temporal para forzar la descarga
      const link = document.createElement("a");
      link.href = url;
      link.download = `contrato-${idEquipo}.pdf`; // Nombre del archivo
      document.body.appendChild(link);
      link.click();

      // Limpiar el enlace después de descargar
      link.remove();
      window.URL.revokeObjectURL(url);
      setSnackbarMessage("Descarga con exito");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      setSnackbarMessage("No hay contrato cargado");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
        return;
    }
    setSnackbarOpen(false);
};

  return (
    <>
        <Button
      variant="contained"
      startIcon={<DescriptionIcon />}
      sx={{
        backgroundColor: "#00796b",
        color: "#fff",
        "&:hover": {
          backgroundColor: "#004d40",
        },
      }}
      onClick={() => downloadFile(equipo.id)} // Aquí envolvemos la función en un callback
    >
      Descargar Contrato
    </Button>
        <Snackbar open={snackbarOpen}  onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
        </Alert>
    </Snackbar>
    </>

  );
};

export default FileDownloadButton;
