const API_BASE =import.meta.env.VITE_API_URL
const API_WEB_SOCKET =import.meta.env.VITE_BRIDGE_URL


export const apiUser = `${API_BASE}/tablon/user`;
export const apiAnuncio = `${API_BASE}tablon/anuncios/`;
export const apiAnuncioFiltrados = `${API_BASE}/tablon/anunciosFiltrados`;
export const apiAttachments = `${API_BASE}/`;
export const apiWebSocket = `${API_WEB_SOCKET}/tablon/anuncios`;

