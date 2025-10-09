import React, { useState } from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './FormularioPedido.module.css';

// Recibimos la prop bolsasDisponibles
const FormularioPedido = ({ alGuardar, alCancelar, bolsasDisponibles }) => { 
  // Lista de trabajadores de la microempresa
  const trabajadores = ['Juan Pérez', 'María Gómez', 'Luis García'];

  const [datosFormulario, setDatosFormulario] = useState({
    cliente: '',
    cedula: '',
    celular: '',
    tipo: '',
    descripcion: '',
    abono: '',
    bolsa: '',
    prendas: '',
    fechaEntrega: '',
    total: '',
    imagen: null,
    trabajadorAsignado: '', 
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    // CRÍTICO: Si el campo es 'bolsa', aseguramos que el valor se guarde como NÚMERO
    const valorCorregido = name === 'bolsa' ? Number(value) : value;

    setDatosFormulario({ ...datosFormulario, [name]: valorCorregido });
  };

  const manejarImagen = (e) => {
    setDatosFormulario({ ...datosFormulario, imagen: e.target.files[0] });
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!datosFormulario.bolsa) {
        alert('Por favor, seleccione un número de bolsa disponible.');
        return;
    }
    alGuardar(datosFormulario);
  };

  return (
    <div className={styles.contenedorFormulario}>
      <h2 className={styles.tituloFormulario}>Nuevo Pedido</h2>
      <form onSubmit={manejarEnvio} className={styles.formulario}>
        <div className={styles.grupoCampos}>
          <input type="text" name="cliente" placeholder="Nombre completo" className={styles.entrada} onChange={manejarCambio} required />
          <input type="text" name="cedula" placeholder="Cédula" className={styles.entrada} onChange={manejarCambio} required />
          <input type="tel" name="celular" placeholder="Celular" className={styles.entrada} onChange={manejarCambio} required />
        </div>
        <div className={styles.grupoCampos}>
          <select name="tipo" className={styles.entrada} onChange={manejarCambio} required>
            <option value="">Seleccione un tipo</option>
            <option value="Bordado">Bordado</option>
            <option value="Estampado">Estampado</option>
            <option value="Estampado y Bordado">Estampado y Bordado</option>
          </select>
          <input type="date" name="fechaEntrega" className={styles.entrada} onChange={manejarCambio} required />
        </div>
        <textarea name="descripcion" placeholder="Descripción del pedido" className={styles.areaTexto} onChange={manejarCambio} required></textarea>
        <div className={styles.grupoCampos}>
          {/* CRÍTICO: CAMBIAMOS INPUT A SELECT Y USAMOS LA LISTA DE BOLSAS DISPONIBLES */}
          <select name="bolsa" className={styles.entrada} onChange={manejarCambio} required>
            <option value="">Nº Bolsa (Disponible)</option>
            {bolsasDisponibles.map((bolsa) => (
                <option key={bolsa} value={bolsa}>
                    {bolsa}
                </option>
            ))}
          </select>
          {/* <input type="number" name="bolsa" placeholder="Nº Bolsa" className={styles.entrada} onChange={manejarCambio} required /> */}
          <input type="number" name="prendas" placeholder="Nº Prendas" className={styles.entrada} onChange={manejarCambio} required />
          <input type="number" name="abono" placeholder="Abono" className={styles.entrada} onChange={manejarCambio} />
        </div>
        <div className={styles.grupoCampos}>
          <input type="number" name="total" placeholder="Total" className={styles.entrada} onChange={manejarCambio} />
          <div className={styles.contenedorArchivo}>
            <label htmlFor="inputArchivo" className={styles.etiquetaArchivo}>Seleccionar Imagen</label>
            <input id="inputArchivo" type="file" name="imagen" className={styles.inputArchivo} onChange={manejarImagen} />
            <span className={styles.nombreArchivo}>{datosFormulario.imagen ? datosFormulario.imagen.name : 'Sin archivo seleccionado'}</span>
          </div>
        </div>
        
        <div className={styles.grupoCampos}>
          <select name="trabajadorAsignado" className={styles.entrada} onChange={manejarCambio} required>
            <option value="">Selecciona un trabajador</option>
            {trabajadores.map((trabajador, index) => (
              <option key={index} value={trabajador}>
                {trabajador}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.acciones}>
          <Boton tipo="peligro" onClick={alCancelar}>Cancelar</Boton>
          <Boton tipo="exito" type="submit">Guardar</Boton>
        </div>
      </form>
    </div>
  );
};
export default FormularioPedido;