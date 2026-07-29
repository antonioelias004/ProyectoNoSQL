// ==========================================================
//                         CLIENTES
// ==========================================================

import { apiFetch } from './auth.js';

// Obtener todos los clientes
export async function obtenerClientes() {
    return await apiFetch('/clientes');
}

// Obtener un solo cliente por ID
export async function obtenerClientePorId(id) {
    return await apiFetch(`/clientes/${id}`);
}

// Agregar un nuevo cliente
export async function agregarCliente(cliente) {
    const datos = await apiFetch('/clientes', {
        method: 'POST',
        body: JSON.stringify(cliente)
    });
    return datos.cliente;
}

// Actualizar cliente
export async function actualizarCliente(id, cliente) {
    const datos = await apiFetch(`/clientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cliente)
    });
    return datos.cliente;
}

// Eliminar un cliente por su ID
export async function eliminarCliente(id) {
    const datos = await apiFetch(`/clientes/${id}`, { method: 'DELETE' });
    return datos.cliente;
}
