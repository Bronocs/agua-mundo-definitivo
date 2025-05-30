// pages/agregar.js
import { useState } from 'react';
import ModalAgregarProducto from '../components/ModalAgregarProducto.jsx';
import styles from '../styles/Home.module.css';

export default function Agregar() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [materiales, setMateriales] = useState([]);
  const [nombreProyecto, setNombreProyecto] = useState('');

  const agregarProducto = (producto) => {
    setMateriales([...materiales, producto]);
  };

  const enviarPedidos = async () => {
    if (!nombreProyecto.trim()) {
      alert("Por favor, ingresa el nombre del proyecto");
      return;
    }
    if (materiales.length === 0) {
      alert("Agrega al menos un producto.");
      return;
    }

    try {
      const res = await fetch('/api/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreProyecto,
          productos: materiales,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert('Pedido enviado correctamente. Número de orden: ' + data.numeroOrden);
        setMateriales([]);
        setNombreProyecto('');
      } else {
        alert('Error al enviar el pedido');
      }
    } catch (err) {
      console.error('Error al enviar:', err);
      alert('Error de conexión');
    }
  };

  return (
    <div className={styles.contenedor}>
      <h2>Agregar Pedido</h2>

      {/* Campo para el nombre del proyecto */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="nombreProyecto" style={{ fontWeight: 'bold' }}>Nombre del Proyecto:</label>
        <input
          id="nombreProyecto"
          type="text"
          placeholder="Ejemplo: Planta Sur, Mantenimiento 2024, etc."
          value={nombreProyecto}
          onChange={e => setNombreProyecto(e.target.value)}
          style={{
            width: '100%',
            padding: '0.8rem',
            fontSize: '1rem',
            marginTop: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #ccc'
          }}
        />
      </div>

      <div className={styles.botones}>
        <button onClick={() => setMostrarModal(true)}>➕</button>
        <button onClick={enviarPedidos}>➡️</button>
      </div>

      {materiales.length === 0 ? (
        <p className={styles.sinDatos}>Sin datos</p>
      ) : (
        <ul className={styles.materialesLista}>
          {materiales.map((item, i) => (
            <li key={i}>
              {item.nombre} - {item.cantidad} {item.unidad} {item.comentario && `(${item.comentario})`}
            </li>
          ))}
        </ul>
      )}

      {mostrarModal && (
        <ModalAgregarProducto
          onClose={() => setMostrarModal(false)}
          onAgregar={agregarProducto}
          modoLibre={false}
        />
      )}
    </div>
  );
}
