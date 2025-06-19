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
        <div className={styles.btnLibre2} style={{ margin: '1rem 0' }}>
        <input
          type="text"
          placeholder="Nombre del Proyecto"
          value={nombreProyecto}
          onChange={e => setNombreProyecto(e.target.value)}
          style={{
            width: '100%',
            padding: '0.8rem',
            fontSize: '1rem',
            borderRadius: '6px',
            border: '1px solid #ccc'
          }}
        />
        </div>
        <button className={`${styles.iconBtn2} ${styles.btnCerrar2}`} onClick={enviarPedidos}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
          <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
          </svg>
        </button>
      </div>

      <div style={{width: '100%' }}>
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
                <td style={{ padding: '0.3rem', width: '50px'}}>
                  <input
                    type="text"
                    value={fila.cantidad}
                    placeholder="Cantidad"
                    onChange={e => handleInputChange(idx, 'cantidad', e.target.value)}
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
                <td style={{ padding: '0.3rem' }}>
                  <textarea
                    value={fila.producto}
                    placeholder="Producto"
                    onChange={e => handleInputChange(idx, 'producto', e.target.value)}
                    onInput={e => {
                      e.target.style.height = 'auto';              // Reset height
                      e.target.style.height = e.target.scrollHeight + 'px'; // Autosize
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') e.target.blur();
                    }}
                    style={{ width: '100%',
                             padding: '0.4rem',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            minHeight: '29.78px',
                            maxHeight: '120px',
                            resize: 'none',          // Opcional: oculta el "tirador"
                            overflowY: 'hidden',
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
