import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Importar el hook de autenticación
import styles from './Sidebar.module.css';

const Sidebar = ({ estaAbierto, alCerrarMenu }) => {
  const { user, logout } = useAuth(); // Obtener el usuario y la función logout del contexto

  return (
    <aside className={`${styles.menu} ${estaAbierto ? styles.abierto : ''}`}>
      <div className={styles.encabezadoMenu}>
        <h2 className={styles.tituloMenu}>Menú</h2>
        <button className={styles.botonCerrar} onClick={alCerrarMenu}>&times;</button>
      </div>
      <ul className={styles.listaMenu}>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? `${styles.enlaceMenu} ${styles.activo}` : styles.enlaceMenu)}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/pedidos" className={({ isActive }) => (isActive ? `${styles.enlaceMenu} ${styles.activo}` : styles.enlaceMenu)}>
            Orden de Pedido
          </NavLink>
        </li>
        <li>
          <NavLink to="/produccion" className={({ isActive }) => (isActive ? `${styles.enlaceMenu} ${styles.activo}` : styles.enlaceMenu)}>
            Orden de Producción
          </NavLink>
        </li>
        <li>
          <NavLink to="/finalizacion" className={({ isActive }) => (isActive ? `${styles.enlaceMenu} ${styles.activo}` : styles.enlaceMenu)}>
            Orden de Finalización
          </NavLink>
        </li>
        <li>
          <NavLink to="/historial" className={({ isActive }) => (isActive ? `${styles.enlaceMenu} ${styles.activo}` : styles.enlaceMenu)}>
            Historial de pedidos
          </NavLink>
        </li>
        <li>
          <NavLink to="/trabajadores" className={({ isActive }) => (isActive ? `${styles.enlaceMenu} ${styles.activo}` : styles.enlaceMenu)}>
            Gestion de trabajadores
          </NavLink>
        </li>
        {/* Renderizado condicional para el enlace de Gestión de Usuarios */}
        {user && user.role === 'SUPER_ADMIN' && (
          <li>
            <NavLink to="/gestion-usuarios" className={({ isActive }) => (isActive ? `${styles.enlaceMenu} ${styles.activo}` : styles.enlaceMenu)}>
              Gestión de Usuarios
            </NavLink>
          </li>
        )}
      </ul>
      
      {/* Contenedor del botón de logout */}
      <div className={styles.logoutContainer}>
        <button 
          className={`${styles.boton} ${styles.peligro}`} 
          onClick={logout}
        >
          Cerrar Sesión
        </button>
      </div>

      <div className={styles.footerSidebar}>
        <p>BYSSO Software</p>
        <p>v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
