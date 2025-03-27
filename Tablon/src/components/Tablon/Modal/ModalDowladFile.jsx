import React from 'react';
import { Modal, Button, ModalHeader, ModalBody, ModalFooter, ModalContent } from '@nextui-org/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileExcel, faFileImage, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { apiAttachments } from '../../../Api';

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
                <ModalHeader className="text-lg font-semibold text-gray-800">
                    📂 Descargar archivos
                </ModalHeader>

                <ModalBody>
                    {anuncio.attachments && anuncio.attachments.length > 0 && (
                        <ul className="space-y-2">
                            {anuncio.attachments.map((attachment) => {
                                const fileName = attachment.url.split('/').pop();
                                return (
                                    <li key={attachment.id} className="flex items-center gap-2">
                                        <a
                                            href={`${apiAttachments}${attachment.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            {renderFileIcon(attachment.url)}
                                            <span className="truncate max-w-[200px]">{fileName}</span>
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button
                        auto
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg shadow-md transition-all"
                        onClick={onClose}
                    >
                        ❌ Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

    );
};


