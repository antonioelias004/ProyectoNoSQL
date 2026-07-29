// ==========================================================
//                         VENTAS
// ==========================================================

import { apiFetch } from './auth.js';

// Valores permitidos por el esquema
export const METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia'];

// Obtener todas las ventas
// Devuelve solo: folio, fecha, cliente_nombre, total, metodo_pago, estatus
export async function obtenerVentas() {
    return await apiFetch('/ventas');
}

// Obtener una venta por ID (incluye items, empleado y cliente completos)
export async function obtenerVentaPorId(id) {
    return await apiFetch(`/ventas/${id}`);
}

// Registrar una venta. El backend descuenta el stock y calcula folio y total.
export async function agregarVenta(venta) {
    const datos = await apiFetch('/ventas', {
        method: 'POST',
        body: JSON.stringify(venta)
    });
    return datos.venta;
}

// Actualizar venta (el backend solo acepta cliente_id, metodo_pago y estatus)
export async function actualizarVenta(id, venta) {
    const datos = await apiFetch(`/ventas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(venta)
    });
    return datos.venta;
}

// Cancelar una venta: devuelve el stock de todos sus items
export async function cancelarVenta(id) {
    return await actualizarVenta(id, { estatus: 'cancelada' });
}

// Eliminar una venta (también devuelve el stock si estaba completada)
export async function eliminarVenta(id) {
    const datos = await apiFetch(`/ventas/${id}`, { method: 'DELETE' });
    return datos.venta;
}

// ----------------------------------------------------------
// Utilidades del carrito
// ----------------------------------------------------------

// Total solo para mostrar en pantalla; el real lo recalcula el backend
export function calcularTotal(carrito) {
    return carrito.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);
}

// Arma el cuerpo del POST /ventas.
// El backend solo necesita producto_id y cantidad de cada renglón:
// nombre, precio, subtotal, total, folio y fecha los resuelve el servidor.
export function construirVenta({ empleadoId, clienteId, metodoPago, carrito }) {
    return {
        empleado_id: empleadoId,
        cliente_id: clienteId,
        metodo_pago: metodoPago,
        items: carrito.map(item => ({
            producto_id: item._id,
            cantidad: item.cantidad
        }))
    };
}
