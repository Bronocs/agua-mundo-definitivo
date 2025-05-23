// components/ModalAgregarProducto.jsx
import { useState } from 'react';
import styles from '../styles/Modal.module.css';

// Simulación de base de datos local
const productosDB = [
  { nombre: 'TRAPO INDUSTRIAL', codigo: '32005362', unidad: 'KG' },
  { nombre: 'CLORO INDUSTRIAL', codigo: '32004555', unidad: 'PACK' },
  { nombre: 'BOLSA NEGRA', codigo: '15002341', unidad: 'UND' },
  { nombre: 'DETERGENTE', codigo: '87541230', unidad: 'BALDE' }
];

export default function ModalAgregarProducto({ onClose, onAgregar, modoLibre }) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [comentario, setComentario] = useState('');
  const [nombreLibre, setNombreLibre] = useState('');
  const [unidadLibre, setUnidadLibre] = useState('');

  const filtrar = (texto) => {
    const filtro = productosDB.filter(p =>
      p.nombre.toLowerCase().includes(texto.toLowerCase()) ||
      p.codigo.includes(texto)
    );
    setResultados(filtro);
  };

  const handleSubmit = () => {
    const producto = modoLibre
      ? { nombre: nombreLibre, unidad: unidadLibre, cantidad, comentario }
      : { ...seleccionado, cantidad, comentario };
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
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  filtrar(e.target.value);
                }}
              />
            </div>

            <button className={styles.btnLibre} onClick={() => setSeleccionado({ nombre: 'LIBRE', codigo: 'manual', unidad: '' })}>
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
                />
                <input
                  type="text"
                  placeholder="Unidad (ej: KG, UND...)"
                  value={unidadLibre}
                  onChange={(e) => setUnidadLibre(e.target.value)}
                />
              </>
            )}
            {!modoLibre && <p><strong>{seleccionado?.nombre}</strong></p>}
            <input
              type="number"
              placeholder="Cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
            <textarea
              name="comentario"
              placeholder="Comentario (opcional)"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
            <button className={styles.btnAgregar} onClick={handleSubmit}>Agregar</button>
          </div>
        )}

        <button className={styles.btnCancelar} onClick={onClose}>❌ CANCELAR</button>
      </div>
    </div>
  );
}
