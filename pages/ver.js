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
    <table className={styles.tabla}>
      <thead>
        <tr>
          <th className={styles.celda + ' ' + styles.encabezado}>Fecha</th>
          <th className={styles.celda + ' ' + styles.encabezado}>Nombre</th>
          <th className={styles.celda + ' ' + styles.encabezado}>Unidad</th>
          <th className={styles.celda + ' ' + styles.encabezado}>Cantidad</th>
          <th className={styles.celda + ' ' + styles.encabezado}>Comentario</th>
        </tr>
      </thead>
      <tbody>
        {ordenes.map((orden, i) => (
          <tr key={i}>
            {orden.map((celda, j) => (
              <td key={j} className={styles.celda}>{celda}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>

  );
}
