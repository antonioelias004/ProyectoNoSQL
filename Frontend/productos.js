// ==========================================================
//                         PRODUCTOS
// ==========================================================

import { apiFetch } from './auth.js';

// Obtener todos los productos (el backend incluye el proveedor con populate)
export async function obtenerProductos() {
    return await apiFetch('/productos');
}

// Obtener un solo producto por ID
export async function obtenerProductoPorId(id) {
    return await apiFetch(`/productos/${id}`);
}

// Agregar un nuevo producto
export async function agregarProducto(producto) {
    const datos = await apiFetch('/productos', {
        method: 'POST',
        body: JSON.stringify(producto)
    });
    return datos.producto;
}

// Actualizar producto
export async function actualizarProducto(id, producto) {
    const datos = await apiFetch(`/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(producto)
    });
    return datos.producto;
}

// Eliminar un producto por su ID
export async function eliminarProducto(id) {
    const datos = await apiFetch(`/productos/${id}`, { method: 'DELETE' });
    return datos.producto;
}
