//ARCHIVO ENCARGADO DE UNIR EL HTML CON LAS FUNCIONALIDAD DE CRUD 
// de cada uno de los esquemas del frontend quien son los cargados  
// de comunicarse con el servidor.

import { obtenerProductos, agregarProducto, eliminarProducto, actualizarProducto } from './productos.js';

// Elementos del DOM
const formProducto = document.getElementById('form-producto');
const inputId = document.getElementById('producto-id');
const inputNombre = document.getElementById('nombre');
const inputPrecio = document.getElementById('precio');
const tablaProductos = document.getElementById('tabla-productos');
const tituloForm = document.getElementById('titulo-form');

// 1. Cargar productos al iniciar
document.addEventListener('DOMContentLoaded', mostrarProductos);

// 2. Función para alternar entre pestañas
window.cambiarPestana = (nombrePestana) => {
    const seccionForm = document.getElementById('seccion-formulario');
    const seccionTabla = document.getElementById('seccion-tabla');
    const btnTabForm = document.getElementById('btn-tab-formulario');
    const btnTabTabla = document.getElementById('btn-tab-tabla');

    if (nombrePestana === 'formulario') {
        seccionForm.classList.add('activa');
        seccionTabla.classList.remove('activa');
        btnTabForm.classList.add('activo');
        btnTabTabla.classList.remove('activo');
    } else {
        seccionTabla.classList.add('activa');
        seccionForm.classList.remove('activa');
        btnTabTabla.classList.add('activo');
        btnTabForm.classList.remove('activo');
        
        // Al cambiarse a la pestaña de ver productos, refrescamos la lista
        mostrarProductos();
    }
};

// 3. Renderizar la tabla de productos (READ)
async function mostrarProductos() {
    tablaProductos.innerHTML = '<tr><td colspan="4">Cargando productos...</td></tr>';
    try {
        const productos = await obtenerProductos();
        tablaProductos.innerHTML = '';

        if (productos.length === 0) {
            tablaProductos.innerHTML = '<tr><td colspan="4">No hay productos registrados.</td></tr>';
            return;
        }

        productos.forEach(producto => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${producto._id || producto.id}</td>
                <td>${producto.nombre}</td>
                <td>$${producto.precio}</td>
                <td>
                    <button class="btn-editar" onclick="prepararEdicion('${producto._id || producto.id}', '${producto.nombre}', ${producto.precio})">Editar</button>
                    <button class="btn-eliminar" onclick="borrarProducto('${producto._id || producto.id}')">Eliminar</button>
                </td>
            `;
            tablaProductos.appendChild(fila);
        });
    } catch (error) {
        tablaProductos.innerHTML = '<tr><td colspan="4">Error al conectar con la base de datos</td></tr>';
        console.error(error);
    }
}

// 4. Guardar o Editar (CREATE / UPDATE)
formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value;
    const datosProducto = {
        nombre: inputNombre.value,
        precio: Number(inputPrecio.value)
    };

    try {
        if (id) {
            await actualizarProducto(id, datosProducto);
            alert('Producto actualizado correctamente');
        } else {
            await agregarProducto(datosProducto);
            alert('Producto guardado correctamente');
        }

        // Limpiar formulario y restablecer estado
        formProducto.reset();
        inputId.value = '';
        tituloForm.textContent = 'Agregar Nuevo Producto';
        
        // Cambiar automáticamente a la pestaña de la tabla para ver el resultado
        window.cambiarPestana('tabla');
    } catch (error) {
        alert('Error al procesar la operación');
        console.error(error);
    }
});

// 5. Cargar datos en el formulario para Editar
window.prepararEdicion = (id, nombre, precio) => {
    inputId.value = id;
    inputNombre.value = nombre;
    inputPrecio.value = precio;
    tituloForm.textContent = 'Editar Producto';
    
    // Cambiar automáticamente a la pestaña del formulario para editar
    window.cambiarPestana('formulario');
};

// 6. Eliminar Producto (DELETE)
window.borrarProducto = async (id) => {
    if (confirm('¿Deseas eliminar este producto de la base de datos?')) {
        try {
            await eliminarProducto(id);
            alert('Producto eliminado');
            mostrarProductos();
        } catch (error) {
            alert('Error al intentar eliminar');
            console.error(error);
        }
    }
};