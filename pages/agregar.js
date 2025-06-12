// pages/agregar.js
import { useState, useEffect, useRef } from 'react';
import ModalAgregarProducto from '../components/ModalAgregarProducto.jsx';
import styles from '../styles/Home.module.css';

export default function Agregar() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [materiales, setMateriales] = useState([]);
  const [nombreProyecto, setNombreProyecto] = useState('');
  const modalRef = useRef(null);

  // Cuando mostrarModal pase a true, desplazamos la vista hasta el modal
  useEffect(() => {
    if (mostrarModal && modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [mostrarModal]);

  const agregarProducto = (producto) => {
    setMateriales([...materiales, producto]);
  };

  const irAEnlace = () => {
    window.location.href = 'https://https://agua-mundo-definitivo.vercel.app/';
    // o window.open('https://ejemplo.com','_blank') para nueva pestaña
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
      <div className={styles.header2}>
        <button type="button" className={`${styles.iconBtn2} ${styles.btnAtras2}`} onClick={irAEnlace}>
          ←
        </button>
        <h2 className={styles.btnLibre}>Agregar producto</h2>
        <button type="button" className={`${styles.iconBtn2} ${styles.btnCerrar2}`} onClick={enviarPedidos}>✕
        </button>
      </div>

      {/* Nombre del proyecto */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="nombreProyecto" style={{ fontWeight: 'bold' }}>
          Nombre del Proyecto:
        </label>
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

      {/* Botones */}
      <div className={styles.botones_abajo}>
        <button onClick={() => setMostrarModal(true)}>➕</button>
        <button onClick={enviarPedidos}>➡️</button>
      </div>

      {/* Lista de materiales */}
      {materiales.length === 0 ? (
        <p className={styles.sinDatos}>Sin datos</p>
      ) : (
        <ul className={styles.materialesLista}>
          {materiales.map((item, i) => (
            <li key={i}>
              {item.nombre} - {item.cantidad} {item.unidad}{' '}
              {item.comentario && `(${item.comentario})`}
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {mostrarModal && (
        // Apuntamos la ref al nodo que contendrá el .modal
        <div ref={modalRef}>
          <ModalAgregarProducto
            onClose={() => setMostrarModal(false)}
            onAgregar={agregarProducto}
            modoLibre={false}
          />
        </div>
      )}
    </div>
  );
}