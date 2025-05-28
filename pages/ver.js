// pages/ver.js
import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

export default function VerOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchOrdenes() {
      try {
        const res = await fetch('/api/ver-ordenes');
        const data = await res.json();
        setOrdenes(data);
      } catch (error) {
        console.error('Error al obtener órdenes:', error);
      } finally {
        setCargando(false);
      }
    }

    fetchOrdenes();
  }, []);

  return (
    <div className={styles.contenedor}>
      <h1>Órdenes Registradas</h1>
      {cargando ? (
        <p>Cargando órdenes...</p>
      ) : ordenes.length === 0 ? (
        <p>No hay órdenes registradas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nombre</th>
              <th>Unidad</th>
              <th>Cantidad</th>
              <th>Comentario</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden, i) => (
              <tr key={i}>
                {orden.map((celda, j) => (
                  <td key={j}>{celda}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
