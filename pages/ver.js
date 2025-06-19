import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

export default function VerOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [abierto, setAbierto] = useState(null);
  const [verEntregadas, setVerEntregadas] = useState(false);

  // 1. Función para traer órdenes
  const fetchOrdenes = async () => {
    const res = await fetch('/api/ver-ordenes');
    const data = await res.json();
    setOrdenes(data);
  };

  // 2. Al montar, cargamos las órdenes
  useEffect(() => {
    fetchOrdenes();
  }, []);

  // 3. Agrupar filas por número de orden
  const agrupado = {};
  ordenes.forEach(row => {
    const [numeroOrden, nombreProyecto, fecha, hora, nombre, unidad, cantidad, comentario, estado, fechaEntrega] = row;
    const estadoNorm = (estado || '').trim().toLowerCase();

    if (!agrupado[numeroOrden]) {
      agrupado[numeroOrden] = {
        proyecto: nombreProyecto,
        fecha,
        hora,
        estado: estadoNorm,
        fechaEntrega: fechaEntrega || '',
        productos: []
      };
    }
    agrupado[numeroOrden].productos.push({ nombre, unidad, cantidad, comentario });
  });

  const irAEnlace = () => {
    window.location.href = 'https://agua-mundo-definitivo.vercel.app/';
    // o window.open('https://ejemplo.com','_blank') para nueva pestaña
  };
  
  // 4. Convertir a lista y filtrar según entregadas/pendientes
  let listaOC = Object.entries(agrupado).filter(([, info]) =>
    verEntregadas
      ? info.estado === 'entregada'
      : info.estado !== 'entregada'
  );

  // 5. Ordenar por fecha descendente (más recientes primero)
  listaOC.sort(([, aInfo], [, bInfo]) => {
    const parseFecha = str => {
      const [d, m, y] = str.split('/').map(Number);
      return new Date(y, m - 1, d).getTime();
    };
    return parseFecha(bInfo.fecha) - parseFecha(aInfo.fecha);
  });

  // 6. Cambiar estado de una orden y refrescar lista
  const cambiarEstadoOC = async (numeroOrden, nuevoEstado) => {
    const res = await fetch('/api/cambiar-estado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numeroOrden, nuevoEstado }),
    });
    if (res.ok) {
      alert('Estado actualizado');
      fetchOrdenes();
    } else {
      alert('Error actualizando estado');
    }
  };

  return (
    <div className={styles.contenedor}>
      <div className={styles.header2}>
        <button type="button" className={`${styles.iconBtn2} ${styles.btnAtras2}`} onClick={irAEnlace}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-door" viewBox="0 0 16 16">
          <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z"/>
          </svg>
        </button>
        <h1 className={styles.btnLibre2}>Órdenes {verEntregadas ? 'Entregadas' : 'Pendientes'}</h1>
      </div>
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
        {verEntregadas ? 'Ver Pendientes' : 'Ver Entregadas'}
      </button>

      {listaOC.length === 0 ? (
        <p>Cargando...</p>
      ) : (
        listaOC.map(([oc, info], idx) => (
          <div
            className={styles.botones_pendientes}
            key={oc}
            style={{
              boxShadow: abierto === idx ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
            }}
          >
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
              {oc} &nbsp; | &nbsp; {info.proyecto} &nbsp; | &nbsp; {info.fecha} &nbsp; {info.hora}
              <span style={{ float: 'right' }}>
                <button
                  style={{
                    background: info.estado === 'entregada' ? '#F7DC6F' : '#58D68D',
                    color: '#333',
                    border: 'none',
                    padding: '1.5rem',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginLeft: '0.5rem'
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    cambiarEstadoOC(
                      oc,
                      info.estado === 'entregada' ? 'pendiente' : 'entregada'
                    );
                  }}
                >
                  {info.estado === 'entregada'
                    ? 'Marcar como pendiente'
                    : 'Marcar como entregada'}
                </button>
              </span>
            </button>

            {abierto === idx && (
              <div style={{ padding: '1rem', borderTop: '1px solid #ddd', background: 'white' }}>
                <strong>Productos:</strong>
                <ul>
                  {info.productos.map((prod, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 500 }}>{prod.cantidad}</span>
                      {' - '}{prod.nombre} {prod.unidad}
                      {prod.comentario && (
                        <span style={{ color: '#888' }}> ({prod.comentario})</span>
                      )}
                    </li>
                  ))}
                </ul>
                {info.estado === 'entregada' && (
                  <div style={{ fontSize: '0.95em', color: '#333', marginTop: 6 }}>
                    <strong>Fecha de entrega:</strong> {info.fechaEntrega || 'Sin fecha'}
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
