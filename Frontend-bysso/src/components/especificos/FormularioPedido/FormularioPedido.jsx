import React, { useState } from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './FormularioPedido.module.css';

const FormularioPedido = ({ alGuardar, alCancelar }) => {
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
    setDatosFormulario({ ...datosFormulario, [name]: value });
  };

  const manejarImagen = (e) => {
    setDatosFormulario({ ...datosFormulario, imagen: e.target.files[0] });
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
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
            <option value="bordado">Bordado</option>
            <option value="estampado">Estampado</option>
          </select>
          <input type="date" name="fechaEntrega" className={styles.entrada} onChange={manejarCambio} required />
        </div>
        <textarea name="descripcion" placeholder="Descripción del pedido" className={styles.areaTexto} onChange={manejarCambio} required></textarea>
        <div className={styles.grupoCampos}>
          <input type="number" name="bolsa" placeholder="Nº Bolsa" className={styles.entrada} onChange={manejarCambio} required />
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