import React from 'react';
import Anuncios from './components/Tablon/Anuncios.jsx'
import './style.css';
import Footer from './components/Tablon/Footer/Footer.jsx';

function App() {

  return (
    <div className="app-container">
      <div className="content-wrap">
        <Anuncios />
      </div>
      <Footer />
    </div>
  )
}

export default App;

