import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

export default function VerOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [abierto, setAbierto] = useState(null);
  const [verEntregadas, setVerEntregadas] = useState(false);

  useEffect(() => {
    async function fetchOrdenes() {
      const res = await fetch('/api/ver-ordenes');
      const data = await res.json();
      setOrdenes(data);
    }
    fetchOrdenes();
  }, []);

  // Agrupar por OC y añadir estado
  const agrupado = {};
  ordenes.forEach(row => {
    const [numeroOrden, nombreProyecto, fecha, nombre, unidad, cantidad, comentario, estado, fechaEntrega] = row;
    if (!agrupado[numeroOrden]) {
      agrupado[numeroOrden] = {
        proyecto: nombreProyecto,
        fecha,
        estado: estado || "pendiente",
        fechaEntrega: fechaEntrega || "",
        productos: []
      };
    }
    agrupado[numeroOrden].productos.push({ nombre, unidad, cantidad, comentario });
  });

  // Filtrar por estado
  const listaOC = Object.entries(agrupado)
    
    .filter(([, info]) => (verEntregadas ? info.estado === 'entregada' : info.estado !== 'entregada'));
    console.log(info.estado)

  const cambiarEstadoOC = async (numeroOrden, nuevoEstado) => {
    const res = await fetch('/api/cambiar-estado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numeroOrden, nuevoEstado }),
    });
    if (res.ok) {
      alert('Estado actualizado');
      window.location.reload();
    } else {
      alert('Error actualizando estado');
    }
  };

  return (
    <div className={styles.contenedor}>
      <h1>Órdenes {verEntregadas ? "Entregadas" : "Pendientes"}</h1>
      <button
        style={{
          marginBottom: '1rem',
          background: '#0074D9',
          color: 'white',
          padding: '0.6rem 1.5rem',
          borderRadius: '5px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        onClick={() => setVerEntregadas(v => !v)}
      >
        {verEntregadas ? "Ver Pendientes" : "Ver Entregadas"}
      </button>
      {listaOC.length === 0 ? (
        <p>No hay órdenes registradas.</p>
      ) : (
        listaOC.map(([oc, info], idx) => (
          <div key={oc} style={{
            border: '1px solid #ccc',
            borderRadius: '6px',
            marginBottom: '1rem',
            background: '#f8f8f8',
            boxShadow: abierto === idx ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
          }}>
            <button
              style={{
                width: '100%',
                padding: '1rem',
                fontWeight: 'bold',
                background: abierto === idx ? '#e8e8e8' : '#f8f8f8',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1.1rem'
              }}
              onClick={() => setAbierto(abierto === idx ? null : idx)}
            >
              {oc} &nbsp; | &nbsp; {info.proyecto} &nbsp; | &nbsp; {info.fecha}
              <span style={{ float: 'right' }}>
                <button
                  style={{
                    background: info.estado === 'entregada' ? '#F7DC6F' : '#58D68D',
                    color: '#333',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginLeft: '0.5rem'
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    cambiarEstadoOC(oc, info.estado === 'entregada' ? 'pendiente' : 'entregada');
                  }}
                >
                  {info.estado === 'entregada' ? "Marcar como pendiente" : "Marcar como entregada"}
                </button>
              </span>
            </button>
            {abierto === idx && (
              <div style={{ padding: '1rem', borderTop: '1px solid #ddd', background: 'white' }}>
                <strong>Productos:</strong>
                <ul>
                  {info.productos.map((prod, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 500 }}>{prod.nombre}</span>
                      {" - "}{prod.cantidad} {prod.unidad}
                      {prod.comentario && (
                        <span style={{ color: '#888' }}> ({prod.comentario})</span>
                      )}
                    </li>
                  ))}
                </ul>
                {info.estado === 'entregada' && (
                  <div style={{ fontSize: '0.95em', color: '#333', marginTop: 6 }}>
                    <strong>Fecha de entrega:</strong> {info.fechaEntrega || "Sin fecha"}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
