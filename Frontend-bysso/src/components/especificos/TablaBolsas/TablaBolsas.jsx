// src/components/especificos/TablaBolsas/TablaBolsas.jsx
import React from 'react';
import styles from './TablaBolsas.module.css';
import statusBadgeStyles from '../../../styles/StatusBadge.module.css';
import idBadgeStyles from '../../../styles/IdBadge.module.css';

const IconoEliminar = () => '🗑️';

const statusDisplay = {
  DISPONIBLE: { text: 'Disponible', className: statusBadgeStyles.statusDisponible },
  OCUPADA: { text: 'Ocupada', className: statusBadgeStyles.statusOcupada },
};

const TablaBolsas = ({ bolsas, onDelete }) => {
  const getStatusBadge = (status) => {
    const config = statusDisplay[status] || { text: status, className: statusBadgeStyles.statusDefault };
    return <span className={`${statusBadgeStyles.statusBadge} ${config.className}`}>{config.text}</span>;
  };

  return (
    <div className={styles.contenedorTabla}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>ID Bolsa</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {bolsas.length > 0 ? (
            bolsas.map((bag) => (
              <tr key={bag.id}>
                <td><span className={idBadgeStyles.idBadge}>{bag.id}</span></td>
                <td>{getStatusBadge(bag.status)}</td>
                <td>
                  <div className={styles.columnaAcciones}>
                    <button
                      className={`${styles.botonAccion} ${styles.eliminar}`}
                      onClick={() => onDelete(bag)}
                      disabled={bag.status === 'OCUPADA'}
                      aria-label={`Eliminar bolsa ${bag.id}`}
                      title={bag.status === 'OCUPADA' ? 'No se puede eliminar una bolsa en uso' : 'Eliminar bolsa'}
                    >
                      <IconoEliminar />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className={styles.mensajeVacio}>
                No se encontraron bolsas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaBolsas;
