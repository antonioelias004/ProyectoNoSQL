// ==========================================================
//                         EMPLEADOS
// ==========================================================

import { API_URL } from './config.js';

// Obtener todos los empleados
export async function obtenerEmpleados() {
    const respuesta = await fetch(`${API_URL}/empleados`);

    if (!respuesta.ok) {
        throw new Error("Error al obtener la lista de empleados");
    }

    return await respuesta.json();
}


// Obtener un solo empleado por ID
export async function obtenerEmpleadoPorId(id) {
    const respuesta = await fetch(`${API_URL}/empleados/${id}`);

    if (!respuesta.ok) {
        throw new Error("Error al consultar el empleado");
    }

    return await respuesta.json();
}


// Agregar un nuevo empleado
export async function agregarEmpleado(empleado) {
    const respuesta = await fetch(`${API_URL}/empleados`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(empleado)
    });

    if (!respuesta.ok) {
        throw new Error("Error al guardar el nuevo empleado");
    }

    return await respuesta.json();
}


// Actualizar empleado
export async function actualizarEmpleado(id, empleado) {
    const respuesta = await fetch(`${API_URL}/empleados/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(empleado)
    });

    if (!respuesta.ok) {
        throw new Error("Error al actualizar el empleado");
    }

    return await respuesta.json();
}


// Eliminar un empleado por su ID
export async function eliminarEmpleado(id) {
    const respuesta = await fetch(`${API_URL}/empleados/${id}`, {
        method: "DELETE"
    });

    if (!respuesta.ok) {
        throw new Error("Error al eliminar el empleado");
    }

    return await respuesta.json();
}
