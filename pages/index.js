// pages/index.js
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.contenedor}>
      <h1>Gestión de Pedidos</h1>
      <div className={styles.botones}>
        <Link href="/agregar">
          <button>➕ Agregar Pedido</button>
        </Link>
        <Link href="/ver">
          <button>📄 Ver Órdenes</button>
        </Link>
      </div>
    </div>
  );
}
