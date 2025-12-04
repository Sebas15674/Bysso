import React, { useState, useEffect } from 'react';
import styles from './FormularioTrabajador.module.css';
import Boton from '../../ui/Boton/Boton';
import { useWorkers } from '../../../context/WorkerContext';

const FormularioTrabajador = ({ onSave, onClose, initialData }) => {
  const { addWorker, editWorker } = useWorkers();

  const [nombre, setNombre] = useState('');
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData;

  useEffect(() => {
    if (isEditing) {
      setNombre(initialData.nombre);
      setActivo(initialData.activo);
    }
  }, [initialData, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isEditing) {
        await editWorker(initialData.id, { nombre, activo });
      } else {
        // Al crear, solo enviamos 'nombre'. El backend lo pone activo por defecto.
        await addWorker({ nombre });
      }
      onSave(); // Refresca los datos en la página principal
      onClose(); // Cierra el modal
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el trabajador.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contenedorFormulario}>
      <h2 className={styles.tituloFormulario}>
        {isEditing ? 'Editar Trabajador' : 'Crear Nuevo Trabajador'}
      </h2>
      <form className={styles.formulario} onSubmit={handleSubmit}>
        <div className={styles.grupoCampo}>
          <label htmlFor="nombre">Nombre Completo</label>
          <input
            id="nombre"
            type="text"
            className={styles.entrada}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Juan Pérez"
            required
          />
        </div>

        {isEditing && (
          <div className={styles.grupoCampo}>
            <label>Estado</label>
            <div className={styles.grupoCheckbox}>
               <input
                 id="activo"
                 type="checkbox"
                 checked={activo}
                 onChange={(e) => setActivo(e.target.checked)}
               />
               <label htmlFor="activo">Activo</label>
            </div>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.acciones}>
          <Boton tipo="peligro" onClick={onClose} type="button" disabled={isSubmitting}>
            Cancelar
          </Boton>
          <Boton tipo="primario" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Boton>
        </div>
      </form>
    </div>
  );
};

export default FormularioTrabajador;
