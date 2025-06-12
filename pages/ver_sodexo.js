import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

export default function VerOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [abierto, setAbierto] = useState(null);
  const [verEntregadas, setVerEntregadas] = useState(false);

  // Traer órdenes
  const fetchOrdenes = async () => {
    const res = await fetch('/api/ver-ordenes');
    const data = await res.json();
    setOrdenes(data);
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  // Agrupar filas por número de orden
  const agrupado = {};
  ordenes.forEach(row => {
    const [numeroOrden, nombreProyecto, fecha, nombre, unidad, cantidad, comentario, estado, fechaEntrega] = row;
    // Normalización robusta del estado
    const estadoNorm = (estado || '')
      .normalize('NFD') // quita tildes
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    if (!agrupado[numeroOrden]) {
      agrupado[numeroOrden] = {
        proyecto: nombreProyecto,
        fecha,
        estado: estadoNorm,
        fechaEntrega: fechaEntrega || '',
        productos: []
      };
    }
    agrupado[numeroOrden].productos.push({ nombre, unidad, cantidad, comentario });
  });

  const irAEnlace = () => {
    window.location.href = 'https://agua-mundo-definitivo.vercel.app/';
  };

  // Convertir a lista y filtrar según entregadas/pendientes (ahora usando includes)
  let listaOC = Object.entries(agrupado).filter(([, info]) =>
    verEntregadas
      ? info.estado.includes('entregado')
      : !info.estado.includes('entregado')
  );

  // Ordenar por fecha descendente (más recientes primero)
  listaOC.sort(([, aInfo], [, bInfo]) => {
    const parseFecha = str => {
      if (!str) return 0;
      const [d, m, y] = (str || '').split('/').map(Number);
      return new Date(y, m - 1, d).getTime();
    };
    return parseFecha(bInfo.fecha) - parseFecha(aInfo.fecha);
  });

  // Cambiar estado de una orden y refrescar lista
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
        <button type="button" className={`${styles.iconBtn2} ${styles.btnAtras2}`} onClick={irAEnlace}>Inicio</button>
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
        <p>No hay órdenes para mostrar.</p>
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
              {oc} &nbsp; | &nbsp; {info.proyecto} &nbsp; | &nbsp; {info.fecha}
              <span style={{ float: 'right' }}>
                <button
                  style={{
                    background: info.estado.includes('entregado') ? '#F7DC6F' : '#58D68D',
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
                    cambiarEstadoOC(
                      oc,
                      info.estado.includes('entregado') ? 'pendiente' : 'entregada'
                    );
                  }}
                >
                  {info.estado.includes('entregado')
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
                      <span style={{ fontWeight: 500 }}>{prod.nombre}</span>
                      {' - '}{prod.cantidad} {prod.unidad}
                      {prod.comentario && (
                        <span style={{ color: '#888' }}> ({prod.comentario})</span>
                      )}
                    </li>
                  ))}
                </ul>
                {info.estado.includes('entregado') && (
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
