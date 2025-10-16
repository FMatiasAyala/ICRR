
const API_BASE = import.meta.env.VITE_API_URL;


export const apiEquipos = `${API_BASE}/cmms/equipos`;
export const apiSalas = `${API_BASE}/cmms/salas`;
export const apiEventos = `${API_BASE}/cmms/eventos`;
export const apiEventosFiltrados = `${API_BASE}/cmms/eventosFiltrados`;
export const apiTecnicos = `${API_BASE}/cmms/tecnicos`;
export const apiAltaEquipos = `${API_BASE}/cmms/altaEquipos`;
export const apiMantenimiento = `${API_BASE}/cmms/mantenimiento/`;
export const apiMantenimientoPostpone = `${API_BASE}/cmms/mantenimientoPostpone/`;
export const apiCantidadesEventos = `${API_BASE}/cmms/cantidadEventos`;
export const apiBajaEquipo = `${API_BASE}/cmms/bajaEquipo`;
export const apiCargaContrato = `${API_BASE}/cmms/cargaContratos`;
export const apiTodosLosContratos = `${API_BASE}/cmms/allContratos`;
export const apiDatosContrato = `${API_BASE}/cmms/datosContrato`;
export const apiContrato = `${API_BASE}/cmms/fileContrato`;
export const apiEditContrato = `${API_BASE}/cmms/editContrato/`;
export const apiUser = `${API_BASE}/cmms/login`;
export const apiChangeUser = `${API_BASE}/cmms/changePassword/`;
export const apiUserGet = `${API_BASE}/cmms/users`;
export const apiWebSocket = `${API_BASE}`;
export const apiUps = `${API_BASE}/cmms/ups/`;
export const apiAltaUps =`${API_BASE}/cmms/altaUps/`;
export const apiModUps =`${API_BASE}/cmms/modificacionUps/`;
export const apiTecnicosEquipo = `${API_BASE}/cmms/tecnicosEquipo/`;
export const apiAltaTecnico = `${API_BASE}/cmms/altaTecnicos`;
export const apiModificacionTecnico = `${API_BASE}/cmms/modificacionTecnicos/`;
export const apiBajaTecnico = `${API_BASE}/cmms/bajaTecnicos/`;
export const apiReportEventos = `${API_BASE}/cmms/reporteEventos/`;
export const apiModificacionEquipo = `${API_BASE}/cmms/modificacionEquipo/`;
export const apiAdjuntos = `${API_BASE}/cmms/fileEvento`;
export const apiModificacionEvento = `${API_BASE}/cmms/modificacionEvento/`;
export const apiEquiposInf = `${API_BASE}/cmms/equiposInformaticos/`;
export const apiAltaEquiposInf = `${API_BASE}/cmms/altaEquipoInformatico/`;
export const apiModEquiposInf = `${API_BASE}/cmms/modificacionEquipoInformatico/`;
export const apiPlanos = `${API_BASE}/cmms/planos/`;
export const apiMatafuegos = `${API_BASE}/cmms/Matafuegos/`;
export const apiAltaMatafuegos = `${API_BASE}/cmms/altaMatafuegos/`;
export const apiModMatafuegos = `${API_BASE}/cmms/modificacionMatafuegos/`;
export const apiRefrigeracion = `${API_BASE}/cmms/refrigeracion/`;
export const apiAltaRefrigeracion = `${API_BASE}/cmms/altaRefrigeracion/`;
export const apiModRefrigeracion = `${API_BASE}/cmms/modificacionRefrigeracion/`;




export const servicios = [
  { id_servicio: 1, nombre_servicio: "Resonancia Magnética" , siglas_servicio:"RM"},
  { id_servicio: 2, nombre_servicio: "Terapia Radiante", siglas_servicio:"TR" },
  { id_servicio: 3, nombre_servicio: "Camara Gamma", siglas_servicio:"CG" },
  { id_servicio: 4, nombre_servicio: "Ecografía" , siglas_servicio:"EC"},
  { id_servicio: 5, nombre_servicio: "Radiografía" , siglas_servicio:"RX"},
  { id_servicio: 6, nombre_servicio: "Seriografo" , siglas_servicio:"RF"},
  { id_servicio: 7, nombre_servicio: "Tomografía" , siglas_servicio:"CT"},
  { id_servicio: 8, nombre_servicio: "Mamografía" , siglas_servicio:"MG"},
  { id_servicio: 9, nombre_servicio: "Densitometría Ósea" , siglas_servicio:"DMO"},
  { id_servicio: 10, nombre_servicio: "PET/CT" , siglas_servicio:"PET"},
  { id_servicio: 11, nombre_servicio: "Sistemas" , siglas_servicio:"SIS"}
];