// ==========================================================
//                         CLIENTES
// ==========================================================

import { API_URL } from './config.js';

// Obtener todos los clientes
export async function obtenerClientes() {
    const respuesta = await fetch(`${API_URL}/clientes`);

    if (!respuesta.ok) {
        throw new Error("Error al obtener la lista de clientes");
    }

    return await respuesta.json();
}

// Obtener un solo cliente por ID
export async function obtenerClientePorId(id) {
    const respuesta = await fetch(`${API_URL}/clientes/${id}`);

    if (!respuesta.ok) {
        throw new Error("Error al consultar el cliente");
    }

    return await respuesta.json();
}

// Agregar un nuevo cliente
export async function agregarCliente(cliente) {
    const respuesta = await fetch(`${API_URL}/clientes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(cliente)
    });

    if (!respuesta.ok) {
        throw new Error("Error al guardar el nuevo cliente");
    }

    return await respuesta.json();
}

// Actualizar cliente
export async function actualizarCliente(id, cliente) {
    const respuesta = await fetch(`${API_URL}/clientes/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(cliente)
    });

    if (!respuesta.ok) {
        throw new Error("Error al actualizar el cliente");
    }

    return await respuesta.json();
}

// Eliminar un cliente por su ID
export async function eliminarCliente(id) {
    const respuesta = await fetch(`${API_URL}/clientes/${id}`, {
        method: "DELETE"
    });

    if (!respuesta.ok) {
        throw new Error("Error al eliminar el cliente");
    }

    return await respuesta.json();
}
