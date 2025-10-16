import React, { useState } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
  Paper
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HandymanIcon from '@mui/icons-material/Handyman';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate } from 'react-router-dom';
import TechniciansList from './TechnicianList';
import ExportEquiposExcel from './ExportEquiposExcel';
import DownloadIcon from '@mui/icons-material/Download';
import ChangePasswordAdmin from '../Auth/ChangePasswordAdmin';

const SidebarDrawer = ({ open, onClose, equipos, salas, onNewEquipClick }) => {
  const navigate = useNavigate();
  const [openTechnicianModal, setOpenTechnicianModal] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);

  const token = localStorage.getItem("token");
  let user = null;
  if (token) {
    try {
      user = JSON.parse(atob(token.split(".")[1])); // decode JWT sin lib
    } catch (e) {
      console.error("Error decoding token:", e);
    }
  }

  return (
    <>
      <Drawer anchor="left" open={open} onClose={onClose}>
        <Box
          sx={{
            width: 270,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            bgcolor: '#fafafa',
            py: 2,
          }}
          role="presentation"
        >
          <Box>
            <Typography variant="h6" sx={{ px: 2, pb: 1, fontWeight: 600, color: '#1565c0' }}>
              Menú
            </Typography>

            <List>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenTechnicianModal(true);
                  }}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    mx: 1,
                    mb: 1,
                    '&:hover': { bgcolor: '#e3f2fd' }
                  }}
                >
                  <HandymanIcon sx={{ mr: 1, color: '#1976d2' }} />
                  <ListItemText primary="Ficha Técnicos" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={onNewEquipClick}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    mx: 1,
                    mb: 1,
                    '&:hover': { bgcolor: '#f1f8e9' }
                  }}
                >
                  <AddCircleOutlineIcon sx={{ mr: 1, color: '#388e3c' }} />
                  <ListItemText primary="Nuevo equipo" />
                </ListItemButton>
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() => setOpenExport(true)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    mx: 1,
                    mb: 1,
                    '&:hover': { bgcolor: '#f1f8e9' }
                  }}>
                  <DownloadIcon />
                  <ListItemText primary="Exportar Equipos" />
                </ListItemButton>

              </ListItem>
            </List>
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => navigate('/reportEquipament')}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    mx: 1,
                    '&:hover': { bgcolor: '#e0f7fa' },
                  }}
                >
                  <AssessmentIcon sx={{ mr: 1, color: '#00838f' }} />
                  <ListItemText primary="Reporte de equipos" />
                </ListItemButton>
              </ListItem>
            </List>
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => navigate('/planoVirtual')}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    mx: 1,
                    '&:hover': { bgcolor: '#e0f7fa' },
                  }}
                >
                  <PushPinRoundedIcon sx={{ mr: 1, color: '#8f3400ff' }} />
                  <ListItemText primary="Plano virtual" />
                </ListItemButton>
              </ListItem>
            </List>
            {user?.role === "admin" && (
              <List>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => setOpenAdmin(true)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      mx: 1,
                      mb: 1,
                      "&:hover": { bgcolor: "#fce4ec" },
                    }}
                  >
                    <ListItemText primary="Administrar usuarios" />
                  </ListItemButton>
                </ListItem>
              </List>
            )}
          </Box>

          <Typography
            variant="caption"
            align="center"
            sx={{ color: 'gray', mt: 2, mb: 1 }}
          >
            © {new Date().getFullYear()} ICRR — Todos los derechos reservados.
          </Typography>
        </Box>
      </Drawer>

      {/* Modal de técnicos */}
      <TechniciansList
        open={openTechnicianModal}
        onClose={() => setOpenTechnicianModal(false)}
        equipos={equipos}
        salas={salas}
      />
      <ExportEquiposExcel open={openExport} onClose={() => setOpenExport(false)} salas={salas} />
      {openAdmin && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1300,
          }}
          onClick={() => setOpenAdmin(false)}
        >
          <Paper
            onClick={(e) => e.stopPropagation()}
            sx={{ p: 3, minWidth: 400 }}
          >
            <ChangePasswordAdmin />
          </Paper>
        </Box>
      )}
    </>
  );
};

export default SidebarDrawer;
