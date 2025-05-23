// pages/index.js
import { useState } from 'react';

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
    // Aquí luego llamaremos a una API para enviar por correo
    alert("Enviar por correo: " + JSON.stringify(materiales));
  };

  return (
    <div style={styles.contenedor}>
      <h2>Pedido de Materiales</h2>

      <div style={styles.botones}>
        <button onClick={() => setMostrarFormulario(true)}>➕</button>
        <button>📄</button>
        <button onClick={enviarPorCorreo}>➡️</button>
      </div>

      {materiales.length === 0 ? (
        <p>Sin datos</p>
      ) : (
        <ul>
          {materiales.map((item, index) => (
            <li key={index}>
              {item.nombre} - {item.cantidad}
            </li>
          ))}
        </ul>
      )}

      {mostrarFormulario && (
        <form onSubmit={agregarMaterial} style={styles.modal}>
          <h4>Nuevo material</h4>
          <input name="nombre" placeholder="Nombre" required />
          <input name="cantidad" type="number" placeholder="Cantidad" required />
          <br />
          <button type="submit">Agregar</button>
          <button type="button" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
        </form>
      )}
    </div>
  );
}

const styles = {
  contenedor: {
    padding: 20,
    fontFamily: 'sans-serif',
    maxWidth: 400,
    margin: 'auto',
  },
  botones: {
    display: 'flex',
    gap: 10,
    marginBottom: 20,
  },
  modal: {
    position: 'fixed',
    top: 100,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    padding: 20,
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
    zIndex: 10,
  },
};
