// components/ModalAgregarProducto.jsx
import { useState, useRef, useEffect } from 'react';
import styles from '../styles/Modal.module.css';

export default function ModalAgregarProducto({ onClose, onAgregar }) {
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [modoLibre, setModoLibre] = useState(false);
  const [cantidad, setCantidad] = useState('');
  const [comentario, setComentario] = useState('');
  const [nombreLibre, setNombreLibre] = useState('');
  const [unidadLibre, setUnidadLibre] = useState('');

  const comentarioRef = useRef(null);

  useEffect(() => {
    async function cargarProductos() {
      try {
        const res = await fetch('/api/productos');
        const data = await res.json();
        setProductos(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    }

    if (!modoLibre) cargarProductos();
  }, [modoLibre]);

  useEffect(() => {
    if (comentarioRef.current) {
      comentarioRef.current.style.height = 'auto';
      comentarioRef.current.style.height = comentarioRef.current.scrollHeight + 'px';
    }
  }, [comentario]);

  useEffect(() => {
    const filtro = productos.filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.includes(busqueda)
    );
    setResultados(filtro);
  }, [busqueda, productos]);

  const handleSubmit = () => {
    const fecha = new Date().toLocaleDateString('es-PE');
    const producto = modoLibre
      ? { fecha, nombre: nombreLibre, unidad: unidadLibre, cantidad, comentario }
      : { fecha, ...seleccionado, cantidad, comentario };
    if ((modoLibre && nombreLibre && unidadLibre && cantidad) || (!modoLibre && seleccionado && cantidad)) {
      onAgregar(producto);
      onClose();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>AÑADIR PRODUCTO</h3>

        {!modoLibre && !seleccionado && (
          <>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Buscar producto por nombre o código"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <button className={styles.btnLibre} onClick={() => {
              setModoLibre(true);
              setSeleccionado(null);
              setBusqueda('');
              setResultados([]);
            }}>
              + LIBRE
            </button>

            <div className={styles.lista}>
              {resultados.length === 0 ? (
                <p className={styles.sinDatos}>Sin datos</p>
              ) : (
                resultados.map((item, i) => (
                  <div key={i} className={styles.item} onClick={() => setSeleccionado(item)}>
                    <div>
                      <strong>{item.nombre}</strong>
                      <div className={styles.codigo}>{item.codigo}</div>
                    </div>
                    <div className={styles.unidad}>{item.unidad}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {(modoLibre || seleccionado) && (
          <div className={styles.formulario}>
            {modoLibre && (
              <>
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={nombreLibre}
                  onChange={(e) => setNombreLibre(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Unidad (ej: KG, UND...)"
                  value={unidadLibre}
                  onChange={(e) => setUnidadLibre(e.target.value)}
                  required
                />
              </>
            )}
            {!modoLibre && <p><strong>{seleccionado?.nombre}</strong></p>}
            <input
              type="number"
              placeholder="Cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
            />
            <textarea
              name="comentario"
              className={styles.textarea}
              placeholder="Comentario (opcional)"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              ref={comentarioRef}
            />

            <button className={styles.btnAgregar} onClick={handleSubmit}>Agregar</button>
          </div>
        )}

        <button className={styles.btnCancelar} onClick={onClose}>❌ CANCELAR</button>
      </div>
    </div>
  );
}
