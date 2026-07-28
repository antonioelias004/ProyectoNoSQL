// ==========================================================
//                         PROVEEDORES
// ==========================================================

import { API_URL } from './config.js';

// Obtener todos los proveedores
export async function obtenerProveedores() {
    const respuesta = await fetch(`${API_URL}/proveedores`);

    if (!respuesta.ok) {
        throw new Error("Error al obtener la lista de proveedores");
    }

    return await respuesta.json();
}


// Obtener un solo proveedor por ID
export async function obtenerProveedorPorId(id) {
    const respuesta = await fetch(`${API_URL}/proveedores/${id}`);

    if (!respuesta.ok) {
        throw new Error("Error al consultar el proveedor");
    }

    return await respuesta.json();
}


// Agregar un nuevo proveedor
export async function agregarProveedor(proveedor) {
    const respuesta = await fetch(`${API_URL}/proveedores`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(proveedor)
    });

    if (!respuesta.ok) {
        throw new Error("Error al guardar el nuevo proveedor");
    }

    return await respuesta.json();
}


// Actualizar proveedor
export async function actualizarProveedor(id, proveedor) {
    const respuesta = await fetch(`${API_URL}/proveedores/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(proveedor)
    });

    if (!respuesta.ok) {
        throw new Error("Error al actualizar el proveedor");
    }

    return await respuesta.json();
}


// Eliminar un proveedor por su ID
export async function eliminarProveedor(id) {
    const respuesta = await fetch(`${API_URL}/proveedores/${id}`, {
        method: "DELETE"
    });

    if (!respuesta.ok) {
        throw new Error("Error al eliminar el proveedor");
    }

    return await respuesta.json();
}