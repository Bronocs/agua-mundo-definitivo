import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Agregar() {
  const [materiales, setMateriales] = useState([{ cantidad: '', producto: '' }]);
  const [nombreProyecto, setNombreProyecto] = useState('');

  // Cambia valor en la fila indicada
  const handleInputChange = (idx, campo, valor) => {
    const nuevosMateriales = materiales.map((mat, i) =>
      i === idx ? { ...mat, [campo]: valor } : mat
    );
    setMateriales(nuevosMateriales);
  };

  // Presionar Enter: agrega fila solo si ambos campos están llenos y es la última fila
  const handleInputEnter = (idx, campo, e) => {
    if (e.key === 'Enter') {
      // Captura los valores de la fila actual *en ese momento*
      const cantidadActual = (campo === 'cantidad' ? e.target.value : materiales[idx].cantidad).trim();
      const productoActual = (campo === 'producto' ? e.target.value : materiales[idx].producto).trim();
      // Última fila, ambos llenos
      if (
        cantidadActual &&
        productoActual &&
        idx === materiales.length - 1
      ) {
        setMateriales([...materiales, { cantidad: '', producto: '' }]);
      }
    }
  };


  // Devuelve solo filas completas
  const getMaterialesFinal = () =>
    materiales.filter(
      m => m.cantidad.trim() !== '' && m.producto.trim() !== ''
    );

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
    // Aquí va tu lógica real de envío:
    alert(JSON.stringify({ nombreProyecto, productos: materialesFinal }, null, 2));
  };

  return (
    <div className={styles.contenedor}>
      <div className={styles.header2}>
        <button className={`${styles.iconBtn2} ${styles.btnAtras2}`} onClick={() => window.location.href = '/'}>Inicio</button>
        <h2 className={styles.btnLibre2}>Agregar producto</h2>
        <button className={`${styles.iconBtn2} ${styles.btnCerrar2}`} onClick={enviarPedidos}>Enviar</button>
      </div>

      <div className={styles.bloque_busqueda}>
        <label htmlFor="nombreProyecto" style={{ fontWeight: 'bold' }}>
          Nombre del Proyecto:
        </label>
        <input
          id="nombreProyecto"
          type="text"
          placeholder="Ejemplo: Planta Sur, Mantenimiento 2024, etc."
          value={nombreProyecto}
          onChange={e => setNombreProyecto(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.tablaMateriales}>
        <div className={styles.filaHeader}>
          <div className={styles.colCantidad}>Cantidad</div>
          <div className={styles.colProducto}>Producto</div>
        </div>
        {materiales.map((fila, idx) => {
          // Mostrar la primera fila siempre, las demás solo si tienen contenido
          if (
            idx === 0 ||
            (fila.cantidad.trim() !== '' || fila.producto.trim() !== '')
          ) {
            return (
              <div className={styles.fila} key={idx}>
                <input
                  className={styles.inputTabla}
                  type="text"
                  placeholder="Cantidad"
                  value={fila.cantidad}
                  onChange={e => handleInputChange(idx, 'cantidad', e.target.value)}
                  onKeyDown={e => handleInputEnter(idx, 'cantidad', e)}
                />
                <input
                  className={styles.inputTabla}
                  type="text"
                  placeholder="Producto"
                  value={fila.producto}
                  onChange={e => handleInputChange(idx, 'producto', e.target.value)}
                  onKeyDown={e => handleInputEnter(idx, 'producto', e)}
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
