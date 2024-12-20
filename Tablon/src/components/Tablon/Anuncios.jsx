import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updateAnuncio } from './hooks/Fecth';
import { formateDate } from './hooks/Date';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Divider,
    Button
} from '@nextui-org/react';
import { ModalEdit } from './Modal/ModalEdit';
import { ModalCreate } from './Modal/ModalCreate';
import { useWebSocket } from './hooks/useWebSocket';
import { ModalDowloadFile } from './Modal/ModalDowladFile';
import './anuncioStyle.css';
import { Header, Logo } from './hooks/StyleComponents';
import logo from './Img/logo.svg';
import { ObraSocialSearch } from './Filtro/ObraSocialSearch';
import { MesFilter } from './Filtro/MesFilter';
import { SectorFilter } from './Filtro/SectorFilter';
import { fetchFiltroUser } from './hooks/Fecth';
import { apiUser, apiAnuncio } from '../../Api';
import { FilialFilter } from './Filtro/FilialFilter';


export default function Anuncios() {
    const { anuncio, setAnuncio, sendWebSocketMessage } = useWebSocket();
    const [filteredAnuncio, setFilteredAnuncio] = useState([]);
    const [sectorFilter, setSectorFilter] = useState('');
    const [mesFilter, setMesFilter] = useState('');
    const [buttonCreated, setButtonCreated] = useState('');
    const [editingAnuncio, setEditingAnuncio] = useState(null);
    const [user, setUser] = useState([]);
    const [obraSocialFilter, setObraSocialFilter] = useState('');
    const [filialFilter, setFilialFilter] = useState('');
    const [selectedAnuncio, setSelectedAnuncio] = useState(null);
    const [showFileModal, setShowFileModal] = useState(false);
    const [response, setResponse] = useState('');
    const location = useLocation();

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const response = await fetch(apiUser);
                if (!response.ok) {
                    throw new Error('Error al obtener los datos de equipos');
                }
                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error('Error en la solicitud de datos de equipos:', error);
            }
        };

        fetchUsuario();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const filtro = params.get('sector');
        const fetchData = async () => {
            try {
                const userResponse = await fetchFiltroUser(filtro);
                setResponse(userResponse);
            } catch (error) {
                console.error("Error fetching data:", error);
                setResponse(null); // O maneja el error de alguna manera
            }
        };
        fetchData();

    }, []);

    useEffect(() => {

        const filterAnuncios = () => {
            let filtered = anuncio;
            const params = new URLSearchParams(location.search);
            const filtro = params.get('sector');
            if (sectorFilter) {
                filtered = filtered.filter(anuncio => anuncio.sector === sectorFilter);
            }
            if (filialFilter) {
                filtered = filtered.filter(anuncio => anuncio.servicio === filialFilter);
            }
            if (mesFilter !== '') {
                filtered = filtered.filter(anuncio => {
                    const anuncioDate = new Date(anuncio.createdAt);
                    return anuncioDate.getMonth() === parseInt(mesFilter, 10);
                });
            }
            if (obraSocialFilter) {
                filtered = filtered.filter(anuncio => anuncio.codigoObraSocial === obraSocialFilter);
            }


            if (filtro === 'GESTION') {
                // Mostrar todos los anuncios de GESTION y también los de Resonancia
                filtered = filtered.filter(anuncio =>
                    anuncio.sector === 'Gestion' || anuncio.sector === 'Facturacion');
            } else if (filtro === 'FACTU') {
                // Mostrar solo anuncios de FACTU (o modificar según lo que quieras hacer con FACTU)
                filtered = filtered.filter(anuncio => anuncio.sector === 'Facturacion' || anuncio.sector === 'Gestion');
            } else if (response.length === 0) {
                // Si la respuesta es un array vacío, mostrar solo los anuncios de Resonancia
                filtered = filtered.filter(anuncio => anuncio.servicio === 'Resonancia' || anuncio.servicio === 'RRHH');
            } else if (response.length > 0) {
                // Si hay un idemp en la respuesta, mostrar todos los anuncios excepto los de Resonancia
                filtered = filtered.filter(anuncio => anuncio.servicio !== 'Resonancia' || anuncio.servicio === 'RRHH');
            }

            setFilteredAnuncio(filtered);
        };

        filterAnuncios();
    }, [sectorFilter, mesFilter, obraSocialFilter, filialFilter, anuncio, response]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const sector = params.get('sector');
        if (sector) {
            setButtonCreated(sector);
        }
    }, [location.search]);

    const handleFilterChange = (event) => {
        setSectorFilter(event.target.value);
    };
    const handleFilialChange = (event) => {
        setFilialFilter(event.target.value);
    };

    const handleMesChange = (event) => {
        setMesFilter(event.target.value);
    };

    const handleObraSocialChange = (value) => {
        setObraSocialFilter(value === " " ? "" : value);
    };

    const handleEdit = (id) => {
        const editedAnuncio = anuncio.find(a => a.id === id);
        setEditingAnuncio(editedAnuncio);
    };

    const handleSave = async (id, updatedData) => {
        try {
            await updateAnuncio(id, updatedData);
            setAnuncio(anuncio.map(a => (a.id === id ? { ...a, ...updatedData } : a)));
            setEditingAnuncio(null);
            sendWebSocketMessage({ type: 'update' });
        } catch (error) {
            console.error('Error al guardar cambios:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(apiAnuncio + `${id}`, {
                method: 'DELETE',
            });
            setAnuncio(anuncio.filter(a => a.id !== id));
            sendWebSocketMessage({ type: 'delete' });
        } catch (error) {
            console.error('Error al eliminar el anuncio:', error);
        }
    };


    const handleFileModalOpen = (anuncio) => {
        setSelectedAnuncio(anuncio);
        setShowFileModal(true);
    };

    const getAnuncioClass = (tipo) => {
        switch (tipo) {
            case 'Alta':
                return 'anuncio-alta';
            case 'Baja':
                return 'anuncio-baja';
            case 'Notificacion':
                return 'anuncio-notificacion';
            default:
                return '';
        }
    };


    function getTextColorBasedOnBackground(tipo) {
        // Aquí puedes decidir el color del texto según el tipo de anuncio
        switch (tipo) {
            case 'alta':
                return 'text-white';  // Texto blanco para anuncios "alta"
            case 'baja':
                return 'text-white';  // Texto blanco para anuncios "baja"
            case 'notificacion':
                return 'text-white';  // Texto blanco para anuncios "notificacion"
            default:
                return 'text-black';  // Texto negro como valor por defecto
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header>
                <Logo src={logo} alt='logo' />
                Tablon de anuncios
            </Header>
            <div className="flex flex-1">
                <aside className="w-1/8 p-4">
                    <Card className="filtro-card">
                        <SectorFilter
                            sectorFilter={sectorFilter}
                            handleFilterChange={handleFilterChange}
                            anuncio={anuncio} />
                        {buttonCreated === 'FACTU' && (

                            <FilialFilter
                                filialFilter={filialFilter}
                                handleFilialChange={handleFilialChange}
                                anuncio={anuncio}
                            />
                        )}
                        <ObraSocialSearch
                            obraSocialFilter={obraSocialFilter}
                            handleObraSocialChange={handleObraSocialChange}
                        />
                        <MesFilter
                            mesFilter={mesFilter}
                            handleMesChange={handleMesChange}
                        />
                    </Card>
                </aside>
                <main className="flex-1 p-4">
                    {(buttonCreated === 'FACTU' || buttonCreated === 'GESTION') && (
                        <ModalCreate
                            onEventCreate={() => sendWebSocketMessage({ type: 'fetch' })}
                            authors={user}
                            sector={buttonCreated === 'FACTU' ? "Facturacion" : "Gestion"}
                            obraSocial={[]}
                        />
                    )}
                    {filteredAnuncio.length > 0 ? (
                        <div className="grid grid-cols-4 gap-4">
                            {filteredAnuncio.map((anuncio, index) => (
                                <Card key={index} className={`anuncio ${getAnuncioClass(anuncio.tipo)}`}>
                                    <CardHeader className={`relative w-full flex flex-col items-center ${getAnuncioClass(anuncio.tipo)}`}>
                                        <div className="text-center mt-4">
                                            <p className="text-xl font-bold">{anuncio.title}</p>
                                            <p className={`text-small font-bold ${getTextColorBasedOnBackground(anuncio.tipo)}`}>{anuncio.sector}{anuncio.author ? ` - ${anuncio.author.name}` : ""}</p>
                                            <p className="text-small font-bold">{anuncio.obraSocial ? `${anuncio.obraSocial}` : ""}</p>
                                            <p>{anuncio.servicio}</p>
                                        </div>
                                    </CardHeader>
                                    <Divider />
                                    <CardBody className="cardContent">
                                        <p className='content-text'>{anuncio.content}</p>
                                    </CardBody>
                                    <Divider />
                                    <CardFooter className="text-center">
                                        <p className="text-small text-default-500">{formateDate(anuncio.updatedAt)}</p>
                                    </CardFooter>
                                    <div className="flex gap-3">
                                        <div className="attachments">
                                            <Button
                                                auto
                                                onClick={() => handleFileModalOpen(anuncio)}
                                                aria-label="Ver archivos"
                                            >
                                                Ver archivos
                                            </Button>
                                        </div>
                                        {(buttonCreated === 'GESTION'|| buttonCreated === 'FACTU') && (
                                            <div className="flex gap-3">
                                                <Button
                                                    className="text-small"
                                                    color="success"
                                                    onClick={() => handleEdit(anuncio.id)}
                                                    aria-label={`Editar anuncio ${anuncio.title}`}
                                                >
                                                    Editar
                                                </Button>
                                            </div>
                                        )}
                                        {buttonCreated === 'GESTION' && (
                                            <div className="flex gap-3">
                                                <Button
                                                    className="text-small"
                                                    color="danger"
                                                    onClick={() => handleDelete(anuncio.id)}
                                                    aria-label={`Eliminar anuncio ${anuncio.title}`}
                                                >
                                                    Eliminar anuncio
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p>No hay anuncios disponibles.</p>
                    )}
                </main>
            </div>
            {editingAnuncio && (
                <ModalEdit anuncio={editingAnuncio} onSave={handleSave} onClose={() => setEditingAnuncio(null)} />
            )}
            {showFileModal && selectedAnuncio && (
                <ModalDowloadFile
                    anuncio={selectedAnuncio}
                    onClose={() => setShowFileModal(false)}
                />
            )}
        </div>
    );
}
