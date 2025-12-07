// src/pages/GestionUsuarios/GestionUsuarios.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as usersService from '../../services/usersService';
import styles from './GestionUsuarios.module.css';
import TablaUsuarios from '../../components/especificos/TablaUsuarios/TablaUsuarios.jsx';
import FormularioUsuario from '../../components/especificos/FormularioUsuario/FormularioUsuario.jsx';

import Modal from '../../components/ui/Modal/Modal.jsx'; // Asumo que el modal es reutilizable
import formModalOverrides from '../../styles/FormModalOverrides.module.css'; // Importar overrides para modales de formulario

const GestionUsuarios = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null para crear, objeto de usuario para editar
  const [apiError, setApiError] = useState(''); // Error específico de la API para el formulario

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Si el usuario no es SUPER_ADMIN, no renderizar nada o mostrar un mensaje.
  if (user.role !== 'SUPER_ADMIN') {
    return (
      <div className={styles.contenedorPagina}>
        <p className={styles.mensajeError}>No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }
  
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setApiError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (userToEdit) => {
    setEditingUser(userToEdit);
    setApiError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setApiError('');
  };

  const handleSaveUser = async (userData, userId) => {
    try {
      if (userId) {
        // Modo Edición
        await usersService.updateUser(userId, userData);
      } else {
        // Modo Creación
        await usersService.createUser(userData);
      }
      fetchUsers(); // Recargar la lista de usuarios
      handleCloseModal();
    } catch (err) {
      setApiError(err.message || 'Ocurrió un error al guardar.');
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    // Evitar que un SUPER_ADMIN se elimine a sí mismo
    if (userToDelete.id === user.userId) {
        alert("No puedes eliminar tu propia cuenta.");
        return;
    }
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${userToDelete.email}?`)) {
      try {
        await usersService.deleteUser(userToDelete.id);
        fetchUsers(); // Recargar la lista de usuarios
      } catch (err) {
        setError(err.message || 'Error al eliminar el usuario.');
      }
    }
  };

  return (
    <div className={styles.contenedorPagina}>
      <div className={styles.header}>
        <h1 className={styles.tituloPagina}>Gestión de Usuarios</h1>
        <button className={styles.botonCrear} onClick={handleOpenCreateModal}>
          Crear Nuevo Usuario
        </button>
      </div>

      {loading && <p>Cargando usuarios...</p>}
      {error && <p className={styles.mensajeError}>{error}</p>}
      
      {!loading && !error && (
        <TablaUsuarios
          usuarios={users}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteUser}
        />
      )}

      <Modal
        estaAbierto={isModalOpen}
        alCerrar={handleCloseModal}
        customClass={formModalOverrides.transparentContainer} // Aplicar la clase para el contenedor transparente
      >
        <FormularioUsuario
          initialData={editingUser}
          onSave={handleSaveUser}
          onClose={handleCloseModal}
          errorMessageApi={apiError}
        />
      </Modal>
    </div>
  );
};

export default GestionUsuarios;
