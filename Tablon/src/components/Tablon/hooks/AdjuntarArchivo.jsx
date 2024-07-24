import React, { useRef } from 'react';

const AdjuntarArchivo = ({ onFilesAdded }) => {
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            const filesArray = Array.from(files);
            onFilesAdded(filesArray);
        }
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                accept="image/*,application/pdf" // Puedes ajustar los tipos de archivo aceptados
            />
            <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                aria-label="Adjuntar archivos"
                style={{ padding: '8px 16px', fontSize: '16px' }} // Añade estilos si es necesario
            >
                Adjuntar archivos
            </button>
        </div>
    );
};

export default AdjuntarArchivo;

