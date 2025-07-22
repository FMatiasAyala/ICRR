import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 2,
        px: 3,
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0',
        color: '#666',
        fontSize: '0.85rem',
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} ICRR — Todos los derechos reservados. Desarrollado por el Área de Sistemas.
      </Typography>
    </Box>
  );
};

export default Footer;
