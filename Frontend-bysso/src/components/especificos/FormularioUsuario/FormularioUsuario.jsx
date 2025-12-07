// src/components/especificos/FormularioUsuario/FormularioUsuario.jsx
import React, { useState, useEffect } from 'react';
import styles from './FormularioUsuario.module.css';

const FormularioUsuario = ({ initialData, onSave, onClose, errorMessageApi }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN'); // Por defecto, crear rol ADMIN
  const [errors, setErrors] = useState({});

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode) {
      setEmail(initialData.email || '');
      setRole(initialData.role || 'ADMIN');
      // La contraseña no se precarga por seguridad
    }
  }, [initialData, isEditMode]);

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'El email es requerido.';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'El formato del email no es válido.';
    
    // La contraseña es requerida solo al crear un nuevo usuario
    if (!isEditMode && (!password || password.length < 8)) {
      newErrors.password = 'La contraseña es requerida y debe tener al menos 8 caracteres.';
    }
    // Si estamos editando y se ha escrito una nueva contraseña, validarla
    if (isEditMode && password && password.length < 8) {
      newErrors.password = 'La nueva contraseña debe tener al menos 8 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const userData = { email, role };
    // Solo incluir la contraseña si se ha proporcionado
    if (password) {
      userData.password = password;
    }

    onSave(userData, initialData?.id);
  };

  return (
    <form className={styles.formulario} onSubmit={handleSubmit}>
      <h2 className={styles.titulo}>{isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
      <button onClick={onClose} className={styles.closeButton} aria-label="Cerrar formulario">&times;</button>

      {errorMessageApi && <p className={styles.errorMessage}>{errorMessageApi}</p>}

      <div className={styles.inputGroup}>
        <label htmlFor="user-email">Email</label>
        <input
          id="user-email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="user-password">
          {isEditMode ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
        </label>
        <input
          id="user-password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isEditMode ? 'Dejar en blanco para no cambiar' : ''}
        />
        {errors.password && <p className={styles.errorMessage}>{errors.password}</p>}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="user-role">Rol</label>
        <select
          id="user-role"
          className={styles.select}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="ADMIN">Administrador (Recepcionista)</option>
          <option value="SUPER_ADMIN">Super Administrador</option>
        </select>
      </div>

      <div className={styles.botonesContainer}>
        <button type="button" className={`${styles.boton} ${styles.cancelar}`} onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className={`${styles.boton} ${styles.guardar}`}>
          Guardar
        </button>
      </div>
    </form>
  );
};

export default FormularioUsuario;
