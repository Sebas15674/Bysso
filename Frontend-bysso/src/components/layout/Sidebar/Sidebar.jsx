import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Importar el hook de autenticación
import useConfirm from '../../../hooks/useConfirm'; // Importar el hook useConfirm
import styles from './Sidebar.module.css';

const Sidebar = ({ estaAbierto, alCerrarMenu }) => {
  const { user, logout } = useAuth(); // Obtener el usuario y la función logout del contexto
  const { openConfirm, ConfirmDialog } = useConfirm(); // Obtener funciones del hook useConfirm

  // Define menu items with roles that can access them
  const menuItems = [
    {
      path: "/",
      label: "Dashboard",
      allowedRoles: ["SUPER_ADMIN", "ADMIN"]
    },
    {
      path: "/pedidos",
      label: "Orden de Pedido",
      allowedRoles: ["SUPER_ADMIN", "ADMIN"]
    },
    {
      path: "/produccion",
      label: "Orden de Producción",
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "TRABAJADOR"]
    },
    {
      path: "/finalizacion",
      label: "Orden de Finalización",
      allowedRoles: ["SUPER_ADMIN", "ADMIN"]
    },
    {
      path: "/historial",
      label: "Historial de pedidos",
      allowedRoles: ["SUPER_ADMIN", "ADMIN"]
    },
    {
      path: "/trabajadores",
      label: "Gestion de trabajadores",
      allowedRoles: ["SUPER_ADMIN", "ADMIN"]
    },
    {
      path: "/gestion-usuarios",
      label: "Gestión de Usuarios",
      allowedRoles: ["SUPER_ADMIN"]
    },
    {
      path: "/bolsas",
      label: "Gestión de Bolsas",
      allowedRoles: ["SUPER_ADMIN", "ADMIN"]
    }
  ];

  const handleLogoutClick = () => {
    openConfirm(
      '¿Estás seguro de que quieres cerrar tu sesión?',
      () => {
        logout(); // Función de logout del AuthContext
        alCerrarMenu(); // Cierra el menú después de cerrar sesión
      },
      () => {
        // Opcional: acciones si el usuario cancela el logout
        console.log('Cierre de sesión cancelado.');
      }
    );
  };

  return (
    <aside className={`${styles.menu} ${estaAbierto ? styles.abierto : ''}`}>
      <div className={styles.encabezadoMenu}>
        <h2 className={styles.tituloMenu}>Menú</h2>
        <button className={styles.botonCerrar} onClick={alCerrarMenu}>&times;</button>
      </div>
      <ul className={styles.listaMenu}>
        {user && menuItems.map((item) => {
          if (item.allowedRoles.includes(user.role)) {
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => (isActive ? `${styles.enlaceMenu} ${styles.activo}` : styles.enlaceMenu)}
                >
                  {item.label}
                </NavLink>
              </li>
            );
          }
          return null;
        })}
      </ul>

      {/* Contenedor del botón de logout */}
      <div className={styles.logoutContainer}>
        <button
          className={`${styles.boton} ${styles.peligro}`}
          onClick={handleLogoutClick} // Llama al handler con la confirmación
        >
          Cerrar Sesión
        </button>
      </div>

      <div className={styles.footerSidebar}>
        <p>BYSSO Software</p>
        <p>v1.0.0</p>
      </div>
      <ConfirmDialog /> {/* Renderiza el componente de diálogo de confirmación */}
    </aside>
  );
};

export default Sidebar;