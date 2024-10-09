// src/components/Footer.jsx
import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: #f8f9fa;
  padding: 0.5rem;
  text-align: center;
  font-size: 14px;
  color: #6c757d;
  position: fixed;
  bottom: 0;
  width: 100%;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000; /* Asegura que el footer esté por encima de otros elementos */
`;

const Footer = () => {
  return (
    <FooterContainer>
      &copy; {new Date().getFullYear()} ICRR. Todos los derechos reservados.
    </FooterContainer>
  );
};

export default Footer;
