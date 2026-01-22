// src/components/especificos/FormularioBolsa/FormularioBolsa.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styles from './FormularioBolsa.module.css';
import Boton from '../../ui/Boton/Boton';

const FormularioBolsa = ({ onSave, onClose, errorMessageApi, existingBags = [] }) => {
    const [bagId, setBagId] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateBagId = useCallback((id) => {
        if (!id) {
            return '';
        }

        if (existingBags.includes(id)) {
            return `La bolsa '${id}' ya existe.`;
        }

        const match = id.match(/^(\d+)([av]?)$/);
        if (!match) {
            return "Formato inválido. Use números, o números con 'a' o 'v'.";
        }

        const num = parseInt(match[1], 10);
        const suffix = match[2];

        if (num >= 1 && num <= 20) {
            if (!suffix) {
                return `Para números del 1-20, debe añadir 'a' (azul) o 'v' (verde). Ej: '${id}a' o '${id}v'.`;
            }
        } else if (num > 20) {
            if (suffix) {
                return `Para números mayores a 20, no se debe añadir sufijo. Use solo el número. Ej: '${num}'.`;
            }
        } else {
             return "El número debe ser 1 o mayor.";
        }

        return ''; // No error
    }, [existingBags]);
    
    useEffect(() => {
        const validationError = validateBagId(bagId);
        setError(validationError);
    }, [bagId, validateBagId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateBagId(bagId);
        if (validationError || !bagId) {
            setError(validationError || 'El ID de la bolsa es obligatorio.');
            return;
        }

        setIsSubmitting(true);
        await onSave(bagId);
        setIsSubmitting(false);
    };

    return (
        <div className={styles.contenedorFormulario}>
            <h2 className={styles.tituloFormulario}>Crear Nueva Bolsa</h2>
            <button onClick={onClose} className={styles.closeButton} aria-label="Cerrar formulario">&times;</button>
            <form className={styles.formulario} onSubmit={handleSubmit}>
                <div className={styles.grupoCampo}>
                    <label htmlFor="bagId">ID de la Bolsa</label>
                    <input
                        id="bagId"
                        type="text"
                        className={styles.entrada}
                        value={bagId}
                        onChange={(e) => setBagId(e.target.value.toLowerCase())}
                        required
                        autoFocus
                    />
                    <p className={styles.helpText}>
                        Del 1-20, usar 'a' (azul) o 'v' (verde). Mayor a 20, solo el número.
                    </p>
                </div>

                {error && <p className={styles.error}>{error}</p>}
                {errorMessageApi && <p className={styles.apiError}>{errorMessageApi}</p>}

                <div className={styles.acciones}>
                    <Boton tipo="peligro" onClick={onClose} type="button" disabled={isSubmitting}>
                        Cancelar
                    </Boton>
                    <Boton tipo="primario" type="submit" disabled={isSubmitting || !!error || !bagId}>
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Boton>
                </div>
            </form>
        </div>
    );
};

export default FormularioBolsa;
