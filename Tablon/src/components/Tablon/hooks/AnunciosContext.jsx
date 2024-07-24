// AnunciosContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { fetchAnuncios } from './Fecth';

const AnunciosContext = createContext();

export const AnunciosProvider = ({ children }) => {
    const [anuncio, setAnuncio] = useState([]);

    useEffect(() => {
        const fetchAnuncioData = async () => {
            const data = await fetchAnuncios();
            setAnuncio(data);
        };
        fetchAnuncioData();
    }, []);

    return (
        <AnunciosContext.Provider value={{ anuncio, setAnuncio }}>
            {children}
        </AnunciosContext.Provider>
    );
};

export default AnunciosContext;
