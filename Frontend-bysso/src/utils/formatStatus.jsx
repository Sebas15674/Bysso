
import React from 'react';
import { snakeToTitleCase } from './formatText.js';
// Assuming we'll create this CSS module, adjust path if necessary
import styles from '../styles/StatusBadge.module.css';

const formatStatus = (status) => {
  if (!status) return null;

  const formattedStatus = snakeToTitleCase(status);

  let badgeClass = '';
  switch (status) {
    case 'PENDIENTE':
      badgeClass = styles.statusPending;
      break;
    case 'EN_PRODUCCION':
      badgeClass = styles.statusInProduction;
      break;
    case 'COMPLETADO':
      badgeClass = styles.statusCompleted;
      break;
    case 'CANCELADO':
      badgeClass = styles.statusCancelled;
      break;
    case 'EN_PROCESO': // For production
      badgeClass = styles.statusInProgress;
      break;
    case 'LISTO_PARA_ENTREGA':
      badgeClass = styles.statusReadyForDelivery;
      break;
    case 'ENTREGADO':
      badgeClass = styles.statusDelivered;
      break;
    default:
      badgeClass = styles.statusDefault;
  }

  return (
    <span className={`${styles.statusBadge} ${badgeClass}`}>
      {formattedStatus}
    </span>
  );
};

export default formatStatus;
