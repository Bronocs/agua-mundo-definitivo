// pages/ver-ordenes.js
import { useEffect, useState } from 'react';
import styles from '../styles/VerOrdenes.module.css';

export default function VerOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [showDelivered, setShowDelivered] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/ver-ordenes_sodexo');
      const data = await res.json();
      setOrdenes(data);
    }
    fetchData();
  }, []);

  // Extrae y normaliza campos relevantes de cada fila
  const parsed = ordenes.map(row_sodexo => ({
    nroOC:      row_sodexo[10] || '',
    prioridad:  row_sodexo[7]  || '',
    direccion:  row_sodexo[12] || '',
    linkOC:     row_sodexo[14] || '',
    // Normalización robusta del status
    status: (row_sodexo[8] || '')
      .normalize('NFD') // elimina tildes
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim(),
  }));

  // Filtro por entregadas/pendientes según showDelivered
  const filtered = parsed
    .filter(item => {
      // Acepta "entregado", "entregada", etc.
      const isDelivered = item.status.includes('entregado');
      return showDelivered ? isDelivered : !isDelivered;
    })
    .filter(item => {
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
      <button
        onClick={() => setShowDelivered(v => !v)}
        className={styles.toggleBtn}
        style={{
          margin: '0 auto 1.5rem auto',
          display: 'block',
          background: '#0074D9',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '0.6rem 1.2rem',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        {showDelivered ? 'Ver Pendientes' : 'Ver Entregadas'}
      </button>

      <input
        type="text"
        placeholder="Buscar N°OC, prioridad o dirección"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className={styles.search}
      />

      <ul className={styles.list}>
        {filtered.length === 0 && (
          <li className={styles.item} style={{ textAlign: 'center', color: '#888' }}>
            No hay órdenes para mostrar.
          </li>
        )}
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
