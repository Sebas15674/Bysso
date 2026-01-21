// src/components/ui/Boton/Boton.jsx
import React from 'react';
import styles from './Boton.module.css';

const Boton = ({ children, tipo, onClick, type, disabled }) => {
  // Combina la clase base con la clase que se le pasa por 'tipo'
  // Si tipo es 'primario', se convierte en styles.primario
  // Si tipo es 'exitoso', se convierte en styles.exitoso
  const claseBoton = `${styles.boton} ${styles[tipo]}`;

  return (
    <button type={type} className={claseBoton} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Boton;