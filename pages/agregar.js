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
        <button className={`${styles.iconBtn2} ${styles.btnAtras2}`} onClick={() => window.location.href = '/'}>Inicio</button>
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
