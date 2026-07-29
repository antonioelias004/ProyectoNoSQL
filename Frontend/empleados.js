// ==========================================================
//                         EMPLEADOS
// ==========================================================

import { apiFetch } from './auth.js';

// Obtener todos los empleados (el backend nunca devuelve el password)
export async function obtenerEmpleados() {
    return await apiFetch('/empleados');
}

// Obtener un solo empleado por ID
export async function obtenerEmpleadoPorId(id) {
    return await apiFetch(`/empleados/${id}`);
}

// Agregar un nuevo empleado (el backend hashea el password con bcrypt)
export async function agregarEmpleado(empleado) {
    const datos = await apiFetch('/empleados', {
        method: 'POST',
        body: JSON.stringify(empleado)
    });
    return datos.empleado;
}

// Actualizar empleado.
// Si no se manda password, se conserva el que ya tenía.
export async function actualizarEmpleado(id, empleado) {
    const datos = await apiFetch(`/empleados/${id}`, {
        method: 'PUT',
        body: JSON.stringify(empleado)
    });
    return datos.empleado;
}

// Eliminar un empleado por su ID
export async function eliminarEmpleado(id) {
    const datos = await apiFetch(`/empleados/${id}`, { method: 'DELETE' });
    return datos.empleado;
}
