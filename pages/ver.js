// pages/ver.js
import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

export default function VerOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [abierto, setAbierto] = useState(null);

  useEffect(() => {
    async function fetchOrdenes() {
      const res = await fetch('/api/ver-ordenes');
      const data = await res.json();
      setOrdenes(data);
    }
    fetchOrdenes();
  }, []);

  // Agrupar productos por número de orden
  const agrupado = {};
  ordenes.forEach(row => {
    const [numeroOrden, nombreProyecto, fecha, nombre, unidad, cantidad, comentario] = row;
    if (!agrupado[numeroOrden]) {
      agrupado[numeroOrden] = {
        proyecto: nombreProyecto,
        fecha,
        productos: []
      };
    }
    agrupado[numeroOrden].productos.push({ nombre, unidad, cantidad, comentario });
  });

  const listaOC = Object.entries(agrupado);

  return (
    <div className={styles.contenedor}>
      <h1>Órdenes Registradas</h1>
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
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
