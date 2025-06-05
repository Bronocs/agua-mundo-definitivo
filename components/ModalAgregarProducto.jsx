import { useState, useRef, useEffect } from 'react';
import debounce from 'lodash.debounce';
import styles from '../styles/Modal.module.css';

// Elimina tildes, convierte a minúsculas y reemplaza confusiones comunes
function normaliza(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // Quita tildes
    .replace(/b/g, "v") // b y v como equivalentes
    .replace(/v/g, "b")
    .replace(/c/g, "s") // c, s y z como equivalentes
    .replace(/s/g, "c")
    .replace(/z/g, "s")
    .replace(/h/g, "");  // Quita h muda
}

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
  const [sugerencias, setSugerencias] = useState('');
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
  const [threadId, setThreadId] = useState(null);

  const comentarioRef = useRef(null);

  // Crea el thread solo al montar el componente
  useEffect(() => {
    async function crearThread() {
      if (!threadId) {
        const res = await fetch('/api/crear-thread', { method: 'POST' });
        const data = await res.json();
        setThreadId(data.thread_id);
      }
    }
    crearThread();
    // eslint-disable-next-line
  }, []);

  // ---- DEBOUNCED FETCH A LA IA ----
  const debouncedFetchIA = useRef(
    debounce((consulta, productosReducidos, setSugerencias, setCargandoSugerencias, threadIdParam) => {
      // ¡NO intenta fetch si no hay threadId!
      if (!threadIdParam) return;
      setCargandoSugerencias(true);
      fetch('/api/recomendar-producto', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consulta,
          productos: productosReducidos,
          thread_id: threadIdParam
        })
      })
        .then(res => res.json())
        .then(data => {
          setSugerencias(data.sugerencias);
          setCargandoSugerencias(false);
        })
        .catch(() => {
          setSugerencias('No se pudo obtener sugerencias');
          setCargandoSugerencias(false);
        });
    }, 1000)
  ).current;
  // -------------------------------

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
    const textoBuscado = normaliza(busqueda);
    let productosFiltrados = productos.filter(p => {
      const nombreNorm = normaliza(p.nombre);
      const codigoNorm = (p.codigo || '').toLowerCase();
      return nombreNorm.includes(textoBuscado) || codigoNorm.includes(busqueda.toLowerCase());
    });

    setResultados(productosFiltrados);

    // --- solo busca en IA si threadId existe ---
    if (
      busqueda.length > 2 &&
      productosFiltrados.length === 0 &&
      threadId // <-- chequea que ya hay threadId antes de llamar al debounce
    ) {
      let productosReducidos = productos.filter(p => {
        const nombreNorm = normaliza(p.nombre);
        return nombreNorm.includes(textoBuscado.slice(0, 2));
      }).slice(0, 15);

      if (productosReducidos.length === 0) {
        productosReducidos = productos.slice(0, 15);
      }

      debouncedFetchIA(busqueda, productosReducidos, setSugerencias, setCargandoSugerencias, threadId);
    } else {
      setSugerencias('');
      setCargandoSugerencias(false);
    }
    // eslint-disable-next-line
  }, [busqueda, productos, threadId]); // <-- threadId como dependencia

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
                disabled={!threadId} // <-- opcional: deshabilita input hasta tener threadId
              />
            </div>

            <button className={styles.btnLibre} onClick={() => {
              setModoLibre(true);
              setSeleccionado(null);
              setBusqueda('');
              setResultados([]);
              setSugerencias('');
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

            {/* SUGERENCIAS DE CHATGPT */}
            {!resultados.length && sugerencias && (
              <div className={styles.sugerencias}>
                <strong>¿Quizás buscabas?</strong>
                <div>
                  {cargandoSugerencias ? 'Consultando a la IA...' : sugerencias}
                </div>
              </div>
            )}
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
