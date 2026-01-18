// Frontend-bysso/src/hooks/useConfirm.jsx
import React, { useState, useCallback } from 'react';
import ConfirmDialog from '../components/ui/ConfirmDialog/ConfirmDialog.jsx';

const useConfirm = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [callbacks, setCallbacks] = useState({ onConfirm: () => {}, onCancel: () => {} });

    const openConfirm = useCallback((msg, onConfirmCallback, onCancelCallback = () => {}) => {
        setMessage(msg);
        setCallbacks({ onConfirm: onConfirmCallback, onCancel: onCancelCallback });
        setIsOpen(true);
    }, []);

    const handleConfirm = useCallback(() => {
        setIsOpen(false);
        callbacks.onConfirm();
    }, [callbacks]);

    const handleCancel = useCallback(() => {
        setIsOpen(false);
        callbacks.onCancel();
    }, [callbacks]);

    const ConfirmDialogComponent = useCallback(() => (
        <ConfirmDialog
            isOpen={isOpen}
            message={message}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    ), [isOpen, message, handleConfirm, handleCancel]);

    return { openConfirm, ConfirmDialog: ConfirmDialogComponent };
};

export default useConfirm;
