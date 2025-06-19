import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Agregar() {
  const [materiales, setMateriales] = useState([
    { cantidad: '', producto: '' }
  ]);
  const [nombreProyecto, setNombreProyecto] = useState('');

  // Maneja cambios en los inputs de la tabla
  const handleInputChange = (idx, campo, valor) => {
    const nuevosMateriales = materiales.map((mat, i) =>
      i === idx ? { ...mat, [campo]: valor } : mat
    );

    // Si esta es la última fila y tiene datos en ambos campos, agrega una nueva fila vacía
    let materialesActualizados = nuevosMateriales;
    if (
      idx === materiales.length - 1 &&
      nuevosMateriales[idx].cantidad.trim() &&
      nuevosMateriales[idx].producto.trim()
    ) {
      materialesActualizados = [...nuevosMateriales, { cantidad: '', producto: '' }];
    }

    // Elimina filas vacías, dejando solo UNA al final si todas están vacías o solo la última vacía
    // Mantiene la primera vacía si es la única
    const noVacias = materialesActualizados.filter(
      (m, i) =>
        i === materialesActualizados.length - 1 || // Deja la última aunque esté vacía
        m.cantidad.trim() !== '' ||
        m.producto.trim() !== ''
    );
    setMateriales(noVacias);
  };

  // Eliminar filas vacías antes de enviar
  const getMaterialesFinal = () =>
    materiales.filter(
      m => m.cantidad.trim() !== '' && m.producto.trim() !== ''
    );

  // Envía los materiales (ejemplo)
  const enviarPedidos = () => {
    const materialesFinal = getMaterialesFinal();
    if (!nombreProyecto.trim()) {
      alert('Por favor, ingresa el nombre del proyecto');
      return;
    }
    if (materialesFinal.length === 0) {
      alert('Agrega al menos un producto.');
      return;
    }
    // Aquí tu lógica de envío, por ejemplo usando fetch
    alert(JSON.stringify({ nombreProyecto, productos: materialesFinal }, null, 2));
  };

  return (
    <div className={styles.contenedor}>
      <div className={styles.header2}>
        <button className={`${styles.iconBtn2} ${styles.btnAtras2}`} onClick={() => window.location.href = '/'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-door" viewBox="0 0 16 16">
          <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z"/>
          </svg>
        </button>
        <h2 className={styles.btnLibre2}>Agregar producto</h2>
        <button className={`${styles.iconBtn2} ${styles.btnCerrar2}`} onClick={enviarPedidos}>Enviar</button>
      </div>

      <div style={{ margin: '1rem 0' }}>
        <label style={{ fontWeight: 'bold' }}>Nombre del Proyecto:</label>
        <input
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

      <div style={{ marginTop: '2rem', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Cantidad</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Producto</th>
            </tr>
          </thead>
          <tbody>
            {materiales.map((fila, idx) => (
              <tr key={idx}>
                <td style={{ padding: '0.3rem' }}>
                  <input
                    type="text"
                    value={fila.cantidad}
                    placeholder="Cantidad"
                    onChange={e => handleInputChange(idx, 'cantidad', e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') e.target.blur();
                    }}
                    style={{ width: '80px', 
                            padding: '0.4rem',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                    }}
                  />
                </td>
                <td style={{ padding: '0.3rem' }}>
                  <input
                    type="text"
                    value={fila.producto}
                    placeholder="Producto"
                    onChange={e => handleInputChange(idx, 'producto', e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') e.target.blur();
                    }}
                    style={{ width: '100%',
                             padding: '0.4rem',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
