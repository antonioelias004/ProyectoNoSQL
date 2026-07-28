//ARCHIVO ENCARGADO DE UNIR EL HTML CON LAS FUNCIONALIDAD DE CRUD 
// de cada uno de los esquemas del frontend (.js) quien son los cargados  
// de comunicarse con el servidor.


import { obtenerProductos, agregarProducto, eliminarProducto, actualizarProducto } from './productos.js';
import { obtenerClientes, agregarCliente, eliminarCliente, actualizarCliente } from './clientes.js';
import { obtenerProveedores, agregarProveedor, eliminarProveedor, actualizarProveedor } from './proveedores.js';
import { obtenerEmpleados, agregarEmpleado, eliminarEmpleado, actualizarEmpleado } from './empleados.js';

// Elementos del DOM - Productos
const formProducto = document.getElementById('form-producto');
const inputId = document.getElementById('producto-id');
const inputNombre = document.getElementById('nombre');
const inputPrecio = document.getElementById('precio');
const tablaProductos = document.getElementById('tabla-productos');
const tituloForm = document.getElementById('titulo-form');

// Elementos del DOM - Clientes
const formCliente = document.getElementById('form-cliente');
const inputClienteId = document.getElementById('cliente-id');
const inputClienteNombre = document.getElementById('cliente-nombre');
const inputClienteTelefono = document.getElementById('cliente-telefono');
const tablaClientes = document.getElementById('tabla-clientes');
const tituloFormCliente = document.getElementById('titulo-form-cliente');

// Elementos del DOM - Proveedores
const formProveedor = document.getElementById('form-proveedor');
const inputProveedorId = document.getElementById('proveedor-id');
const inputProveedorEmpresa = document.getElementById('proveedor-empresa');
const inputProveedorContacto = document.getElementById('proveedor-contacto');
const tablaProveedores = document.getElementById('tabla-proveedores');
const tituloFormProveedor = document.getElementById('titulo-form-proveedor');

// Elementos del DOM - Empleados
const formEmpleado = document.getElementById('form-empleado');
const inputEmpleadoId = document.getElementById('empleado-id');
const inputEmpleadoNombre = document.getElementById('empleado-nombre');
const inputEmpleadoCargo = document.getElementById('empleado-cargo');
const tablaEmpleados = document.getElementById('tabla-empleados');
const tituloFormEmpleado = document.getElementById('titulo-form-empleado');

// 1. Cargar todo al iniciar
document.addEventListener('DOMContentLoaded', () => {
    mostrarProductos();
    mostrarClientes();
    mostrarProveedores();
    mostrarEmpleados();
});

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

// ==========================================================
//                         CLIENTES
// ==========================================================

// Renderizar la tabla de clientes (READ)
async function mostrarClientes() {
    tablaClientes.innerHTML = '<tr><td colspan="4">Cargando clientes...</td></tr>';
    try {
        const clientes = await obtenerClientes();
        tablaClientes.innerHTML = '';

        if (clientes.length === 0) {
            tablaClientes.innerHTML = '<tr><td colspan="4">No hay clientes registrados.</td></tr>';
            return;
        }

        clientes.forEach(cliente => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${cliente._id || cliente.id}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.telefono}</td>
                <td>
                    <button class="btn-editar" onclick="prepararEdicionCliente('${cliente._id || cliente.id}', '${cliente.nombre}', '${cliente.telefono}')">Editar</button>
                    <button class="btn-eliminar" onclick="borrarCliente('${cliente._id || cliente.id}')">Eliminar</button>
                </td>
            `;
            tablaClientes.appendChild(fila);
        });
    } catch (error) {
        tablaClientes.innerHTML = '<tr><td colspan="4">Error al conectar con la base de datos</td></tr>';
        console.error(error);
    }
}

// Guardar o Editar Cliente (CREATE / UPDATE)
formCliente.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputClienteId.value;
    const datosCliente = {
        nombre: inputClienteNombre.value,
        telefono: inputClienteTelefono.value
    };

    try {
        if (id) {
            await actualizarCliente(id, datosCliente);
            alert('Cliente actualizado correctamente');
        } else {
            await agregarCliente(datosCliente);
            alert('Cliente guardado correctamente');
        }

        formCliente.reset();
        inputClienteId.value = '';
        if (tituloFormCliente) tituloFormCliente.textContent = 'Nuevo cliente';

        mostrarClientes();
    } catch (error) {
        alert('Error al procesar la operación');
        console.error(error);
    }
});

// Cargar datos en el formulario para Editar Cliente
window.prepararEdicionCliente = (id, nombre, telefono) => {
    inputClienteId.value = id;
    inputClienteNombre.value = nombre;
    inputClienteTelefono.value = telefono;
    if (tituloFormCliente) tituloFormCliente.textContent = 'Editar cliente';
};

// Eliminar Cliente (DELETE)
window.borrarCliente = async (id) => {
    if (confirm('¿Deseas eliminar este cliente de la base de datos?')) {
        try {
            await eliminarCliente(id);
            alert('Cliente eliminado');
            mostrarClientes();
        } catch (error) {
            alert('Error al intentar eliminar');
            console.error(error);
        }
    }
};

// ==========================================================
//                         PROVEEDORES
// ==========================================================

// Renderizar la tabla de proveedores (READ)
async function mostrarProveedores() {
    tablaProveedores.innerHTML = '<tr><td colspan="4">Cargando proveedores...</td></tr>';
    try {
        const proveedores = await obtenerProveedores();
        tablaProveedores.innerHTML = '';

        if (proveedores.length === 0) {
            tablaProveedores.innerHTML = '<tr><td colspan="4">No hay proveedores registrados.</td></tr>';
            return;
        }

        proveedores.forEach(proveedor => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${proveedor._id || proveedor.id}</td>
                <td>${proveedor.empresa}</td>
                <td>${proveedor.contacto}</td>
                <td>
                    <button class="btn-editar" onclick="prepararEdicionProveedor('${proveedor._id || proveedor.id}', '${proveedor.empresa}', '${proveedor.contacto}')">Editar</button>
                    <button class="btn-eliminar" onclick="borrarProveedor('${proveedor._id || proveedor.id}')">Eliminar</button>
                </td>
            `;
            tablaProveedores.appendChild(fila);
        });
    } catch (error) {
        tablaProveedores.innerHTML = '<tr><td colspan="4">Error al conectar con la base de datos</td></tr>';
        console.error(error);
    }
}

// Guardar o Editar Proveedor (CREATE / UPDATE)
formProveedor.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputProveedorId.value;
    const datosProveedor = {
        empresa: inputProveedorEmpresa.value,
        contacto: inputProveedorContacto.value
    };

    try {
        if (id) {
            await actualizarProveedor(id, datosProveedor);
            alert('Proveedor actualizado correctamente');
        } else {
            await agregarProveedor(datosProveedor);
            alert('Proveedor guardado correctamente');
        }

        formProveedor.reset();
        inputProveedorId.value = '';
        if (tituloFormProveedor) tituloFormProveedor.textContent = 'Nuevo proveedor';

        mostrarProveedores();
    } catch (error) {
        alert('Error al procesar la operación');
        console.error(error);
    }
});

// Cargar datos en el formulario para Editar Proveedor
window.prepararEdicionProveedor = (id, empresa, contacto) => {
    inputProveedorId.value = id;
    inputProveedorEmpresa.value = empresa;
    inputProveedorContacto.value = contacto;
    if (tituloFormProveedor) tituloFormProveedor.textContent = 'Editar proveedor';
};

// Eliminar Proveedor (DELETE)
window.borrarProveedor = async (id) => {
    if (confirm('¿Deseas eliminar este proveedor de la base de datos?')) {
        try {
            await eliminarProveedor(id);
            alert('Proveedor eliminado');
            mostrarProveedores();
        } catch (error) {
            alert('Error al intentar eliminar');
            console.error(error);
        }
    }
};

// ==========================================================
//                         EMPLEADOS
// ==========================================================

// Renderizar la tabla de empleados (READ)
async function mostrarEmpleados() {
    tablaEmpleados.innerHTML = '<tr><td colspan="4">Cargando empleados...</td></tr>';
    try {
        const empleados = await obtenerEmpleados();
        tablaEmpleados.innerHTML = '';

        if (empleados.length === 0) {
            tablaEmpleados.innerHTML = '<tr><td colspan="4">No hay empleados registrados.</td></tr>';
            return;
        }

        empleados.forEach(empleado => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${empleado._id || empleado.id}</td>
                <td>${empleado.nombre}</td>
                <td>${empleado.cargo}</td>
                <td>
                    <button class="btn-editar" onclick="prepararEdicionEmpleado('${empleado._id || empleado.id}', '${empleado.nombre}', '${empleado.cargo}')">Editar</button>
                    <button class="btn-eliminar" onclick="borrarEmpleado('${empleado._id || empleado.id}')">Eliminar</button>
                </td>
            `;
            tablaEmpleados.appendChild(fila);
        });
    } catch (error) {
        tablaEmpleados.innerHTML = '<tr><td colspan="4">Error al conectar con la base de datos</td></tr>';
        console.error(error);
    }
}

// Guardar o Editar Empleado (CREATE / UPDATE)
formEmpleado.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputEmpleadoId.value;
    const datosEmpleado = {
        nombre: inputEmpleadoNombre.value,
        cargo: inputEmpleadoCargo.value
    };

    try {
        if (id) {
            await actualizarEmpleado(id, datosEmpleado);
            alert('Empleado actualizado correctamente');
        } else {
            await agregarEmpleado(datosEmpleado);
            alert('Empleado guardado correctamente');
        }

        formEmpleado.reset();
        inputEmpleadoId.value = '';
        if (tituloFormEmpleado) tituloFormEmpleado.textContent = 'Registrar empleado';

        mostrarEmpleados();
    } catch (error) {
        alert('Error al procesar la operación');
        console.error(error);
    }
});

// Cargar datos en el formulario para Editar Empleado
window.prepararEdicionEmpleado = (id, nombre, cargo) => {
    inputEmpleadoId.value = id;
    inputEmpleadoNombre.value = nombre;
    inputEmpleadoCargo.value = cargo;
    if (tituloFormEmpleado) tituloFormEmpleado.textContent = 'Editar empleado';
};

// Eliminar Empleado (DELETE)
window.borrarEmpleado = async (id) => {
    if (confirm('¿Deseas eliminar este empleado de la base de datos?')) {
        try {
            await eliminarEmpleado(id);
            alert('Empleado eliminado');
            mostrarEmpleados();
        } catch (error) {
            alert('Error al intentar eliminar');
            console.error(error);
        }
    }
};