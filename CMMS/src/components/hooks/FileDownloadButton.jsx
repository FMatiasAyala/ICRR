import React, { useState } from "react";
import { Button, Snackbar, Alert, Box, IconButton, Typography } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";

const FileDownloadButton = ({
  endpoint,
  params = {}, // Ejemplo: { id_evento: 5 }
  label = "Descargar archivo",
  icono = <DescriptionIcon />,
  mensajeExito = "Descarga exitosa",
  mensajeError = "No hay archivos cargados",
}) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const buildQueryString = (paramsObj) =>
    new URLSearchParams(paramsObj).toString();
  const downloadFile = async () => {
    try {
      const queryString = buildQueryString(params);
      console.log(params.id_evento)
      const urlCompleta = `${endpoint}?${queryString}`;
      console.log(urlCompleta)
      const response = await fetch(urlCompleta);
      console.log(response)
      if (!response.ok) throw new Error("No hay archivos cargados");

      // Intenta obtener el nombre de archivo desde Content-Disposition
      let filename = `Adjuntos`;
      const disposition = response.headers.get("Content-Disposition");
      if (disposition) {
        const utf8Match = disposition.match(/filename\*=UTF-8''(.+)/);
        if (utf8Match && utf8Match[1]) {
          filename = decodeURIComponent(utf8Match[1]);
        } else {
          const asciiMatch = disposition.match(/filename="?([^"]+)"?/);
          if (asciiMatch && asciiMatch[1]) {
            filename = asciiMatch[1];
          }
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSnackbarMessage(mensajeExito);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      setSnackbarMessage(mensajeError);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <IconButton onClick={downloadFile}>
        {icono}
        <Typography> {label} </Typography>
      </IconButton>
      <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} autoHideDuration={4000}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FileDownloadButton;
