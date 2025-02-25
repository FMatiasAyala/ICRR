import React, { useState, useEffect } from "react";
import { Input, Button, Textarea, Select, SelectItem } from '@nextui-org/react';

function EditAnuncio({ anuncio, onSave, onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
    });


    const tiposAnuncio = {
        'Alta': 'Alta de servicio',
        'Baja': 'Suspensión de servicio',
        'Notificacion': 'Notificación'
    };


    useEffect(() => {
        if (anuncio) {
            setFormData({
                title: anuncio.title,
                content: anuncio.content,
                tipo: anuncio.tipo,
            });
        }
    }, [anuncio]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (anuncio) {
            onSave(anuncio.id, formData);
            onClose();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };
    if (!anuncio) {
        return <div>Cargando...</div>;
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 p-6 bg-white shadow-lg rounded-xl w-full max-w-2xl mx-auto border border-gray-300"
        >
            <h2 className="text-2xl font-bold text-gray-800 text-center">Editar Anuncio</h2>

            <Input
                isRequired
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                variant="flat"
                labelPlacement="outside"
                label="Título"
                placeholder="Escribe un título..."
                className="border rounded-lg p-3 text-lg"
            />

            <Textarea
                isRequired
                name="content"
                value={formData.content}
                onChange={handleChange}
                variant="flat"
                labelPlacement="outside"
                label="Anuncio"
                className="resize-y min-h-[100px] border rounded-lg p-3 text-lg"
                placeholder="Escribe el contenido del anuncio..."
            />

            <Select
                aria-label="tipoAnuncio"
                name="tipo"
                placeholder="Selecciona el tipo de anuncio"
                value={formData.tipo}
                labelPlacement="outside-left"
                onChange={(e) => handleChange(e)}
                className="border rounded-lg p-3 text-lg"
            >
                {Object.entries(tiposAnuncio).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                        {value}
                    </SelectItem>
                ))}
            </Select>

            <Button
                type="submit"
                className="bg-blue-600 text-white font-semibold py-3 px-6 text-lg rounded-lg hover:bg-blue-700 transition-all"
            >
                Guardar cambios
            </Button>
        </form>

    );
}

export default EditAnuncio;
