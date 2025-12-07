import React, { useState, useEffect } from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './FormularioPedido.module.css';
import { getClienteByCedula } from '../../../services/pedidosService.js';
import { useBags } from '../../../context/BagContext';
import { useWorkers } from '../../../context/WorkerContext.jsx';

const cleanSimpleNumber = (formattedValue) => {
    if (typeof formattedValue !== 'string') return '';
    const cleaned = formattedValue.replace(/[^0-9]/g, '');
    if (cleaned === '') return '';
    return Number(cleaned);
};

const FormularioPedido = ({ alGuardar, alCancelar }) => {
    const { bolsasDisponibles } = useBags();
    const { workers: trabajadores, loading: workersLoading } = useWorkers();

    const [datosFormulario, setDatosFormulario] = useState(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const defaultDate = `${yyyy}-${mm}-${dd}`;

        return {
            clienteNombre: '',
            clienteCedula: '',
            clienteCelular: '',
            tipo: '',
            descripcion: '',
            abono: '',
            bagId: '',
            prendas: '',
            fechaEntrega: defaultDate,
            total: '',
            imagen: null,
            trabajadorId: '',
        };
    });

    const [isSearchingClient, setIsSearchingClient] = useState(false);

    const previewUrl = datosFormulario.imagen
        ? URL.createObjectURL(datosFormulario.imagen)
        : null;

    useEffect(() => {
        const clienteCedula = datosFormulario.clienteCedula;
        if (typeof clienteCedula === 'string' && clienteCedula.length >= 10) {
            const autoCompletar = async () => {
                setIsSearchingClient(true);
                try {
                    const clientData = await getClienteByCedula(clienteCedula);
                    if (clientData) {
                        setDatosFormulario(prev => ({
                            ...prev,
                            clienteNombre: clientData.nombre,
                            clienteCelular: clientData.celular,
                        }));
                    }
                } catch (error) {
                    console.error("Error searching for client:", error);
                } finally {
                    setIsSearchingClient(false);
                }
            };
            autoCompletar();
        }
    }, [datosFormulario.clienteCedula]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        let valorCorregido = value;

        if (name === 'prendas') {
            valorCorregido = value === '' ? '' : Number(value);
        } else if (name === 'clienteCedula' || name === 'clienteCelular') {
            valorCorregido = value.replace(/[^0-9]/g, '');
        }

        setDatosFormulario({ ...datosFormulario, [name]: valorCorregido });
    };

    const manejarImagen = (e) => {
        setDatosFormulario({ ...datosFormulario, imagen: e.target.files[0] });
    };

    const manejarBorrarImagen = () => {
        setDatosFormulario(prev => ({
            ...prev,
            imagen: null
        }));
        const fileInput = document.getElementById('inputArchivo');
        if (fileInput) fileInput.value = '';
    };

    const manejarEnvio = (e) => {
        e.preventDefault();
        const abonoLimpio = cleanSimpleNumber(datosFormulario.abono);
        const totalLimpio = cleanSimpleNumber(datosFormulario.total);
        const { imagen, ...restoDatos } = datosFormulario;
        const datosDeTexto = {
            ...restoDatos,
            abono: abonoLimpio === '' ? 0 : abonoLimpio,
            total: totalLimpio === '' ? 0 : totalLimpio,
            prendas: datosFormulario.prendas === '' ? 0 : Number(datosFormulario.prendas),
            bagId: datosFormulario.bagId,
            trabajadorId: datosFormulario.trabajadorId,
            imagenUrl: imagen ? undefined : null
        };
        const formData = new FormData();
        if (imagen) {
            formData.append('imagen', imagen);
        }
        formData.append('pedido', JSON.stringify(datosDeTexto));
        alGuardar(formData);
    };

    return (
        <div className={styles.contenedorFormulario}>
            <h2 className={`${styles.tituloFormulario} ${styles.spanFull}`}>Nuevo Pedido</h2>
            <form onSubmit={manejarEnvio} className={styles.formulario}>
                <div className={styles.columnaCampos}>
                    {/* --- Campos de Cliente --- */}
                    <div className={styles.campo}>
                        <label htmlFor="clienteNombre">Nombre Completo</label>
                        <input id="clienteNombre" type="text" name="clienteNombre" placeholder="Nombre del cliente" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.clienteNombre} />
                    </div>

                    <div className={styles.campo}>
                        <label htmlFor="clienteCedula">Cédula</label>
                        <input id="clienteCedula" type="number" name="clienteCedula" placeholder="Cédula del cliente" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.clienteCedula} />
                        {isSearchingClient && <p className={styles.feedbackBusqueda}>Buscando cliente...</p>}
                    </div>

                    <div className={styles.campo}>
                        <label htmlFor="clienteCelular">Celular</label>
                        <input id="clienteCelular" type="number" name="clienteCelular" placeholder="Celular del cliente" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.clienteCelular} />
                    </div>

                    {/* --- Campos de Tipo y Fecha --- */}
                    <div className={styles.campo}>
                        <label htmlFor="tipo">Tipo de Pedido</label>
                        <select id="tipo" name="tipo" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.tipo}>
                            <option value="">Seleccione un tipo</option>
                            <option value="BORDADO">Bordado</option>
                            <option value="ESTAMPADO">Estampado</option>
                            <option value="ESTAMPADO_Y_BORDADO">Estampado y Bordado</option>
                            <option value="OTROS">Otros</option>
                        </select>
                    </div>

                    <div className={styles.campo}>
                        <label htmlFor="fechaEntrega">Fecha de Entrega</label>
                        <input id="fechaEntrega" type="date" name="fechaEntrega" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.fechaEntrega} />
                    </div>

                    {/* --- Descripción (ocupa toda la fila dentro de columnaCampos) --- */}
                    <div className={`${styles.campo} ${styles.spanFullColumna}`}>
                        <label htmlFor="descripcion">Descripción del Pedido</label>
                        <textarea id="descripcion" name="descripcion" placeholder="Detalles del pedido, colores, tallas, etc." className={styles.areaTexto} onChange={manejarCambio} required value={datosFormulario.descripcion}></textarea>
                    </div>

                    {/* --- Campos de Bolsa, Prendas, Abono --- */}
                    <div className={styles.campo}>
                        <label htmlFor="bagId">Nº Bolsa</label>
                        <select id="bagId" name="bagId" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.bagId}>
                            <option value="">Seleccione una bolsa</option>
                            {bolsasDisponibles.map((bagId) => (
                                <option key={bagId} value={bagId}>{bagId}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className={styles.campo}>
                        <label htmlFor="prendas">Nº Prendas</label>
                        <input id="prendas" type="number" name="prendas" placeholder="Cantidad de prendas" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.prendas} min="0" />
                    </div>

                    <div className={styles.campo}>
                        <label htmlFor="abono">Abono</label>
                        <input id="abono" type="text" name="abono" placeholder="Ej: 20000" className={styles.entrada} onChange={manejarCambio} value={datosFormulario.abono} />
                    </div>
                    
                    {/* --- Campo Total --- */}
                    <div className={styles.campo}>
                        <label htmlFor="total">Total</label>
                        <input id="total" type="text" name="total" placeholder="Ej: 50000" className={styles.entrada} onChange={manejarCambio} value={datosFormulario.total} />
                    </div>
                </div> {/* Fin de columnaCampos */}

                <div className={styles.columnaImagen}>
                    {/* --- Input y Preview de Imagen --- */}
                    <div className={styles.campo}>
                        <label>Imagen de Diseño (Opcional)</label>
                        <div className={styles.contenedorArchivo}>
                            <label htmlFor="inputArchivo" className={styles.etiquetaArchivo}>Seleccionar</label>
                            <input id="inputArchivo" type="file" name="imagen" className={styles.inputArchivo} onChange={manejarImagen} />
                            <span className={styles.nombreArchivo}>{datosFormulario.imagen ? datosFormulario.imagen.name : 'Sin archivo'}</span>
                        </div>
                    </div>

                    {datosFormulario.imagen && (
                        <div className={`${styles.campo} ${styles.spanFull}`}> {/* spanFull aquí es para la columnaImagen */}
                            <label>Vista Previa</label>
                            <div className={styles.contenedorPreview}>
                                <img src={previewUrl} alt="Vista previa del diseño" className={styles.imagenPreview} />
                                <button type="button" className={styles.botonBorrarImagen} onClick={manejarBorrarImagen}>&times;</button>
                            </div>
                        </div>
                    )}

                    {/* --- Campo Trabajador (movido aquí para mejor balance) --- */}
                    <div className={styles.campo}>
                        <label htmlFor="trabajadorId">Asignar a Trabajador</label>
                        <select id="trabajadorId" name="trabajadorId" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.trabajadorId}>
                            <option value="">{workersLoading ? 'Cargando...' : 'Selecciona un trabajador'}</option>
                            {trabajadores
                            .filter(trabajador => trabajador.activo)
                            .map((trabajador) => (
                                <option key={trabajador.id} value={trabajador.id}>{trabajador.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div> {/* Fin de columnaImagen */}

                {/* --- Acciones (ocupa toda la fila de la grilla principal) --- */}
                <div className={`${styles.acciones} ${styles.spanFull}`}>
                    <Boton tipo="peligro" onClick={alCancelar}>Cancelar</Boton>
                    <Boton tipo="exito" type="submit">Guardar</Boton>
                </div>
            </form>
        </div>
    );
};
export default FormularioPedido;