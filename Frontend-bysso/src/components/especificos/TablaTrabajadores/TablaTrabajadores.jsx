import React from 'react';
import styles from './TablaTrabajadores.module.css';
import Boton from '../../ui/Boton/Boton';

const TablaTrabajadores = ({ trabajadores, onEdit, onDelete }) => {
  return (
    <div className={styles.contenedorTabla}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {trabajadores.length > 0 ? (
            trabajadores.map((trabajador) => (
              <tr key={trabajador.id}>
                <td>{trabajador.nombre}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`${styles.estado} ${trabajador.activo ? styles.estadoActivo : styles.estadoInactivo}`}>
                    {trabajador.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className={styles.acciones}>
                    <Boton tipo="secundario" onClick={() => onEdit(trabajador)}>
                      Editar ✎
                    </Boton>
                    <Boton tipo="peligro" onClick={() => onDelete(trabajador)}>
                      Eliminar 🗑️
                    </Boton>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className={styles.mensajeVacio}>
                No se encontraron trabajadores.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaTrabajadores;
