// pages/index.js
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.contenedor2}>
      <h1>Pedidos Agua Mundo</h1>
      <div className={styles.botones2}>
        <Link href="/agregar">
          <button>➕ Crear Pedido</button>
        </Link>
        <Link href="/ver">
          <button>📄 Ver Órdenes</button>
        </Link>
      </div>
    </div>
  );
}
