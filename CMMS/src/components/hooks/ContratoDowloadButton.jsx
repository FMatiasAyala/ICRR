import React, { useState } from "react";
import { Snackbar, Alert, Box, IconButton } from "@mui/material";


const ContratoDownloadButton = ({
  endpoint,
  params = {},
  label = "Descargar contrato",
  mensajeExito = "Contrato descargado exitosamente",
  mensajeError = "Error al descargar el contrato",
}) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const buildQueryString = (paramsObj) =>
    new URLSearchParams(paramsObj).toString();

  const downloadFile = async () => {
    try {
      const queryString = buildQueryString(params);
      const urlCompleta = `${endpoint}?${queryString}`;
      const response = await fetch(urlCompleta);

      if (!response.ok) throw new Error("Error al descargar el contrato");

      // Intentar obtener el nombre del archivo del header Content-Disposition
      let filename = "contrato.pdf";
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
      console.error("Error al descargar el contrato:", error);
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
      <IconButton onClick={downloadFile} title={label}>
        {label}
      </IconButton>
      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        autoHideDuration={4000}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContratoDownloadButton;
