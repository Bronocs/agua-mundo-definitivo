// pages/index.js
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.contenedor}>
      <img
        src="/logoAMalta.png"
        alt="Logo Agua Mundo"
        className={styles.logo}
      />
      <h1>Pedidos Agua Mundo lite</h1>
      <div className={styles.botones}>
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
