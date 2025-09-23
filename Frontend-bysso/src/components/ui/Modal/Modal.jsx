import React from 'react';
import styles from './Modal.module.css';

const Modal = ({ estaAbierto, alCerrar, children, cierraAlHacerClickAfuera }) => {
  if (!estaAbierto) return null;

  const handleSuperposicionClick = (e) => {
    // Si la prop `cierraAlHacerClickAfuera` es falsa,
    // simplemente no se llama a `alCerrar`.
    if (e.target.id === 'superposicion' && cierraAlHacerClickAfuera) {
      alCerrar();
    }
  };

  return (
    <div
      id="superposicion" // Identificador para la superposición
      className={styles.superposicion}
      onClick={handleSuperposicionClick}
    >
      <div className={styles.contenidoModal} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
