// Frontend-bysso/src/components/ui/ConfirmDialog/ConfirmDialog.jsx
import React from 'react';
import Modal from '../Modal/Modal.jsx';
import Boton from '../Boton/Boton.jsx';
import styles from './ConfirmDialog.module.css';

const ConfirmDialog = ({ isOpen, message, onConfirm, onCancel }) => {
    return (
        <Modal
            estaAbierto={isOpen}
            alCerrar={onCancel} // Clicking overlay can cancel
            cierraAlHacerClickAfuera={true}
            customClass={styles.customModalClass}
        >
            <div className={styles.dialogContainer}>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <Boton tipo="peligro" onClick={onCancel}>
                        Cancelar
                    </Boton>
                    <Boton tipo="primario" onClick={onConfirm}>
                        Confirmar
                    </Boton>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
