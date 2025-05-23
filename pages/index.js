// pages/index.js
import { useState } from 'react';
import styles from '../styles/Home.module.css'; // Ahora usamos un CSS separado

export default function Home() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [materiales, setMateriales] = useState([]);

  const agregarMaterial = (e) => {
    e.preventDefault();
    const nombre = e.target.nombre.value;
    const cantidad = e.target.cantidad.value;
    const nuevo = { nombre, cantidad };
    setMateriales([...materiales, nuevo]);
    setMostrarFormulario(false);
  };

  const enviarPorCorreo = () => {
    alert("Enviar por correo: " + JSON.stringify(materiales));
  };

  return (
    <div className={styles.contenedor}>
      <h2 className={styles.titulo}>Pedido de Materiales</h2>

      <div className={styles.botones}>
        <button onClick={() => setMostrarFormulario(true)}>➕</button>
        <button>📄</button>
        <button onClick={enviarPorCorreo}>➡️</button>
      </div>

      {materiales.length === 0 ? (
        <p className={styles.sinDatos}>Sin datos</p>
      ) : (
        <ul className={styles.lista}>
          {materiales.map((item, index) => (
            <li key={index}>{item.nombre} - {item.cantidad}</li>
          ))}
        </ul>
      )}

      {mostrarFormulario && (
        <form onSubmit={agregarMaterial} className={styles.modal}>
          <h4>Nuevo material</h4>
          <input name="nombre" placeholder="Nombre" required />
          <input name="cantidad" type="number" placeholder="Cantidad" required />
          <div className={styles.modalBotones}>
            <button type="submit">Agregar</button>
            <button type="button" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}
