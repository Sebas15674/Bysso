import React, { useState, useEffect } from 'react'; 
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './FormularioPedido.module.css';

// ... (Funciones de utilidad: cleanSimpleNumber, buscarClientePorCedula) ...
const cleanSimpleNumber = (formattedValue) => {
    if (typeof formattedValue !== 'string') return '';
    const cleaned = formattedValue.replace(/[^0-9]/g, '');
    if (cleaned === '') return ''; 
    return Number(cleaned); 
};
const buscarClientePorCedula = async (cedula) => {
    await new Promise(resolve => setTimeout(resolve, 300)); 
    const clientesFicticios = {
        '1055000343': { cliente: 'Andres Chitan', celular: '3226213276', cedula: '1055000343' },
        '1055000434': { cliente: 'Sebastian Patiño', celular: '3127554003', cedula: '1055000434' },
    };
    return clientesFicticios[cedula] || null;
};


const FormularioPedido = ({ alGuardar, alCancelar, bolsasDisponibles }) => { 
    const trabajadores = ['Alba lucia Noreña', 'Dayana Gallego', 'Rosa Sanchez', 'Juliana Betancur Noreña'];

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
    
    const [isSearchingClient, setIsSearchingClient] = useState(false); 

    const previewUrl = datosFormulario.imagen 
        ? URL.createObjectURL(datosFormulario.imagen) 
        : null;

    useEffect(() => {
        // Lógica de autocompletar cliente (Intacta)
        const cedula = datosFormulario.cedula;
        if (typeof cedula === 'string' && cedula.length >= 10) {
            const autoCompletar = async () => {
                setIsSearchingClient(true);
                const clientData = await buscarClientePorCedula(cedula);
                setIsSearchingClient(false);
                if (clientData) {
                    setDatosFormulario(prev => ({
                        ...prev,
                        cliente: clientData.cliente,
                        celular: clientData.celular,
                    }));
                }
            };
            autoCompletar();
        }
    }, [datosFormulario.cedula]); 

    useEffect(() => {
        // Cleanup para liberar memoria al desmontar o cambiar la imagen
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    /**
     * ✅ CORRECCIÓN 1: Solo convertimos 'prendas' a número. 'bolsa' debe ser string.
     */
    const manejarCambio = (e) => {
        const { name, value } = e.target;
        let valorCorregido = value;
        
        // Solo 'prendas' se convierte a Number. 'bolsa' se mantiene como STRING.
        if (name === 'prendas') {
            valorCorregido = value === '' ? '' : Number(value);
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

        // 1. Limpieza de datos y separación de la imagen
        const abonoLimpio = cleanSimpleNumber(datosFormulario.abono);
        const totalLimpio = cleanSimpleNumber(datosFormulario.total);
        
        const { imagen, ...restoDatos } = datosFormulario; // Separamos el objeto File

        // 2. Objeto de datos que será serializado en JSON
        const datosDeTexto = {
            ...restoDatos, // Solo datos de texto y números
            abono: abonoLimpio === '' ? 0 : abonoLimpio,
            total: totalLimpio === '' ? 0 : totalLimpio,
            prendas: datosFormulario.prendas === '' ? 0 : Number(datosFormulario.prendas),
            
            // ✅ CORRECCIÓN 2: Mantenemos 'bolsa' como STRING ('1a', '21', etc.)
            bolsa: datosFormulario.bolsa, 
            
            // Aseguramos que la clave 'imagen' no contenga el objeto File
            imagen: null 
        };

        // 3. Crear FormData
        const formData = new FormData();

        // 4. Adjuntar la imagen POR SEPARADO 
        if (imagen) {
            formData.append('imagen', imagen); // Clave: 'imagen' (es el objeto File)
        }
        
        // 5. Adjuntar el resto de los datos como JSON string 
        formData.append('data', JSON.stringify(datosDeTexto)); 
        
        // 6. Enviar el FormData al componente padre
        alGuardar(formData);
    };


    return (
        <div className={styles.contenedorFormulario}>
            <h2 className={styles.tituloFormulario}>Nuevo Pedido</h2>
            <form onSubmit={manejarEnvio} className={styles.formulario}>
                <div className={styles.grupoCampos}>
                    <input type="text" name="cliente" placeholder="Nombre completo" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.cliente} />
                    
                    <input 
                        type="text" 
                        name="cedula" 
                        placeholder="Cédula" 
                        className={styles.entrada} 
                        onChange={manejarCambio} 
                        required 
                        value={datosFormulario.cedula} 
                    />
                    
                    {isSearchingClient && <p className={styles.feedbackBusqueda}>Buscando cliente...</p>}

                    <input type="tel" name="celular" placeholder="Celular" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.celular} />
                </div>
                
                <div className={styles.grupoCampos}>
                    <select name="tipo" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.tipo}>
                        <option value="">Seleccione un tipo</option>
                        <option value="Bordado">Bordado</option>
                        <option value="Estampado">Estampado</option>
                        <option value="Estampado y Bordado">Estampado y Bordado</option>
                        <option value="otros">Otros</option>
                    </select>
                    <input type="date" name="fechaEntrega" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.fechaEntrega} />
                </div>
                
                <textarea name="descripcion" placeholder="Descripción del pedido" className={styles.areaTexto} onChange={manejarCambio} required value={datosFormulario.descripcion}></textarea>
                
                <div className={styles.grupoCampos}>
                    <select name="bolsa" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.bolsa}>
                        <option value="">Nº Bolsa (Disponible)</option>
                        {bolsasDisponibles.map((bolsa) => (
                            <option key={bolsa} value={bolsa}>
                                {bolsa} 
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

                {/* Previsualización de la imagen */}
                {datosFormulario.imagen && (
                    <div className={styles.contenedorPreview}>
                        <img src={previewUrl} alt="Vista previa del diseño" className={styles.imagenPreview} />
                        <button type="button" className={styles.botonBorrarImagen} onClick={manejarBorrarImagen}>
                            &times;
                        </button>
                    </div>
                )}
                
                <div className={styles.grupoCampos}>
                    <select name="trabajadorAsignado" className={styles.entrada} onChange={manejarCambio} required value={datosFormulario.trabajadorAsignado}>
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