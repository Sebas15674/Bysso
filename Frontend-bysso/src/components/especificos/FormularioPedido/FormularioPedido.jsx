import React, { useState, useEffect } from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './FormularioPedido.module.css';
import { getClienteByCedula, getActiveWorkers } from '../../../services/pedidosService.js';
import { useBags } from '../../../context/BagContext';



const cleanSimpleNumber = (formattedValue) => {
    if (typeof formattedValue !== 'string') return '';
    const cleaned = formattedValue.replace(/[^0-9]/g, '');
    if (cleaned === '') return '';
    return Number(cleaned);
};


const FormularioPedido = ({ alGuardar, alCancelar }) => {
    const { bolsasDisponibles } = useBags();
    const [trabajadores, setTrabajadores] = useState([]);
    
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

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const activeWorkers = await getActiveWorkers();
                setTrabajadores(activeWorkers);
            } catch (error) {
                console.error("Error fetching workers:", error);
            }
        };
        fetchWorkers();
    }, []);

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

        const { imagen, ...restoDatos } = datosFormulario; // Extract the File object

        const datosDeTexto = {
            ...restoDatos,
            abono: abonoLimpio === '' ? 0 : abonoLimpio,
            total: totalLimpio === '' ? 0 : totalLimpio,
            prendas: datosFormulario.prendas === '' ? 0 : Number(datosFormulario.prendas),
            bagId: datosFormulario.bagId,
            trabajadorId: datosFormulario.trabajadorId,
            imagenUrl: imagen ? undefined : null // Send undefined if image is present, null if not.
        };

        const formData = new FormData();

        if (imagen) { // If there's an image File object
            formData.append('imagen', imagen);
        }

        formData.append('pedido', JSON.stringify(datosDeTexto));

        alGuardar(formData);
    };

    return (
        <div className={styles.contenedorFormulario}>
            <h2 className={styles.tituloFormulario}>Nuevo Pedido</h2>
            <form onSubmit={manejarEnvio} className={styles.formulario}>
                <div className={styles.grupoCampos}>
                    <input type="text" name="clienteNombre" placeholder="Nombre completo" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.clienteNombre} />

                    <input
                        type="number"
                        name="clienteCedula"
                        placeholder="Cédula"
                        className={styles.entrada}
                        onChange={manejarCambio}
                        required
                        value={datosFormulario.clienteCedula}
                    />

                    {isSearchingClient && <p className={styles.feedbackBusqueda}>Buscando cliente...</p>}

                    <input type="number" name="clienteCelular" placeholder="Celular" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.clienteCelular} />
                </div>

                <div className={styles.grupoCampos}>
                    <select name="tipo" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.tipo}>
                        <option value="">Seleccione un tipo</option>
                        <option value="BORDADO">Bordado</option>
                        <option value="ESTAMPADO">Estampado</option>
                        <option value="ESTAMPADO_Y_BORDADO">Estampado y Bordado</option>
                        <option value="OTROS">Otros</option>
                    </select>
                    <input type="date" name="fechaEntrega" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.fechaEntrega} />
                </div>

                <textarea name="descripcion" placeholder="Descripción del pedido" className={styles.areaTexto} onChange={manejarCambio} required value={datosFormulario.descripcion}></textarea>

                <div className={styles.grupoCampos}>
                    <select name="bagId" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.bagId}>
                        <option value="">Nº Bolsa (Disponible)</option>
                        {bolsasDisponibles.map((bagId) => (
                            <option key={bagId} value={bagId}>
                                {bagId}
                            </option>
                        ))}
                    </select>

                    <input type="number" name="prendas" placeholder="Nº Prendas" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.prendas} min="0" />

                    <input
                        type="text"
                        name="abono"
                        placeholder="Abono (ej: 20.000)"
                        className={styles.entrada}
                        onChange={manejarCambio}
                        value={datosFormulario.abono}
                    />
                </div>

                <div className={styles.grupoCampos}>
                    <input
                        type="text"
                        name="total"
                        placeholder="Total (ej: 50.000)"
                        className={styles.entrada}
                        onChange={manejarCambio}
                        value={datosFormulario.total}
                    />

                    <div className={styles.contenedorArchivo}>
                        <label htmlFor="inputArchivo" className={styles.etiquetaArchivo}>Seleccionar Imagen</label>
                        <input id="inputArchivo" type="file" name="imagen" className={styles.inputArchivo} onChange={manejarImagen} />
                        <span className={styles.nombreArchivo}>{datosFormulario.imagen ? datosFormulario.imagen.name : 'Sin archivo seleccionado'}</span>
                    </div>
                </div>

                {datosFormulario.imagen && (
                    <div className={styles.contenedorPreview}>
                        <img src={previewUrl} alt="Vista previa del diseño" className={styles.imagenPreview} />
                        <button type="button" className={styles.botonBorrarImagen} onClick={manejarBorrarImagen}>
                            &times;
                        </button>
                    </div>
                )}

                <div className={styles.grupoCampos}>
                    <select name="trabajadorId" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.trabajadorId}>
                        <option value="">Selecciona un trabajador</option>
                        {trabajadores.map((trabajador) => (
                            <option key={trabajador.id} value={trabajador.id}>
                                {trabajador.nombre}
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