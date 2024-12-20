import React from 'react';
import { TextField, Box } from '@mui/material';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        label="Buscar"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleChange}
        sx={{ borderRadius: 2 }}
      />
    </Box>
  );
};

export default SearchBar;
