import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import logo from '../../../assets/images/marca.png'; // Asegúrate de que esta ruta sea correcta

const Navbar = ({ tituloPagina, alAbrirMenu }) => {
  const navigate = useNavigate();
  
  return (
    <header className={styles.navbar}>
      <div className={styles.leftContent}>
        <button className={styles.botonHamburguesa} onClick={alAbrirMenu}>
          &#9776;
        </button>
        <h1 className={styles.tituloPagina}>{tituloPagina}</h1>
      </div>
      <div className={styles.marcaContainer} onClick={() => navigate('/')}>
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