import React from 'react';
import styles from './Paginacion.module.css';
import Boton from '../Boton/Boton';

const Paginacion = ({ currentPage, totalPages, onPageChange, loading }) => {
    if (totalPages <= 1) {
        return null; // No mostrar paginación si solo hay una página o menos
    }

    return (
        <div className={styles.paginacionContainer}>
            <Boton
                tipo="secundario"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
            >
                Anterior
            </Boton>
            <span className={styles.infoPagina}>
                Página {currentPage} de {totalPages}
            </span>
            <Boton
                tipo="secundario"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
            >
                Siguiente
            </Boton>
        </div>
    );
};

export default Paginacion;
