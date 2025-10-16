import { memo } from "react";
import { Group, Circle, Text, Label, Tag } from "react-konva";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { configEquipos } from "./configEquipos";

const EquipoPin = memo(function EquipoPin({ eq, onDragEnd, onPinClick, showPopup, editado, isSelected }) {
  const cfg = configEquipos[eq.tipo] || configEquipos.default;
  const [icon] = useImage(cfg.icon);

  const border = editado ? "#ffd600" : "#fff";

  return (
    <Group
      x={eq.x}
      y={eq.y}
      draggable
      onDragEnd={e => onDragEnd(eq.tipo, eq.id, e.target.x(), e.target.y())}
      onClick={e => {
        e.cancelBubble = true;
        onPinClick(eq.tipo, eq.id);
      }}
    >
      {/* HALO de selección */}
      {isSelected && (
        <Circle
          radius={16}
          stroke={cfg.color}
          strokeWidth={3}
          opacity={0.6}
          shadowBlur={12}
          shadowColor={cfg.color}
          perfectDrawEnabled={false}
          listening={false}
        />
      )}

      <Circle
        radius={7}
        fill={cfg.color}
        shadowBlur={3}
        shadowColor="#3337"
        stroke={border}
        strokeWidth={editado ? 3 : 1}
        perfectDrawEnabled={false}
        shadowForStrokeEnabled={false}
      />
      <KonvaImage
        image={icon}
        width={11}
        height={11}
        offsetX={5.5}
        offsetY={5.5}
        perfectDrawEnabled={false}
        listening={false}
      />
      {showPopup && (
        <Label x={12} y={-10}>
          <Tag
            fill="#fff"
            stroke={cfg.color}
            shadowColor="#555"
            shadowBlur={6}
            cornerRadius={6}
          />
          <Text
            text={
              eq.tipo === "pc"
                ? `${eq.nombre || `PC #${eq.id}`}
Usuario: ${eq.usuario_asignado || "-"}
IP: ${eq.ip || "-"}
Estado: ${eq.estado || "-"}`
                : eq.tipo === "impresora"
                  ? `${eq.nombre || `Impresora #${eq.id}`}
Modelo: ${eq.modelo || "-"}
Tóner: ${eq.tipo_toner || "-"}
IP: ${eq.ip || "-"}`
                  : eq.tipo === "matafuego"
                    ? `${eq.nombre || `Matafuego #${eq.id}`}
Agente: ${eq.tipo_matafuego || "-"}
Capacidad: ${eq.capacidad_kg || "-"} kg
Próxima recarga: ${eq.fecha_proxima_recarga || "-"}`
                    : eq.tipo === "aire_acondicionado"
                      ? `${eq.nombre || `Split #${eq.id}`}
Marca: ${eq.marca || "-"}
Modelo: ${eq.modelo || "-"}
Frío: ${eq.capacidad_frio || "-"} frigorías
Estado: ${eq.estado || "-"}`
                      : `${eq.nombre || `Equipo #${eq.id}`}
Modelo: ${eq.modelo || "-"}
Estado: ${eq.estado || "-"}
IP: ${eq.ip || ""}`
            }
            fontSize={13}
            padding={8}
            fill="#222"
          />
        </Label>
      )}

    </Group>
  );
});

export default EquipoPin;