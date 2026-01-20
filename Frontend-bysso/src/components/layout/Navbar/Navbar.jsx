import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Importar useAuth
import styles from './Navbar.module.css';
import logo from '../../../assets/images/marca.png'; // Asegúrate de que esta ruta sea correcta

const Navbar = ({ tituloPagina, alAbrirMenu }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Obtener el usuario del contexto

  const handleLogoClick = () => {
    if (user && user.role !== 'TRABAJADOR') {
      navigate('/');
    }
  };

  const formatRole = (role) => {
    if (!role) return '';
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Administrador';
      case 'ADMIN': return 'Administrador';
      case 'TRABAJADOR': return 'Trabajador';
      case 'USER': return 'Usuario'; // Assuming a default 'USER' role for completeness
      default: return role;
    }
  };
  
  return (
    <header className={styles.navbar}>
      <div className={styles.leftContent}>
        <button className={styles.botonHamburguesa} onClick={alAbrirMenu}>
          &#9776;
        </button>
        <h1 className={styles.tituloPagina}>{tituloPagina}</h1>
      </div>
      <div className={styles.centerContent}>
        {user && user.role && (
          <span className={styles.userRoleBadge}>
            {formatRole(user.role)}
          </span>
        )}
      </div>
      <div className={styles.marcaContainer} onClick={handleLogoClick}>
        <img
          src={logo}
          alt="Logo de la empresa"
          className={styles.marca}
        />
      </div>
    </header>
  );
};

export default Navbar;