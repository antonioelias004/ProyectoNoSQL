// ==========================================================
//                    AUTENTICACIÓN
// Maneja el login, el token de sesión y las peticiones
// autenticadas contra la API.
// ==========================================================

import { API_URL } from './config.js';

const CLAVE_TOKEN = 'mitiendita_token';
const CLAVE_EMPLEADO = 'mitiendita_empleado';

// ----------------------------------------------------------
// Sesión
// ----------------------------------------------------------

export function guardarSesion(token, empleado) {
    sessionStorage.setItem(CLAVE_TOKEN, token);
    sessionStorage.setItem(CLAVE_EMPLEADO, JSON.stringify(empleado));
}

export function obtenerToken() {
    return sessionStorage.getItem(CLAVE_TOKEN);
}

export function obtenerEmpleado() {
    const dato = sessionStorage.getItem(CLAVE_EMPLEADO);
    return dato ? JSON.parse(dato) : null;
}

export function haySesion() {
    return obtenerToken() !== null;
}

export function cerrarSesion() {
    sessionStorage.removeItem(CLAVE_TOKEN);
    sessionStorage.removeItem(CLAVE_EMPLEADO);
}

// ----------------------------------------------------------
// Login
// ----------------------------------------------------------
export async function iniciarSesion(usuario, password) {
    // apiFetch ya concatena API_URL, maneja los headers y captura los errores de forma segura
    const datos = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ usuario, password })
    });

    guardarSesion(datos.token, datos.empleado);
    return datos.empleado;
}
// ----------------------------------------------------------
// apiFetch: fetch con el token puesto automáticamente.
// Todos los módulos CRUD lo usan en lugar de fetch().
// ----------------------------------------------------------

export async function apiFetch(ruta, opciones = {}) {
    const token = obtenerToken();

    const cabeceras = Object.assign({}, opciones.headers);
    if (token) {
        cabeceras['Authorization'] = `Bearer ${token}`;
    }
    if (opciones.body && !cabeceras['Content-Type']) {
        cabeceras['Content-Type'] = 'application/json';
    }

    const respuesta = await fetch(`${API_URL}${ruta}`, Object.assign({}, opciones, { headers: cabeceras }));

    // Token vencido o inválido: cerrar sesión y volver al login
    if (respuesta.status === 401 && haySesion()) {
        cerrarSesion();
        window.location.reload();
        throw new Error('La sesión expiró, vuelve a iniciar sesión');
    }

    // Leer el cuerpo una sola vez y reutilizarlo
    const texto = await respuesta.text();
    let datos = null;
    try {
        datos = texto ? JSON.parse(texto) : null;
    } catch (e) {
        datos = null;
    }

    if (!respuesta.ok) {
        // El backend manda { mensaje, error }: preferimos el detalle si existe
        const detalle = datos && (datos.error || datos.mensaje);
        throw new Error(detalle || `Error ${respuesta.status} en la petición`);
    }

    return datos;
}
