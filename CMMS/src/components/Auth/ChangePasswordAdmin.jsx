import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { apiChangeUser, apiUserGet } from "../utils/Fetch";

const ChangePasswordAdmin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // 🔎 cargar lista de usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(apiUserGet, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data); // suponemos que devuelve [{id, username, rol}, ...]
        } else {
          console.error("Error al obtener usuarios");
        }
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchUsers();
  }, []);

  // 🔧 cambiar contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(apiChangeUser, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_usuario: selectedUser, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setMsg(data.message || "Contraseña actualizada.");
        setSelectedUser("");
        setPassword("");
      } else {
        const data = await response.json();
        setError(data.error || "Error al cambiar la contraseña.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error en el servidor.");
    }
  };

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 400 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}>
          Cambiar contraseña de usuario
        </Typography>
        <form onSubmit={handleChangePassword}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="user-select-label">Usuario</InputLabel>
            <Select
              labelId="user-select-label"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {users.map((u) => (
                <MenuItem key={u.id_usuario} value={u.id_usuario}>
                 {u.name} {u.lastname} - {u.username} ({u.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Nueva contraseña"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          {error && <Typography color="error">{error}</Typography>}
          {msg && <Typography color="primary">{msg}</Typography>}

          <Button type="submit" variant="contained" fullWidth disabled={!selectedUser || !password}>
            Guardar
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ChangePasswordAdmin;
