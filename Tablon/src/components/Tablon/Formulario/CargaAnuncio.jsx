import React, { useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
import { ObraSocialSelect } from "../Buscador/ObraSocialSelect";
import { apiAnuncio } from "../../../Api";

export function CargaAnuncio({ onClose, onEventCreated, authors, sector, obraSocial }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    obraSocial: '',
    codigoObraSocial: '',
    servicio: '',
    tipo: '',
    sector: sector,
    authorId: '', // Ajustado a string vacío en lugar de null
    attachments: [] // Campo para los archivos adjuntos
  });

  const handleConfirmOpen = () => setOpenModal(true);
  const handleConfirmClose = () => setOpenModal(false);

  const tiposAnuncio = {
    'Alta': 'Alta de servicio',
    'Baja': 'Suspensión de servicio',
    'Notificacion': 'Notificación'
  };

  const listaServicio = {
    'RRHH': 'Todos',
    'Resonancia': 'Resonancia',
    'CRR': 'CRR'
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('servicio', formData.servicio);
    data.append('sector', formData.sector);
    data.append('obraSocial', formData.obraSocial);
    data.append('tipo', formData.tipo);
    data.append('codigoObraSocial', formData.codigoObraSocial);
    data.append('authorId', formData.authorId);

    for (let i = 0; i < formData.attachments.length; i++) {
      data.append('attachments', formData.attachments[i]);
    }

    try {
      await fetch(apiAnuncio, {
        method: 'POST',
        body: data,
      });

      onEventCreated();
      onClose();
      handleConfirmClose();
    } catch (error) {
      console.error('Error al agregar el anuncio:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };



  const handleFileChange = (e) => {
    setFormData(prevData => ({
      ...prevData,
      attachments: Array.from(e.target.files) // Convertir FileList a array
    }));
  };

  const handleSelectChange = (authorId) => {
    const selectedAuthor = filteredAuthors.find((author) => author.id === parseInt(authorId));
    if (selectedAuthor) {
      setFormData({
        ...formData,
        authorId: selectedAuthor.id,
        servicio: sector === "Gestion" ? formData.servicio : selectedAuthor.servicio, // Actualiza el servicio según el autor seleccionado
      });
    }
  };


  const handleObraSelect = (obra) => {
    setFormData(prevData => ({
      ...prevData,
      obraSocial: obra.razonSocial,
      codigoObraSocial: obra.codigo
    }));
  };

  const filteredAuthors = authors.filter((author) => {
    if (sector === "Facturacion") {
      return author.sector === "Facturacion";
    } else if (sector === "Gestion") {
      return author.sector === "Gestion";
    }
    return true;
  });


  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-lg max-w-md">
      <Input
        isRequired
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        variant="flat"
        labelPlacement="outside"
        placeholder="Título del anuncio..."
        label="Título"
        className="w-full"
      />

      <Textarea
        isRequired
        name="content"
        value={formData.content}
        onChange={handleChange}
        variant="flat"
        labelPlacement="outside"
        label="Descripción"
        placeholder="Escribe el contenido del anuncio..."
        className="w-full resize-y min-h-[80px]"
      />

      <Select
        isRequired
        aria-label="author"
        name="authorId"
        placeholder="Selecciona un autor"
        value={formData.authorId}
        labelPlacement="outside-left"
        onChange={(e) => handleSelectChange(e.target.value)}
      >
        {filteredAuthors.map((author) => (
          <SelectItem key={author.id} value={author.id} textValue={author.name}>
            {author.name}
          </SelectItem>
        ))}
      </Select>

      <Select
        aria-label="tipoAnuncio"
        name="tipo"
        placeholder="Tipo de anuncio"
        value={formData.tipo}
        labelPlacement="outside-left"
        onChange={handleChange}
      >
        {Object.entries(tiposAnuncio).map(([key, value]) => (
          <SelectItem key={key} value={value}>
            {value}
          </SelectItem>
        ))}
      </Select>

      {sector === "Gestion" && (
        <Select
          isRequired
          aria-label="servicio"
          name="servicio"
          placeholder="Selecciona un servicio"
          value={formData.servicio}
          labelPlacement="outside-left"
          onChange={handleChange}
        >
          {Object.entries(listaServicio).map(([key, value]) => (
            <SelectItem key={key} value={value}>
              {value}
            </SelectItem>
          ))}
        </Select>
      )}

      {sector === "Facturacion" && <ObraSocialSelect handleObraSocial={handleObraSelect} />}

      <div className="flex flex-col items-center gap-2">
        <label className="text-sm font-semibold text-gray-700">Adjuntar archivos</label>
        <input
          type="file"
          name="attachments"
          multiple
          onChange={handleFileChange}
          className="file:bg-blue-500 file:border-0 file:rounded-md file:px-4 file:py-2 file:text-white file:cursor-pointer"
        />
      </div>

      <Button type="submit" color="primary" className="w-full">Agregar anuncio</Button>
    </form>

  );
}

