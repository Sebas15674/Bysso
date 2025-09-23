import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} BYSSO. Todos los derechos reservados.</p>
    </footer>
  );
};

export default Footer;