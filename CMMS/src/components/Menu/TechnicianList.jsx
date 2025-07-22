import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Modal,
    ListItemIcon,
    Card,
    CardContent,
    IconButton,
    Tabs,
    Tab,
    TextField,
    Button
} from "@mui/material";
import HandymanIcon from "@mui/icons-material/Handyman";
import { Close, Search, Edit, Delete } from "@mui/icons-material";
import { apiBajaTecnico } from "../utils/Fetch";
import NewTechnician from "./NewTechnician";
import EditTechnician from "./EditTechnician";
import { useWebSocketContext } from "../WebSocket/useWebSocketContext";

const TechniciansList = ({ equipos, salas, open, onClose }) => {
    const { state: { tecnicos } } = useWebSocketContext();
    const [selectedTab, setSelectedTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState([]);
    const [openConfirmModal, setOpenConfirmModal] = useState(false);
    const [techToDelete, setTechToDelete] = useState(null);

    const groupedByCompany = tecnicos.reduce((acc, tech) => {
        if (!acc[tech.empresa]) {
            acc[tech.empresa] = [];
        }
        acc[tech.empresa].push(tech);
        return acc;
    }, {});

    const companies = Object.keys(groupedByCompany);
    const filteredCompanies = companies.filter((empresa) =>
        empresa.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (filteredCompanies.length === 0) {
            setSelectedTab(0);
        } else if (selectedTab >= filteredCompanies.length) {
            setSelectedTab(0);
        }
    }, [filteredCompanies]);

    const handleEdit = (tecnicos) => {
        setSelectedTechnician(tecnicos);
        setOpenEditModal(true);
    };


    const handleDeleteClick = (tech) => {
        setTechToDelete(tech);
        setOpenConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (!techToDelete) return;

        try {
            const response = await fetch(`${apiBajaTecnico}${techToDelete.id_tecnico}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) throw new Error("Error deleting technician");
            setOpenConfirmModal(false);
            setTechToDelete(null);
        } catch (error) {
            console.error("Error deleting technician:", error);
        }
    };


    return (
        <>
            <Card
                onClick={() => onClose()}
                sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#0277bd", color: "white" }, transition: "background-color 0.3s ease" }}
            >
                <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, flexDirection: { xs: "column", sm: "row" }, textAlign: "center" }}>
                    <ListItemIcon>
                        <HandymanIcon />
                    </ListItemIcon>
                    <Typography sx={{ fontWeight: "bold" }}>Ficha de técnicos</Typography>
                </CardContent>
            </Card>

            <Modal open={open} onClose={onClose}>
                <Box
                    sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: { xs: "90%", sm: 900 }, bgcolor: "background.paper", boxShadow: 24, borderRadius: 4, p: 4, display: "flex", flexDirection: "column" }}
                >
                    <IconButton onClick={() => onClose()} sx={{ position: "absolute", top: 8, right: 8 }}>
                        <Close />
                    </IconButton>
                    <Typography variant="h4" align="center" sx={{ color: "#004d99", mb: 2 }}>
                        Ficha de técnicos
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <NewTechnician equipos={equipos} salas={salas} />
                        <Search sx={{ color: "gray", mr: 1 }} />
                        <TextField fullWidth variant="outlined" size="small" placeholder="Buscar empresa..." onChange={(e) => setSearchQuery(e.target.value)} />
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, height: "50vh" }}>
                        <Tabs orientation="vertical" value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} variant="scrollable" sx={{ flexShrink: 0, overflowY: "auto", minWidth: { xs: "100%", sm: 200 }, borderRight: { sm: 1, xs: 0 }, mb: { xs: 2, sm: 0 } }}>
                            {filteredCompanies.length > 0 ? (
                                filteredCompanies.map((empresa, index) => (
                                    <Tab key={index} label={empresa} />
                                ))
                            ) : (
                                <Typography align="center" sx={{ color: "gray", mt: 2 }}>
                                    No se encontraron empresas
                                </Typography>
                            )}
                        </Tabs>
                        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
                            {filteredCompanies.length > 0 &&
                                groupedByCompany[filteredCompanies[selectedTab]].map((tech, index) => (
                                    <Card key={index} sx={{ p: 2, bgcolor: "grey.100", borderRadius: 2, mb: 1 }}>
                                        <CardContent sx={{ textAlign: "center" }}>
                                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                                {tech.nombre} {tech.apellido}
                                            </Typography>
                                            <Typography variant="body2">Contacto: {tech.numero}</Typography>
                                            <Typography variant="body2">Especialidad: {tech.cobertura}</Typography>
                                            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                                                <IconButton color="primary" onClick={() => handleEdit(tech)}>
                                                    <Edit />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleDeleteClick(tech)}>
                                                    <Delete />
                                                </IconButton>

                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                        </Box>
                    </Box>
                </Box>
            </Modal>

            {/* Modal de edición de técnico */}
            {selectedTechnician && (
                <EditTechnician
                    openEditModal={openEditModal}
                    setOpenEditModal={setOpenEditModal}
                    technicianData={selectedTechnician}
                    equipos={equipos}
                    salas={salas}
                />
            )}
            <Modal open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
                }}>
                    <Typography variant="h6" gutterBottom>
                        ¿Estás seguro que querés borrar a {techToDelete?.nombre} {techToDelete?.apellido} de la empresa {techToDelete?.empresa}?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Esta acción no se puede deshacer.
                    </Typography>
                    <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                        <Button variant="outlined" onClick={() => setOpenConfirmModal(false)}>Cancelar</Button>
                        <Button variant="contained" color="error" onClick={confirmDelete}>Eliminar</Button>
                    </Box>
                </Box>
            </Modal>

        </>
    );
};

export default TechniciansList;
