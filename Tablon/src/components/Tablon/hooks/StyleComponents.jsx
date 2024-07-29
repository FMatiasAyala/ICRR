// styles.js
import styled from 'styled-components';

export const Body = styled.div`
  background-image: url('./Img/logo_transparente1.png'); /* Ruta a la imagen de la marca de agua */
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  opacity: 0.1; /* Ajusta la opacidad según sea necesario */
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const Header = styled.header`
  background-color: #0047bb;
  color: white;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-family: 'Arial', sans-serif;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

export const Logo = styled.img`
  margin-right: 15px;
  width: 40px;
  height: 40px;
`;

