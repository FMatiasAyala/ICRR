export const initialState = {
  estadoEquipos: {},
  mantenimiento: [],
  eventosFiltrados: [],
  equipos: [],
  eventos: [],
  tecnicos: [],
  tecnicosPorEquipo: {},
  mantenimientosFiltrados: []
};

export const webSocketReducer = (state, action) => {
  switch (action.type) {

    //Estados
    case 'SET_ESTADOS_INICIALES':
      return {
        ...state,
        estadoEquipos: action.payload,
      };
    case 'UPDATE_EVENTO_ESTADO':
      return {
        ...state,
        estadoEquipos: {
          ...state.estadoEquipos,
          [action.payload.id_equipo]: action.payload.estado.toUpperCase(),
        },
      };
    case 'SET_TECNICOS_INICIALES':
      return {
        ...state,
        tecnicos: action.payload,
      };

    //Tecnicos
    case 'TECNICO_NUEVO':
      return {
        ...state,
        tecnicos: [...state.tecnicos, action.payload]
      };

    case 'TECNICO_ASIGNADO_A_EQUIPO':
      // Solo si querés llevar un estado global de técnicos por equipo (opcional)
      return {
        ...state,
        tecnicosPorEquipo: {
          ...(state.tecnicosPorEquipo || {}),
          [action.payload.id_equipo]: [
            ...(state.tecnicosPorEquipo?.[action.payload.id_equipo] || []),
            action.payload.tecnico
          ]
        }
      };

    case 'TECNICO_ELIMINADO':
      return {
        ...state,
        tecnicos: state.tecnicos.filter(t => t.id_tecnico !== action.payload)
      };


    //Eventos 
    case 'SET_EVENTOS':
      return {
        ...state,
        eventos: action.payload || [],
      };
    case 'EVENTO_NUEVO': {
      const nuevo = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];

      const eventosActualizados = [
        ...nuevo,
        ...state.eventosFiltrados.filter(
          (e) => !nuevo.find((n) => n.id_evento === e.id_evento)
        )
      ];

      return {
        ...state,
        eventosFiltrados: eventosActualizados,
        estadoEquipos: {
          ...state.estadoEquipos,
          ...nuevo.reduce((acc, ev) => {
            acc[ev.id_equipo] = ev.estado?.toUpperCase() || 'DESCONOCIDO';
            return acc;
          }, {})
        }
      };
    }

    //Eventos Filtrados
    case 'SET_EVENTOS_FILTRADOS':
      return {
        ...state,
        eventosFiltrados: action.payload || [],
      };

    case 'UPDATE_EVENTO_FILTRADO': {
      const actualizados = state.eventosFiltrados.map((ev) =>
        ev.id_evento === action.payload.id_evento
          ? {
            ...ev,
            ...action.payload,
            repuestos: action.payload.repuestos || ev.repuestos
          }
          : ev
      );

      return {
        ...state,
        eventosFiltrados: actualizados,
        estadoEquipos: {
          ...state.estadoEquipos,
          [action.payload.id_equipo]: action.payload.estado?.toUpperCase() || 'DESCONOCIDO'
        }
      };
    }

    //Mantenimientos
    case 'MANTENIMIENTO_NUEVO': {
      const nuevo = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];

      const mantenimientosActualizados = [
        ...nuevo,
        ...state.mantenimiento.filter(
          (m) => !nuevo.find((n) => n.id_mantenimiento === m.id_mantenimiento)
        ),
      ];
      return {
        ...state,
        mantenimiento: mantenimientosActualizados,
      };
    }
    case 'UPDATE_MANTENIMIENTO':
      return {
        ...state,
        mantenimiento: state.mantenimiento.map((m) =>
          m.id_mantenimiento === action.payload.id_mantenimiento
            ? { ...m, ...action.payload }
            : m
        ),
      };
    case 'SET_MANTENIMIENTOS_FILTRADOS':
      return {
        ...state,
        mantenimientosFiltrados: action.payload || [],
      };
    //Equipos
    case 'SET_EQUIPOS_INICIALES':
      return {
        ...state,
        equipos: action.payload,
      };
    case 'EQUIPO_NUEVO':
      return {
        ...state,
        equipos: [...state.equipos, action.payload]
      };


    case 'UPDATE_EQUIPO':
      return {
        ...state,
        equipos: state.equipos.map(eq =>
          eq.id === action.payload.id ? { ...eq, ...action.payload } : eq
        )
      };

    case 'EQUIPO_DADO_DE_BAJA':
      const nuevosEstados = { ...state.estadoEquipos };
      delete nuevosEstados[action.payload];
      return {
        ...state,
        estadoEquipos: nuevosEstados,
      };

    default:
      return state;
  }
};
