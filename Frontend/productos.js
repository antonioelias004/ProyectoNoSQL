// ==========================================================
//                         PRODUCTOS
// ==========================================================

import { API_URL } from './config.js';

// Obtener todos los productos
export async function obtenerProductos() {
    const respuesta = await fetch(`${API_URL}/productos`);

    if (!respuesta.ok) {
        throw new Error("Error al obtener la lista de productos");
    }

    return await respuesta.json();
}

// Obtener un solo producto por ID
export async function obtenerProductoPorId(id) {
    const respuesta = await fetch(`${API_URL}/productos/${id}`);

    if (!respuesta.ok) {
        throw new Error("Error al consultar el producto");
    }

    return await respuesta.json();
}

// Agregar un nuevo producto
export async function agregarProducto(producto) {
    const respuesta = await fetch(`${API_URL}/productos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(producto)
    });

    if (!respuesta.ok) {
        throw new Error("Error al guardar el nuevo producto");
    }

    return await respuesta.json();
}

// Actualizar producto
export async function actualizarProducto(id, producto) {
    const respuesta = await fetch(`${API_URL}/productos/${id}`, {
        method: "PUT", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(producto)
    });

    if (!respuesta.ok) {
        throw new Error("Error al actualizar el producto");
    }

    return await respuesta.json();
}

// Eliminar un producto por su ID
export async function eliminarProducto(id) {
    const respuesta = await fetch(`${API_URL}/productos/${id}`, {
        method: "DELETE"
    });

    if (!respuesta.ok) {
        throw new Error("Error al eliminar el producto");
    }

    return await respuesta.json();
}