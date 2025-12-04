import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ estaAbierto, alCerrarMenu }) => {
  return (
    <aside className={`${styles.menu} ${estaAbierto ? styles.abierto : ''}`}>
      <div className={styles.encabezadoMenu}>
        <h2 className={styles.tituloMenu}>Menú</h2>
        <button className={styles.botonCerrar} onClick={alCerrarMenu}>&times;</button>
      </div>
      <ul className={styles.listaMenu}>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? `${styles.enlaceMenu} ${styles.activo}` : styles.enlaceMenu)} onClick={alCerrarMenu}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/pedidos" className={({ isActive }) => (isActive ? `${styles.enlaceMenu} ${styles.activo}` : styles.enlaceMenu)} onClick={alCerrarMenu}>
            Orden de Pedido
          </NavLink>
        </li>
        <li>
          <NavLink to="/produccion" className={({ isActive }) => (isActive ? `${styles.enlaceMenu} ${styles.activo}` : styles.enlaceMenu)} onClick={alCerrarMenu}>
            Orden de Producción
          </NavLink>
        </li>
        <li>
          <NavLink to="/finalizacion" className={({ isActive }) => (isActive ? `${styles.enlaceMenu} ${styles.activo}` : styles.enlaceMenu)} onClick={alCerrarMenu}>
            Orden de Finalización
          </NavLink>
        </li>
        <li>
          <NavLink to="/historial" className={({ isActive }) => (isActive ? `${styles.enlaceMenu} ${styles.activo}` : styles.enlaceMenu)} onClick={alCerrarMenu}>
            Historial de pedidos
          </NavLink>
        </li>
        <li>
          <NavLink to="/trabajadores" className={({ isActive }) => (isActive ? `${styles.enlaceMenu} ${styles.activo}` : styles.enlaceMenu)} onClick={alCerrarMenu}>
            Gestion de trabajadores
          </NavLink>
        </li>
      </ul>
      {/* Nuevo: El banner con la marca */}
      <div className={styles.footerSidebar}>
        <p>BYSSO Software</p>
        <p>v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
