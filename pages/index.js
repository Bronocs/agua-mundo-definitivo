// pages/index.js
import { useState } from 'react';
import ModalAgregarProducto from '../components/ModalAgregarProducto.jsx';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [materiales, setMateriales] = useState([]);

  const agregarProducto = (producto) => {
    setMateriales([...materiales, producto]);
  };

  return (
    <div className={styles.contenedor}>
      <h2>Pedido de Materiales</h2>

      <div className={styles.botones}>
        <button onClick={() => setMostrarModal(true)}>➕</button>
        <button>📄</button>
        <button onClick={() => alert("Enviar por correo")}>➡️</button>
      </div>

      {materiales.length === 0 ? (
        <p className={styles.sinDatos}>Sin datos</p>
      ) : (
        <ul>
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
