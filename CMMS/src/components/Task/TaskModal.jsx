import React, { useState, useEffect } from "react";
import { Box, Typography, Modal, Tabs, Tab, Card, CardContent, TextField, IconButton, useMediaQuery } from "@mui/material";
import { Close, Search, ArrowBack } from "@mui/icons-material";
import TaskMobile from "./TaskMobile";
const TaskModal = ({ open, handleClose, currentTasks, equipos, salas }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const isMobile = useMediaQuery('(max-width: 600px)');

  const obtenerEquipo = (id_equipo) => {
    const equipo = equipos.find((e) => e.id === id_equipo);
    return equipo ? equipo.modelo : "Equipo no encontrado";
  };
  // Filtrar equipos según la búsqueda
  const filteredTasks = currentTasks.filter((task) =>
    obtenerEquipo(task.id_equipo).toLowerCase().includes(searchQuery.toLowerCase())
  );


  const obtenerSala = (id_equipo) => {
    const equipo = equipos.find((e) => e.id === id_equipo);
    const sala = salas.find((s) => s.ubicacion === equipo?.sala);
    return sala ? sala.sala : "Sala no encontrada";
  };

  const handleChange = (_, newValue) => {
    if (newValue < filteredTasks.length) {
      setSelectedTab(newValue);
    }
  };

  // Ajustar `selectedTab` si `filteredTasks` cambia
  useEffect(() => {
    if (filteredTasks.length === 0) {
      setSelectedTab(0);
    } else if (selectedTab >= filteredTasks.length) {
      setSelectedTab(0); // Reiniciar si el índice es inválido
    }
  }, [filteredTasks]);




  return (
    <Modal open={open} onClose={handleClose}>
      {isMobile ? (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '80%', md: '60%' }, // Ajusta el ancho en diferentes pantallas
            maxHeight: '80vh', // Evita que el modal sea demasiado alto
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: { xs: 2, md: 4 }, // Padding responsivo
            borderRadius: '12px',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { display: 'none' } // Oculta la barra de desplazamiento en Chrome/Safari/Edge
          }}
        >
          <IconButton onClick={handleClose}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" align="center" sx={{ mb: 2, fontSize: { xs: '16px', md: '20px' }, fontWeight: 'bold' }}>
            Lista de eventos
          </Typography>
          <TaskMobile currentTask={currentTasks} obtenerEquipo={obtenerEquipo} />
        </Box>
      ) : (<Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "80%", md: "60%" },
          height: "70vh", // 🔹 Mantiene un tamaño fijo
          bgcolor: "background.paper",
          boxShadow: 24,
          p: { xs: 2, md: 4 },
          borderRadius: "12px",
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
        }}
      >
        <IconButton onClick={handleClose} sx={{ position: "absolute", top: 8, right: 8 }}>
          <Close />
        </IconButton>

        {/* Contenedor de Tabs y Buscador */}
        <Box sx={{ width: "30%", borderRight: 1, borderColor: "divider", pr: 2, display: "flex", flexDirection: "column" }}>
          <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: "bold" }}>
            Equipos Médicos
          </Typography>

          {/* Buscador */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Search sx={{ color: "gray", mr: 1 }} />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Buscar equipo..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>

          {/* Tabs con tamaño fijo */}
          <Tabs
            orientation="vertical"
            value={selectedTab}
            onChange={handleChange}
            variant="scrollable"
            sx={{
              flexGrow: 1, // 🔹 Ocupa el espacio disponible
              overflowY: "auto",
              minHeight: "50vh", // 🔹 Mantiene altura mínima
            }}
          >
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => <Tab key={index} label={`${obtenerEquipo(task.id_equipo)} - (${obtenerSala(task.id_equipo)})`} />
              )) : (
              <Typography align="center" sx={{ color: "gray", mt: 2 }}>
                No se encontraron equipos
              </Typography>
            )}
          </Tabs>
        </Box>

        {/* Contenido del equipo seleccionado */}
        <Box sx={{ width: "70%", p: 2, overflowY: "auto", display: 'flex', justifyContent: 'center' }}>
          {filteredTasks.map((task, index) => (
            <TabPanel key={index} value={selectedTab} index={index}>
              <Card sx={{ p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                <CardContent
                  sx={{
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    width: "60vh",
                    height: "20vh",
                    justifyContent: "center",
                    position: "relative", // Necesario para posicionar elementos hijos de forma absoluta
                  }}
                >
                  <Box sx={{ textAlign: "center", flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {task.descripcion}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 8, // Ajusta la distancia desde la parte inferior
                      textAlign: "center",
                      width: "100%", // Para que ocupe todo el ancho disponible
                    }}
                  >
                    <Typography variant="body2">
                      {obtenerSala(task.id_equipo)} - {new Date(task.desde).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </TabPanel>
          ))}
        </Box>
      </Box>)}
    </Modal>
  );
};

// Componente TabPanel para mostrar el contenido seleccionado
const TabPanel = ({ children, value, index }) => {
  return value === index ? <Box sx={{ p: 2 }}>{children}</Box> : null;
};

export default TaskModal;
