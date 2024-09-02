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
    sector: sector,
    authorId: '', // Ajustado a string vacío en lugar de null
    attachments: [] // Campo para los archivos adjuntos
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('servicio', formData.servicio);
    data.append('sector', formData.sector);
    data.append('obraSocial', formData.obraSocial);
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
        servicio: selectedAuthor.servicio, // Actualiza el servicio según el autor seleccionado
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
    } else if (sector === "RRHH") {
      return author.sector === "Gestion";
    }
    return true;
  });

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-col">
      <Input
        isRequired
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        variant="flat"
        labelPlacement="outside"
        placeholder="Titulo..."
        label="Titulo"
        className="max-w-s"
      />
      <Textarea
        isRequired
        type="text"
        name="content"
        value={formData.content}
        onChange={handleChange}
        variant="flat"
        labelPlacement="outside"
        label="Anuncio"
        className="max-w-xs resize-y min-h-[40px]"
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

      <ObraSocialSelect handleObraSocial={handleObraSelect} />
      <input
        type="file"
        name="attachments"
        multiple
        onChange={handleFileChange}
      />
      <Button type="submit" color="primary">Agregar anuncio</Button>
    </form>
  );
}
