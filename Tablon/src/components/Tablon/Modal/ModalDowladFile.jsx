import React from 'react';
import { Modal, Button, ModalHeader, ModalBody, ModalFooter, ModalContent } from '@nextui-org/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileExcel, faFileImage, faFileAlt } from '@fortawesome/free-solid-svg-icons';

export function ModalDowloadFile({ anuncio, onClose }) {
    const renderFileIcon = (fileUrl) => {
        const fileName = fileUrl.split('/').pop(); // Obtiene el nombre del archivo
        const extension = fileName.split('.').pop().toLowerCase(); // Obtiene la extensión del archivo
        switch (extension) {
            case 'pdf':
                return <FontAwesomeIcon icon={faFilePdf} />;
            case 'xlsx':
                return <FontAwesomeIcon icon={faFileExcel} />;
            case 'jpg':
            case 'jpeg':
            case 'png':
                return <FontAwesomeIcon icon={faFileImage} />;
            default:
                return <FontAwesomeIcon icon={faFileAlt} />;
        }
    };

    return (
        <Modal
            closeButton
            aria-labelledby="file-list-modal"
            isOpen={true}
            onClose={onClose}
        >
            <ModalContent>
                <ModalHeader>
                    Descargar archivos
                </ModalHeader>
                <ModalBody>
                    <ul>
                    {anuncio.attachments && anuncio.attachments.length > 0 ? (
                                anuncio.attachments.map((attachment) => {
                                    const fileName = attachment.url.split('/').pop();
                                    return (
                                        <a
                                            key={attachment.id}
                                            href={`http://192.168.1.53:3000/${attachment.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="file-icon">
                                            {renderFileIcon(attachment.url)} {fileName}
                                        </a>
                                    );
                                })
                            ) : (
                                <p>No hay archivos cargados</p>
                            )}
                    </ul>
                </ModalBody>
                <ModalFooter>
                    <Button auto onClick={onClose}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};


