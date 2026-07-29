// ==========================================================
//                         PROVEEDORES
// ==========================================================

import { apiFetch } from './auth.js';

// Obtener todos los proveedores
export async function obtenerProveedores() {
    return await apiFetch('/proveedores');
}

// Obtener un solo proveedor por ID
export async function obtenerProveedorPorId(id) {
    return await apiFetch(`/proveedores/${id}`);
}

// Agregar un nuevo proveedor
export async function agregarProveedor(proveedor) {
    const datos = await apiFetch('/proveedores', {
        method: 'POST',
        body: JSON.stringify(proveedor)
    });
    return datos.proveedor;
}

// Actualizar proveedor
export async function actualizarProveedor(id, proveedor) {
    const datos = await apiFetch(`/proveedores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(proveedor)
    });
    return datos.proveedor;
}

// Eliminar un proveedor por su ID
export async function eliminarProveedor(id) {
    const datos = await apiFetch(`/proveedores/${id}`, { method: 'DELETE' });
    return datos.proveedor;
}
