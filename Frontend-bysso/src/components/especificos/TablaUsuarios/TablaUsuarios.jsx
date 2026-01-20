// src/components/especificos/TablaUsuarios/TablaUsuarios.jsx
import React from 'react';
import styles from './TablaUsuarios.module.css';

// Importa íconos si los tienes, si no, usa texto.
// Asumiremos que tienes componentes de íconos o usaremos texto.
const IconoEditar = () => '✏️';
const IconoEliminar = () => '🗑️';


const TablaUsuarios = ({ usuarios, onEdit, onDelete }) => {
  return (
    <div className={styles.contenedorTabla}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Rol</th>
            <th>Fecha de Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length > 0 ? (
            usuarios.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>
                  <span className={`${styles.roleBadge} ${user.role === 'SUPER_ADMIN' ? styles.superAdmin : user.role === 'ADMIN' ? styles.admin : styles.trabajador}`}>
                    {user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Admin' : 'Trabajador'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.columnaAcciones}>
                    <button
                      className={`${styles.botonAccion} ${styles.editar}`}
                      onClick={() => onEdit(user)}
                      aria-label={`Editar usuario ${user.email}`}
                    >
                      <IconoEditar />
                    </button>
                    <button
                      className={`${styles.botonAccion} ${styles.eliminar}`}
                      onClick={() => onDelete(user)}
                      aria-label={`Eliminar usuario ${user.email}`}
                    >
                      <IconoEliminar />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className={styles.mensajeVacio}>
                No se encontraron usuarios.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaUsuarios;
