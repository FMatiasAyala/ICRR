import { CargaAnuncio } from "../Formulario/CargaAnuncio";
import {
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure} from '@nextui-org/react'


export function ModalCreate({ onEventCreate, authors, sector, obraSocial }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <>
            <Button onPress={onOpen}>Nuevo anuncio</Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Cargar anuncio</ModalHeader>
                            <ModalBody>
                                <CargaAnuncio onClose={onClose} onEventCreated={onEventCreate} authors={authors} sector={sector} obraSocial={obraSocial} />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cerrar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}