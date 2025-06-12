// pages/ver-ordenes.js
import { useEffect, useState } from 'react';
import styles from '../styles/VerOrdenes.module.css';

export default function VerOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [showDelivered, setShowDelivered] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/ver-ordenes');
      const data = await res.json();
      setOrdenes(data);
    }
    fetchData();
  }, []);

  // Extrae campos relevantes de cada fila
  const parsed = ordenes.map(row_sodexo => ({
    nroOC: row_sodexo[10] || '',
    prioridad: row_sodexo[7] || '',
    direccion: row_sodexo[12] || '',
    linkOC:    row_sodexo[14] || '',
    status:    (row_sodexo[8] || '').toLowerCase(),
  }));

  // Filtra por pendientes/entregadas
  const filtered = parsed.filter(item => {
    const isDelivered = item.status === 'entregada';
    return showDelivered ? isDelivered : !isDelivered;
  }).filter(item => {
    const term = search.toLowerCase();
    return (
      item.nroOC.toLowerCase().includes(term) ||
      item.prioridad.toLowerCase().includes(term) ||
      item.direccion.toLowerCase().includes(term)
    );
  });

  return (
    <div className={styles.container}>
      <h1>Órdenes {showDelivered ? 'Entregadas' : 'Pendientes'}</h1>
      <div className={styles.controls}>
        <button onClick={() => setShowDelivered(false)}
                className={!showDelivered ? styles.active : ''}>
          Pendientes
        </button>
        <button onClick={() => setShowDelivered(true)}
                className={showDelivered ? styles.active : ''}>
          Entregadas
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar N°OC, prioridad o dirección"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className={styles.search}
      />

      <ul className={styles.list}>
        {filtered.map((o, i) => (
          <li key={i} className={styles.item}>
            <div>
              <strong>OC:</strong> {o.nroOC} &nbsp; |
              &nbsp; <strong>Prioridad:</strong> {o.prioridad}
            </div>
            <div>
              <strong>Dirección:</strong> {o.direccion}
            </div>
            <button
              className={styles.linkBtn}
              onClick={() => window.open(o.linkOC, '_blank')}
              disabled={!o.linkOC}
            >
              Ver Orden
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
