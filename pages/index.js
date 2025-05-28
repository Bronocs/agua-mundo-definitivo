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

  const enviarPedidos = async () => {
    try {
      const res = await fetch('/api/guardar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productos: materiales })
      });

      if (res.ok) {
        alert('Pedido enviado exitosamente');
        setMateriales([]); // limpia la lista si quieres
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
      <h2>Pedido de Materiales</h2>

      <div className={styles.botones}>
        <button onClick={() => setMostrarModal(true)}>➕</button>
        <button>📄</button>
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
