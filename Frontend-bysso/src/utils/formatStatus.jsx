
import React from 'react';
// Assuming we'll create this CSS module, adjust path if necessary
import styles from '../styles/StatusBadge.module.css';

const formatStatus = (status) => {
  if (!status) return null;

  // Replace underscores with spaces and capitalize the first letter of each word
  const formattedStatus = status
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

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
