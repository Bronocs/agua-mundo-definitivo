// pages/ver.js
import styles from '../styles/Home.module.css';

export default function VerOrdenes() {
  return (
    <div className={styles.contenedor}>
      <h1>Órdenes Registradas</h1>
      <p>
        Puedes ver las órdenes registradas en la siguiente hoja de cálculo:
      </p>
      <a
        href="https://docs.google.com/spreadsheets/d/1EdrOABPCEopWxMDAMgURrIZUoCnWNxZqwjQLaqhUGx0/edit#gid=20374905A&range=A2:E"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        📄 Abrir hoja de Google Sheets
      </a>
    </div>
  );
}
