// ==========================================================
// ARCHIVO ENCARGADO DE UNIR EL HTML CON LA FUNCIONALIDAD CRUD
// de cada uno de los esquemas. Los módulos (.js) son los
// encargados de comunicarse con el servidor.
// ==========================================================

import { haySesion, iniciarSesion, cerrarSesion, obtenerEmpleado } from './auth.js';
import { obtenerProductos, agregarProducto, actualizarProducto, eliminarProducto } from './productos.js';
import { obtenerClientes, agregarCliente, actualizarCliente, eliminarCliente } from './clientes.js';
import { obtenerProveedores, agregarProveedor, actualizarProveedor, eliminarProveedor } from './proveedores.js';
import { obtenerEmpleados, agregarEmpleado, actualizarEmpleado, eliminarEmpleado } from './empleados.js';
import { obtenerVentas, obtenerVentaPorId, agregarVenta, cancelarVenta, eliminarVenta, construirVenta } from './ventas.js';

// ----------------------------------------------------------
// Estado en memoria
// ----------------------------------------------------------
let productos = [];
let clientes = [];
let proveedores = [];
let empleados = [];
let ventas = [];
let carrito = [];

// Punto de venta: relaciona la etiqueta mostrada en el buscador con su producto real
const mapaProductosVenta = new Map();

const $ = (id) => document.getElementById(id);

// ----------------------------------------------------------
// Utilidades
// ----------------------------------------------------------

// Escapa texto antes de meterlo en innerHTML (evita romper el HTML y XSS)
function esc(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const money = (n) => '$' + Number(n || 0).toFixed(2);

// Las fechas se guardan a medianoche UTC. Si se pintan con la zona local
// (Mazatlán = UTC-7) se ven un día antes, por eso se fuerza timeZone UTC.
function fecha(valor) {
    if (!valor) return '—';
    return new Date(valor).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC'
    });
}

// Convierte una fecha ISO a yyyy-mm-dd para los <input type="date">
function fechaInput(valor) {
    if (!valor) return '';
    return new Date(valor).toISOString().slice(0, 10);
}

// ----------------------------------------------------------
// Notificaciones (toasts). Reemplazan a los alert().
// ----------------------------------------------------------

const ICONOS_TOAST = {
    exito: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info:  'fa-circle-info'
};

function toast(tipo, titulo, detalle = '', duracion = 4200) {
    const cont = $('toasts');
    const el = document.createElement('div');
    el.className = `toast ${tipo}`;
    el.innerHTML = `
        <i class="fa-solid ${ICONOS_TOAST[tipo]}" aria-hidden="true"></i>
        <div class="toast-cuerpo">
            <strong>${esc(titulo)}</strong>
            ${detalle ? `<span>${esc(detalle)}</span>` : ''}
        </div>
        <button type="button" aria-label="Cerrar aviso">&times;</button>`;

    const quitar = () => {
        if (!el.isConnected) return;
        el.classList.add('saliendo');
        setTimeout(() => el.remove(), 200);
    };

    el.querySelector('button').addEventListener('click', quitar);
    cont.appendChild(el);
    setTimeout(quitar, duracion);
}

function aviso(mensaje, detalle = '') {
    toast('exito', mensaje, detalle);
}

function fallo(error) {
    console.error(error);
    toast('error', 'No se pudo completar', error.message || 'Ocurrió un error inesperado', 6500);
}

// ----------------------------------------------------------
// Modal de confirmación / entrada de datos.
// Reemplaza a confirm() y prompt() del navegador (que se ven
// como "127.0.0.1 dice" y quedan pegados a una esquina).
// ----------------------------------------------------------

// Guarda la función para cancelar el modal actualmente abierto,
// para que Escape o el clic afuera también lo puedan cerrar.
let cerrarModalConfirmar = null;

function abrirModalConfirmar({
    titulo,
    mensaje,
    textoAceptar = 'Aceptar',
    peligro = false,
    conInput = false,
    valorInicial = '',
    tipoInput = 'text',
    pasoInput,
    minInput
}) {
    return new Promise((resolve) => {
        const overlay = $('modal-confirmar');
        const btnAceptar = $('confirmar-aceptar');
        const btnCancelar = $('confirmar-cancelar');
        const btnCerrar = $('cerrar-modal-confirmar');
        const campoInput = $('confirmar-campo-input');
        const input = $('confirmar-input');

        $('confirmar-titulo').textContent = titulo;
        $('confirmar-mensaje').textContent = mensaje;
        btnAceptar.textContent = textoAceptar;
        btnAceptar.className = 'btn-principal ' + (peligro ? 'btn-peligro-modal' : 'rosa-bg');

        if (conInput) {
            campoInput.style.display = '';
            input.type = tipoInput;
            if (pasoInput !== undefined) input.step = pasoInput; else input.removeAttribute('step');
            if (minInput !== undefined) input.min = minInput; else input.removeAttribute('min');
            input.value = valorInicial;
        } else {
            campoInput.style.display = 'none';
        }

        const terminar = (valor) => {
            overlay.classList.remove('visible');
            cerrarModalConfirmar = null;
            btnAceptar.removeEventListener('click', onAceptar);
            btnCancelar.removeEventListener('click', onCancelar);
            btnCerrar.removeEventListener('click', onCancelar);
            input.removeEventListener('keydown', onKeydown);
            resolve(valor);
        };

        function onAceptar() { terminar(conInput ? input.value : true); }
        function onCancelar() { terminar(conInput ? null : false); }
        function onKeydown(e) {
            if (e.key === 'Enter') { e.preventDefault(); onAceptar(); }
        }

        btnAceptar.addEventListener('click', onAceptar);
        btnCancelar.addEventListener('click', onCancelar);
        btnCerrar.addEventListener('click', onCancelar);
        if (conInput) input.addEventListener('keydown', onKeydown);

        cerrarModalConfirmar = onCancelar;

        overlay.classList.add('visible');
        setTimeout(() => {
            if (conInput) { input.focus(); input.select(); }
            else btnAceptar.focus();
        }, 50);
    });
}

// Sustituye confirm(mensaje). Devuelve true/false.
function confirmarAccion(mensaje, opciones = {}) {
    return abrirModalConfirmar({
        titulo: opciones.titulo || 'Confirmar acción',
        mensaje,
        textoAceptar: opciones.textoAceptar || 'Aceptar',
        peligro: opciones.peligro || false,
        conInput: false
    });
}

// Sustituye prompt(mensaje, valorInicial). Devuelve el texto o null si se canceló.
function pedirValor(mensaje, valorInicial = '', opciones = {}) {
    return abrirModalConfirmar({
        titulo: opciones.titulo || 'Ingresa un valor',
        mensaje,
        textoAceptar: opciones.textoAceptar || 'Aceptar',
        conInput: true,
        valorInicial,
        tipoInput: opciones.tipo || 'text',
        pasoInput: opciones.step,
        minInput: opciones.min
    });
}

// Fila de carga (esqueleto) mientras llegan los datos
function esqueleto(columnas, filas = 4) {
    let html = '';
    for (let f = 0; f < filas; f++) {
        html += '<tr class="esqueleto">';
        for (let c = 0; c < columnas; c++) {
            html += `<td><span style="width:${45 + Math.random() * 45}%"></span></td>`;
        }
        html += '</tr>';
    }
    return html;
}
// Esqueleto de carga para el inventario en tarjetas
function esqueletoProductos(cuantas = 8) {
    let html = '';
    for (let i = 0; i < cuantas; i++) {
        html += `
            <div class="producto-card-admin esqueleto">
                <div class="foto"></div>
                <div class="cuerpo">
                    <span style="width:70%;height:14px;"></span>
                    <span style="width:40%;"></span>
                    <span style="width:55%;"></span>
                    <span style="width:90%;height:20px;"></span>
                </div>
            </div>`;
    }
    return html;
}
// Estado vacío con icono y mensaje
function vacio(columnas, icono, mensaje) {
    return `<tr class="fila-vacia"><td colspan="${columnas}">
        <div class="vacio">
            <i class="fa-solid ${icono}" aria-hidden="true"></i>
            <p>${esc(mensaje)}</p>
        </div>
    </td></tr>`;
}

// ==========================================================
//                         LOGIN
// ==========================================================

function mostrarLogin() {
    $('pantalla-login').classList.add('visible');
}

function ocultarLogin() {
    $('pantalla-login').classList.remove('visible');
}

function pintarUsuario() {
    const empleado = obtenerEmpleado();
    if (!empleado) return;

    const caja = document.querySelector('.usuario div');
    if (caja) {
        caja.innerHTML = `<strong>${esc(empleado.nombre)}</strong><small>${esc(empleado.puesto)}</small>`;
    }

    // Tarjeta de sesión del sidebar
    const iniciales = (empleado.nombre || '?')
        .split(' ').filter(Boolean).slice(0, 2)
        .map(p => p[0].toUpperCase()).join('');
    $('sesion-inicial').textContent = iniciales || '?';
    $('sesion-nombre').textContent = empleado.nombre || '—';
    $('sesion-puesto').textContent = empleado.puesto || '';
    $('sesion-hora').textContent = new Date()
        .toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function mostrarErrorLogin(mensaje) {
    const error = $('login-error');
    error.textContent = mensaje || '';
    error.classList.toggle('visible', Boolean(mensaje));
}

// Mostrar / ocultar contraseña
$('ver-password').addEventListener('click', () => {
    const campo = $('login-password');
    const boton = $('ver-password');
    const oculta = campo.type === 'password';

    campo.type = oculta ? 'text' : 'password';
    boton.setAttribute('aria-pressed', String(oculta));
    boton.setAttribute('aria-label', oculta ? 'Ocultar contraseña' : 'Mostrar contraseña');
    boton.innerHTML = `<i class="fa-solid fa-eye${oculta ? '-slash' : ''}" aria-hidden="true"></i>`;
    campo.focus();
});

$('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = $('btn-login');
    const usuario = $('login-usuario').value.trim();
    const password = $('login-password').value;

    // Validación propia: el form usa novalidate para dar mensajes en español
    if (!usuario) {
        mostrarErrorLogin('Escribe tu usuario.');
        $('login-usuario').focus();
        return;
    }
    if (!password) {
        mostrarErrorLogin('Escribe tu contraseña.');
        $('login-password').focus();
        return;
    }

    mostrarErrorLogin('');
    boton.disabled = true;
    boton.innerHTML = '<span>Entrando...</span>';

    try {
        await iniciarSesion(usuario, password);
        ocultarLogin();
        pintarUsuario();
        await cargarTodo();
    } catch (err) {
        mostrarErrorLogin(err.message);
        $('login-password').select();   // enfoca el campo del error
    } finally {
        boton.disabled = false;
        boton.innerHTML = '<span>Entrar</span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
    }
});

window.salir = async () => {
    const ok = await confirmarAccion('¿Seguro que quieres cerrar tu sesión?', {
        titulo: 'Cerrar sesión',
        textoAceptar: 'Cerrar sesión'
    });
    if (ok) {
        cerrarSesion();
        window.location.reload();
    }
};

// ==========================================================
//                       NAVEGACIÓN
// ==========================================================

window.mostrarSeccion = (idSeccion, boton) => {
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('activo'));
    $(idSeccion).classList.add('activa');
    if (boton) boton.classList.add('activo');
};

// ==========================================================
//                     CARGA GENERAL
// ==========================================================

async function cargarTodo() {
    mostrarEsqueletos();
    try {
        [productos, clientes, proveedores, empleados, ventas] = await Promise.all([
            obtenerProductos(),
            obtenerClientes(),
            obtenerProveedores(),
            obtenerEmpleados(),
            obtenerVentas()
        ]);
    } catch (error) {
        fallo(error);
        return;
    }

    actualizarContadores();
    renderProductos();
    renderClientes();
    renderProveedores();
    renderEmpleados();
    renderVentas();
    renderDestacados();
    llenarSelectores();
}

function mostrarEsqueletos() {
    const tablas = [
        ['tabla-clientes', 5], ['tabla-proveedores', 5],
        ['tabla-empleados', 6], ['tabla-ventas', 7]
    ];
    tablas.forEach(([id, cols]) => {
        const t = $(id);
        if (t && t.children.length === 0) t.innerHTML = esqueleto(cols);
    });

    const grid = $('tabla-productos');
    if (grid && grid.children.length === 0) grid.innerHTML = esqueletoProductos();
}

function actualizarContadores() {
    $('contador-productos').textContent = productos.length;
    $('contador-clientes').textContent = clientes.length;
    $('contador-proveedores').textContent = proveedores.length;
    $('contador-ventas').textContent = ventas.length;
}

function llenarSelectores() {
    // Proveedores en el formulario de productos
    $('producto-proveedor').innerHTML = '<option value="">Selecciona un proveedor...</option>' +
        proveedores.map(p => `<option value="${esc(p._id)}">${esc(p.nombre)}</option>`).join('');

    // Categorías sugeridas
    const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))].sort();
    $('lista-categorias').innerHTML = categorias.map(c => `<option value="${esc(c)}">`).join('');

    // Punto de venta: cliente es opcional
    $('venta-cliente').innerHTML = '<option value="">Venta sin cliente registrado</option>' +
        clientes.map(c => `<option value="${esc(c._id)}">${esc(c.nombre)}</option>`).join('');

    $('venta-empleado').innerHTML = '<option value="">Selecciona un empleado...</option>' +
        empleados.filter(e => e.activo !== false)
            .map(e => `<option value="${esc(e._id)}">${esc(e.nombre)} — ${esc(e.puesto)}</option>`).join('');

    // Buscador dinámico de productos: por nombre o código de barras
    mapaProductosVenta.clear();
    $('lista-productos-venta').innerHTML = productos.map(p => {
        const u = p.unidad === 'kg' ? 'kg' : 'pz';
        const etiqueta = `${p.nombre} — ${money(p.precio_venta)}/${u} (stock ${p.stock})`;
        mapaProductosVenta.set(etiqueta, p);
        return `<option value="${esc(etiqueta)}"></option>`;
    }).join('');

    // Quien atiende siempre es el empleado con la sesión iniciada (no se cambia)
    const yo = obtenerEmpleado();
    if (yo && empleados.some(e => e._id === yo._id)) {
        $('venta-empleado').value = yo._id;
    }
}

// ==========================================================
//                       PRODUCTOS
// ==========================================================
function renderProductos(filtro = '') {
    const cuerpo = $('tabla-productos');
    const texto = filtro.toLowerCase();

    const lista = productos.filter(p =>
        (p.nombre || '').toLowerCase().includes(texto) ||
        (p.categoria || '').toLowerCase().includes(texto)
    );

    if (lista.length === 0) {
        cuerpo.innerHTML = `
            <div class="vacio vacio-grid">
                <i class="fa-solid fa-box-open" aria-hidden="true"></i>
                <p>${esc(filtro ? `Ningún producto coincide con "${filtro}".` : 'Aún no hay productos registrados.')}</p>
            </div>`;
        return;
    }

    cuerpo.innerHTML = lista.map(p => {
        const unidad = p.unidad === 'kg' ? 'kg' : 'pz';
        let clase = 'disponible', etiqueta = 'Disponible';
        if (p.stock <= 0) { clase = 'agotado'; etiqueta = 'Agotado'; }
        else if (p.stock <= 5) { clase = 'bajo'; etiqueta = 'Stock bajo'; }

        const proveedor = p.proveedor_id && p.proveedor_id.nombre ? p.proveedor_id.nombre : '—';

        const img = p.imagen
            ? `<img src="${esc(p.imagen)}" alt="${esc(p.nombre)}">`
            : '<span class="sin-foto"><i class="fa-solid fa-image"></i></span>';

        return `
            <div class="producto-card-admin">
                <div class="foto">${img}</div>
                <div class="cuerpo">
                    <h3>${esc(p.nombre)}</h3>
                    <small class="codigo">${esc(p.codigo_barras || 'sin código')}</small>
                    <p class="categoria">${esc(p.categoria)}</p>
                    <div class="precio-stock">
                        <strong>${money(p.precio_venta)} <small>/ ${unidad}</small></strong>
                        <span class="estado ${clase}">${p.stock} ${unidad} (${etiqueta})</span>
                    </div>
                    <p class="proveedor"><i class="fa-solid fa-truck" aria-hidden="true"></i> ${esc(proveedor)}</p>
                </div>
                <div class="acciones">
                    <button class="btn-editar" onclick="editarProducto('${esc(p._id)}')"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-eliminar" onclick="borrarProducto('${esc(p._id)}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
    }).join('');
}

function renderDestacados() {
    const cont = $('productos-destacados');
    if (productos.length === 0) {
        cont.innerHTML = '<div class="vacio" style="grid-column:1/-1"><i class="fa-solid fa-box-open"></i><p>Aún no hay productos registrados.</p></div>';
        return;
    }

    cont.innerHTML = productos.slice(0, 4).map(p => {
        const unidad = p.unidad === 'kg' ? 'kg' : 'pz';
        const foto = p.imagen
            ? `<img src="${esc(p.imagen)}" alt="${esc(p.nombre)}">`
            : '<i class="fa-solid fa-box-open" aria-hidden="true"></i>';
        const agotado = p.stock <= 0;
        return `
            <div class="producto-card">
                <div class="foto">${foto}</div>
                <h3>${esc(p.nombre)}</h3>
                <p class="meta">${esc(p.categoria)} &middot; ${p.stock} ${unidad} en stock</p>
                <strong>${money(p.precio_venta)}</strong>
                <button onclick="agregarAlCarrito('${esc(p._id)}')" ${agotado ? 'disabled' : ''}>
                    ${agotado ? 'Sin stock' : 'Agregar'}
                </button>
            </div>`;
    }).join('');
}

function limpiarFormProducto() {
    $('form-producto').reset();
    $('producto-id').value = '';
    $('titulo-form-producto').textContent = 'Nuevo producto';
    $('cancelar-producto').style.display = 'none';
}

$('form-producto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = $('producto-id').value;
    const datos = {
        codigo_barras: $('producto-codigo').value.trim(),
        nombre: $('producto-nombre').value.trim(),
        categoria: $('producto-categoria').value.trim(),
        unidad: $('producto-unidad').value,
        precio_compra: Number($('producto-precio-compra').value),
        precio_venta: Number($('producto-precio-venta').value),
        stock: Number($('producto-stock').value),
        proveedor_id: $('producto-proveedor').value,
        imagen: $('producto-imagen').value.trim()
    };

    const caducidad = $('producto-caducidad').value;
    if (caducidad) datos.fecha_caducidad = caducidad;

    try {
        if (id) {
            await actualizarProducto(id, datos);
            aviso('Producto actualizado correctamente');
        } else {
            await agregarProducto(datos);
            aviso('Producto guardado correctamente');
        }
        limpiarFormProducto();
        await cargarTodo();
    } catch (error) {
        fallo(error);
    }
});

window.editarProducto = (id) => {
    const p = productos.find(x => x._id === id);
    if (!p) return;

    $('producto-id').value = p._id;
    $('producto-codigo').value = p.codigo_barras || '';
    $('producto-nombre').value = p.nombre || '';
    $('producto-categoria').value = p.categoria || '';
    $('producto-unidad').value = p.unidad || 'pieza';
    $('producto-precio-compra').value = p.precio_compra;
    $('producto-precio-venta').value = p.precio_venta;
    $('producto-stock').value = p.stock;
    $('producto-proveedor').value = p.proveedor_id && p.proveedor_id._id ? p.proveedor_id._id : (p.proveedor_id || '');
    $('producto-caducidad').value = fechaInput(p.fecha_caducidad);
    $('producto-imagen').value = p.imagen || '';

    $('titulo-form-producto').textContent = 'Editar producto';
    $('cancelar-producto').style.display = 'inline-block';
    $('producto-nombre').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.borrarProducto = async (id) => {
    const ok = await confirmarAccion('¿Eliminar este producto de la base de datos? Esta acción no se puede deshacer.', {
        titulo: 'Eliminar producto',
        textoAceptar: 'Eliminar',
        peligro: true
    });
    if (!ok) return;
    try {
        await eliminarProducto(id);
        aviso('Producto eliminado');
        await cargarTodo();
    } catch (error) {
        fallo(error);
    }
};

$('cancelar-producto').addEventListener('click', limpiarFormProducto);
$('buscar-producto').addEventListener('input', (e) => renderProductos(e.target.value));

// ==========================================================
//                        CLIENTES
// ==========================================================

function renderClientes() {
    const cuerpo = $('tabla-clientes');
    if (clientes.length === 0) {
        cuerpo.innerHTML = vacio(5, 'fa-users', 'Aún no hay clientes registrados.');
        return;
    }

    cuerpo.innerHTML = clientes.map(c => `
        <tr>
            <td data-col="Nombre"><strong>${esc(c.nombre)}</strong></td>
            <td data-col="Correo">${esc(c.email)}</td>
            <td data-col="Teléfono">${esc(c.telefono)}</td>
            <td data-col="Registro">${fecha(c.fecha_registro)}</td>
            <td>
                <button class="btn-editar" onclick="editarCliente('${esc(c._id)}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-eliminar" onclick="borrarCliente('${esc(c._id)}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

function limpiarFormCliente() {
    $('form-cliente').reset();
    $('cliente-id').value = '';
    $('titulo-form-cliente').textContent = 'Nuevo cliente';
    $('cancelar-cliente').style.display = 'none';
}

$('form-cliente').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = $('cliente-id').value;
    const datos = {
        nombre: $('cliente-nombre').value.trim(),
        email: $('cliente-email').value.trim(),
        telefono: $('cliente-telefono').value.trim(),
        direccion: $('cliente-direccion').value.trim()
    };

    try {
        if (id) {
            await actualizarCliente(id, datos);
            aviso('Cliente actualizado correctamente');
        } else {
            await agregarCliente(datos);
            aviso('Cliente guardado correctamente');
        }
        limpiarFormCliente();
        await cargarTodo();
    } catch (error) {
        fallo(error);
    }
});

window.editarCliente = (id) => {
    const c = clientes.find(x => x._id === id);
    if (!c) return;
    $('cliente-id').value = c._id;
    $('cliente-nombre').value = c.nombre || '';
    $('cliente-email').value = c.email || '';
    $('cliente-telefono').value = c.telefono || '';
    $('cliente-direccion').value = c.direccion || '';
    $('titulo-form-cliente').textContent = 'Editar cliente';
    $('cancelar-cliente').style.display = 'inline-block';
    $('cliente-nombre').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.borrarCliente = async (id) => {
    const ok = await confirmarAccion('¿Eliminar este cliente de la base de datos? Esta acción no se puede deshacer.', {
        titulo: 'Eliminar cliente',
        textoAceptar: 'Eliminar',
        peligro: true
    });
    if (!ok) return;
    try {
        await eliminarCliente(id);
        aviso('Cliente eliminado');
        await cargarTodo();
    } catch (error) {
        fallo(error);
    }
};

$('cancelar-cliente').addEventListener('click', limpiarFormCliente);

// ==========================================================
//                      PROVEEDORES
// ==========================================================

function renderProveedores() {
    const cuerpo = $('tabla-proveedores');
    if (proveedores.length === 0) {
        cuerpo.innerHTML = vacio(5, 'fa-truck', 'Aún no hay proveedores registrados.');
        return;
    }

    cuerpo.innerHTML = proveedores.map(p => `
        <tr>
            <td data-col="Empresa"><strong>${esc(p.nombre)}</strong></td>
            <td data-col="Correo">${esc(p.email)}</td>
            <td data-col="Teléfono">${esc(p.telefono)}</td>
            <td data-col="Dirección">${esc(p.direccion || '—')}</td>
            <td>
                <button class="btn-editar" onclick="editarProveedor('${esc(p._id)}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-eliminar" onclick="borrarProveedor('${esc(p._id)}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

function limpiarFormProveedor() {
    $('form-proveedor').reset();
    $('proveedor-id').value = '';
    $('titulo-form-proveedor').textContent = 'Nuevo proveedor';
    $('cancelar-proveedor').style.display = 'none';
}

$('form-proveedor').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = $('proveedor-id').value;
    const datos = {
        nombre: $('proveedor-nombre').value.trim(),
        email: $('proveedor-email').value.trim(),
        telefono: $('proveedor-telefono').value.trim(),
        direccion: $('proveedor-direccion').value.trim(),
        activo: true
    };

    try {
        if (id) {
            await actualizarProveedor(id, datos);
            aviso('Proveedor actualizado correctamente');
        } else {
            await agregarProveedor(datos);
            aviso('Proveedor guardado correctamente');
        }
        limpiarFormProveedor();
        await cargarTodo();
    } catch (error) {
        fallo(error);
    }
});

window.editarProveedor = (id) => {
    const p = proveedores.find(x => x._id === id);
    if (!p) return;
    $('proveedor-id').value = p._id;
    $('proveedor-nombre').value = p.nombre || '';
    $('proveedor-email').value = p.email || '';
    $('proveedor-telefono').value = p.telefono || '';
    $('proveedor-direccion').value = p.direccion || '';
    $('titulo-form-proveedor').textContent = 'Editar proveedor';
    $('cancelar-proveedor').style.display = 'inline-block';
    $('proveedor-nombre').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.borrarProveedor = async (id) => {
    const ok = await confirmarAccion('¿Eliminar este proveedor de la base de datos? Esta acción no se puede deshacer.', {
        titulo: 'Eliminar proveedor',
        textoAceptar: 'Eliminar',
        peligro: true
    });
    if (!ok) return;
    try {
        await eliminarProveedor(id);
        aviso('Proveedor eliminado');
        await cargarTodo();
    } catch (error) {
        fallo(error);
    }
};

$('cancelar-proveedor').addEventListener('click', limpiarFormProveedor);

// ==========================================================
//                       EMPLEADOS
// ==========================================================

function renderEmpleados() {
    const cuerpo = $('tabla-empleados');
    if (empleados.length === 0) {
        cuerpo.innerHTML = vacio(6, 'fa-user-tie', 'Aún no hay empleados registrados.');
        return;
    }

    cuerpo.innerHTML = empleados.map(e => `
        <tr>
            <td data-col="Nombre"><strong>${esc(e.nombre)}</strong><br><small>${esc(e.email)}</small></td>
            <td data-col="Puesto">${esc(e.puesto)}</td>
            <td data-col="Turno">${esc(e.turno)}</td>
            <td data-col="Usuario">${esc(e.usuario)}</td>
            <td data-col="Estado"><span class="estado ${e.activo ? 'disponible' : 'agotado'}">${e.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td>
                <button class="btn-editar" onclick="editarEmpleado('${esc(e._id)}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-eliminar" onclick="borrarEmpleado('${esc(e._id)}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

function limpiarFormEmpleado() {
    $('form-empleado').reset();
    $('empleado-id').value = '';
    $('titulo-form-empleado').textContent = 'Registrar empleado';
    $('empleado-password').required = true;
    $('ayuda-password').textContent = '(mínimo 6 caracteres)';
    $('cancelar-empleado').style.display = 'none';
}

$('form-empleado').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = $('empleado-id').value;
    const datos = {
        nombre: $('empleado-nombre').value.trim(),
        email: $('empleado-email').value.trim(),
        telefono: $('empleado-telefono').value.trim(),
        puesto: $('empleado-puesto').value,
        turno: $('empleado-turno').value,
        usuario: $('empleado-usuario').value.trim(),
        salario: Number($('empleado-salario').value),
        fecha_ingreso: $('empleado-ingreso').value,
        activo: $('empleado-activo').value === 'true'
    };

    // Al editar, la contraseña solo se manda si se escribió una nueva
    const password = $('empleado-password').value;
    if (password) datos.password = password;

    if (!id && !password) {
        aviso('La contraseña es obligatoria al registrar un empleado nuevo');
        return;
    }

    try {
        if (id) {
            await actualizarEmpleado(id, datos);
            aviso('Empleado actualizado correctamente');
        } else {
            await agregarEmpleado(datos);
            aviso('Empleado guardado correctamente');
        }
        limpiarFormEmpleado();
        await cargarTodo();
    } catch (error) {
        fallo(error);
    }
});

window.editarEmpleado = (id) => {
    const e = empleados.find(x => x._id === id);
    if (!e) return;

    $('empleado-id').value = e._id;
    $('empleado-nombre').value = e.nombre || '';
    $('empleado-email').value = e.email || '';
    $('empleado-telefono').value = e.telefono || '';
    $('empleado-puesto').value = e.puesto || 'Vendedor';
    $('empleado-turno').value = e.turno || 'Matutino';
    $('empleado-usuario').value = e.usuario || '';
    $('empleado-salario').value = e.salario;
    $('empleado-ingreso').value = fechaInput(e.fecha_ingreso);
    $('empleado-activo').value = String(e.activo !== false);

    // La contraseña nunca llega del servidor: se deja vacía
    $('empleado-password').value = '';
    $('empleado-password').required = false;
    $('ayuda-password').textContent = '(déjala vacía para conservar la actual)';

    $('titulo-form-empleado').textContent = 'Editar empleado';
    $('cancelar-empleado').style.display = 'inline-block';
    $('empleado-nombre').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.borrarEmpleado = async (id) => {
    const yo = obtenerEmpleado();
    if (yo && yo._id === id) {
        aviso('No puedes eliminar tu propia cuenta mientras la usas');
        return;
    }
    const ok = await confirmarAccion('¿Eliminar este empleado de la base de datos? Esta acción no se puede deshacer.', {
        titulo: 'Eliminar empleado',
        textoAceptar: 'Eliminar',
        peligro: true
    });
    if (!ok) return;
    try {
        await eliminarEmpleado(id);
        aviso('Empleado eliminado');
        await cargarTodo();
    } catch (error) {
        fallo(error);
    }
};

$('cancelar-empleado').addEventListener('click', limpiarFormEmpleado);

// ==========================================================
//                  PUNTO DE VENTA (CARRITO)
// ==========================================================

window.agregarAlCarrito = async (idProducto) => {
    const p = productos.find(x => x._id === idProducto);
    if (!p) return;

    const porKilo = p.unidad === 'kg';
    const enCarrito = carrito.find(i => i._id === p._id);

    if (porKilo) {
        const texto = await pedirValor(
            `¿Cuántos kg de ${p.nombre} quieres agregar? (disponible: ${p.stock} kg)`,
            enCarrito ? enCarrito.cantidad : '1',
            { titulo: 'Cantidad en kg', tipo: 'number', step: '0.01', min: '0.01', textoAceptar: 'Agregar' }
        );
        if (texto === null) return;
        const kg = Number(String(texto).replace(',', '.'));
        if (!isFinite(kg) || kg <= 0) {
            aviso('Cantidad inválida');
            return;
        }
        if (kg > p.stock) {
            aviso(`Solo hay ${p.stock} kg disponibles`);
            return;
        }
        if (enCarrito) enCarrito.cantidad = kg;
        else carrito.push({ _id: p._id, nombre: p.nombre, precio_venta: p.precio_venta, unidad: p.unidad, stock: p.stock, cantidad: kg });
    } else {
        const actual = enCarrito ? enCarrito.cantidad : 0;
        if (actual + 1 > p.stock) {
            aviso(`Solo hay ${p.stock} piezas disponibles`);
            return;
        }
        if (enCarrito) enCarrito.cantidad += 1;
        else carrito.push({ _id: p._id, nombre: p.nombre, precio_venta: p.precio_venta, unidad: p.unidad, stock: p.stock, cantidad: 1 });
    }

    renderCarrito();
    mostrarSeccion('ventas', document.querySelectorAll('.menu-item')[5]);
};

window.cambiarCantidad = (idProducto, delta) => {
    const item = carrito.find(i => i._id === idProducto);
    if (!item) return;

    const paso = item.unidad === 'kg' ? 0.25 : 1;
    const nueva = Math.round((item.cantidad + (delta * paso)) * 1000) / 1000;

    if (nueva <= 0) {
        carrito = carrito.filter(i => i._id !== idProducto);
    } else if (nueva > item.stock) {
        aviso(`Solo hay ${item.stock} ${item.unidad === 'kg' ? 'kg' : 'piezas'} disponibles`);
        return;
    } else {
        item.cantidad = nueva;
    }
    renderCarrito();
};

window.quitarDelCarrito = (idProducto) => {
    carrito = carrito.filter(i => i._id !== idProducto);
    renderCarrito();
};

function renderCarrito() {
    const cuerpo = $('carrito');

    if (carrito.length === 0) {
        cuerpo.innerHTML = vacio(5, 'fa-cart-shopping', 'El carrito está vacío. Agrega productos para cobrar.');
        $('total-venta').textContent = '$0.00';
        return;
    }

    let total = 0;
    cuerpo.innerHTML = carrito.map(item => {
        const subtotal = item.precio_venta * item.cantidad;
        total += subtotal;
        const u = item.unidad === 'kg' ? 'kg' : 'pz';
        return `
            <tr>
                <td data-col="Producto"><strong>${esc(item.nombre)}</strong></td>
                <td data-col="Cantidad">
                    <button class="btn-cantidad" onclick="cambiarCantidad('${esc(item._id)}', -1)">-</button>
                    <span class="cantidad">${item.cantidad} ${u}</span>
                    <button class="btn-cantidad" onclick="cambiarCantidad('${esc(item._id)}', 1)">+</button>
                </td>
                <td data-col="Precio">${money(item.precio_venta)}</td>
                <td data-col="Subtotal">${money(subtotal)}</td>
                <td><button class="btn-eliminar" onclick="quitarDelCarrito('${esc(item._id)}')"><i class="fa-solid fa-xmark"></i></button></td>
            </tr>`;
    }).join('');

    $('total-venta').textContent = money(total);
}

const inputBuscarProducto = $('venta-buscar-producto');

// Al elegir una opción del datalist (búsqueda por nombre), se agrega directo al carrito
inputBuscarProducto.addEventListener('input', (e) => {
    const valor = e.target.value;
    const producto = mapaProductosVenta.get(valor);
    if (producto) {
        agregarAlCarrito(producto._id);
        e.target.value = '';
    }
});

// Escaneo de código de barras: el lector "escribe" el código y manda Enter solo
inputBuscarProducto.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const valor = e.target.value.trim();
    if (!valor) return;

    const porCodigo = productos.find(p => p.codigo_barras && p.codigo_barras === valor);
    if (porCodigo) {
        agregarAlCarrito(porCodigo._id);
        e.target.value = '';
        return;
    }

    const porNombre = mapaProductosVenta.get(valor);
    if (porNombre) {
        agregarAlCarrito(porNombre._id);
        e.target.value = '';
        return;
    }

    aviso('No se encontró ningún producto con ese nombre o código de barras');
});

$('btn-cobrar').addEventListener('click', async () => {
    if (carrito.length === 0) {
        aviso('El carrito está vacío');
        return;
    }

    const clienteId = $('venta-cliente').value || null;
    const empleadoId = $('venta-empleado').value;
    const metodoPago = $('venta-metodo').value;

    if (!empleadoId) { aviso('No se detectó tu sesión, vuelve a iniciar sesión'); return; }

    const boton = $('btn-cobrar');
    boton.disabled = true;
    boton.textContent = 'Cobrando...';

    try {
        const venta = await agregarVenta(construirVenta({ empleadoId, clienteId, metodoPago, carrito }));
        aviso(`Venta ${venta.folio} registrada por ${money(venta.total)}`);
        carrito = [];
        renderCarrito();
        await cargarTodo();
    } catch (error) {
        fallo(error);
    } finally {
        boton.disabled = false;
        boton.textContent = 'Cobrar venta';
    }
});

// ==========================================================
//                    HISTORIAL DE VENTAS
// ==========================================================

function renderVentas() {
    const cuerpo = $('tabla-ventas');
    if (ventas.length === 0) {
        cuerpo.innerHTML = vacio(7, 'fa-receipt', 'Todavía no se ha registrado ninguna venta.');
        return;
    }

    cuerpo.innerHTML = ventas.map(v => {
        const cancelada = v.estatus === 'cancelada';
        return `
            <tr class="${cancelada ? 'fila-cancelada' : ''}">
                <td data-col="Folio"><strong>${esc(v.folio)}</strong></td>
                <td data-col="Fecha">${fecha(v.fecha)}</td>
                <td data-col="Cliente">${esc(v.cliente_nombre)}</td>
                <td data-col="Total">${money(v.total)}</td>
                <td data-col="Pago">${esc(v.metodo_pago)}</td>
                <td data-col="Estatus"><span class="estado ${cancelada ? 'agotado' : 'disponible'}">${esc(v.estatus)}</span></td>
                <td>
                    <button class="btn-editar" onclick="verVenta('${esc(v._id)}')"><i class="fa-solid fa-eye"></i></button>
                    ${cancelada ? '' : `<button class="btn-cancelar" onclick="anularVenta('${esc(v._id)}')" title="Cancelar venta"><i class="fa-solid fa-ban"></i></button>`}
                    <button class="btn-eliminar" onclick="borrarVenta('${esc(v._id)}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
    }).join('');
}

window.verVenta = async (id) => {
    try {
        const v = await obtenerVentaPorId(id);
        $('modal-venta-titulo').textContent = `Venta ${v.folio}`;

        const empleado = v.empleado_id && v.empleado_id.nombre ? v.empleado_id.nombre : '—';
        const filas = v.items.map(i => {
            const u = i.unidad === 'kg' ? 'kg' : 'pz';
            return `<tr>
                        <td>${esc(i.nombre)}</td>
                        <td>${i.cantidad} ${u}</td>
                        <td>${money(i.precio)}</td>
                        <td>${money(i.subtotal)}</td>
                    </tr>`;
        }).join('');

        $('modal-venta-cuerpo').innerHTML = `
            <div class="modal-datos">
                <p><strong>Cliente:</strong> ${esc(v.cliente_nombre)}</p>
                <p><strong>Atendió:</strong> ${esc(empleado)}</p>
                <p><strong>Fecha:</strong> ${fecha(v.fecha)}</p>
                <p><strong>Pago:</strong> ${esc(v.metodo_pago)}</p>
                <p><strong>Estatus:</strong> ${esc(v.estatus)}</p>
            </div>
            <table>
                <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead>
                <tbody>${filas}</tbody>
            </table>
            <h3 class="modal-total">Total: ${money(v.total)}</h3>`;

        $('modal-venta').classList.add('visible');
    } catch (error) {
        fallo(error);
    }
};

window.anularVenta = async (id) => {
    const ok = await confirmarAccion('¿Cancelar esta venta? El stock se devolverá al inventario.', {
        titulo: 'Cancelar venta',
        textoAceptar: 'Cancelar venta',
        peligro: true
    });
    if (!ok) return;
    try {
        await cancelarVenta(id);
        aviso('Venta cancelada y stock devuelto');
        await cargarTodo();
    } catch (error) {
        fallo(error);
    }
};

window.borrarVenta = async (id) => {
    const ok = await confirmarAccion('¿Eliminar esta venta? Si estaba completada, el stock se devolverá. Esta acción no se puede deshacer.', {
        titulo: 'Eliminar venta',
        textoAceptar: 'Eliminar',
        peligro: true
    });
    if (!ok) return;
    try {
        await eliminarVenta(id);
        aviso('Venta eliminada');
        await cargarTodo();
    } catch (error) {
        fallo(error);
    }
};

$('cerrar-modal-venta').addEventListener('click', () => $('modal-venta').classList.remove('visible'));
$('modal-venta').addEventListener('click', (e) => {
    if (e.target.id === 'modal-venta') $('modal-venta').classList.remove('visible');
});

$('modal-confirmar').addEventListener('click', (e) => {
    if (e.target.id === 'modal-confirmar' && cerrarModalConfirmar) cerrarModalConfirmar();
});

// ==========================================================
//                    BÚSQUEDA GLOBAL
// ==========================================================

$('busqueda-global').addEventListener('input', (e) => {
    const texto = e.target.value.trim();
    if (!texto) return;
    mostrarSeccion('productos', document.querySelectorAll('.menu-item')[1]);
    $('buscar-producto').value = texto;
    renderProductos(texto);
});


// ==========================================================
//                    MENÚ MÓVIL (DRAWER)
// ==========================================================

const sidebar = document.getElementById('sidebar');
const drawerFondo = $('drawer-fondo');
const btnMenu = $('btn-menu');

function abrirMenu() {
    sidebar.classList.add('abierto');
    drawerFondo.hidden = false;
    btnMenu.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}

function cerrarMenu() {
    sidebar.classList.remove('abierto');
    drawerFondo.hidden = true;
    btnMenu.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

btnMenu.addEventListener('click', () => {
    sidebar.classList.contains('abierto') ? cerrarMenu() : abrirMenu();
});
drawerFondo.addEventListener('click', cerrarMenu);

// Escape cierra el menú o el modal abierto
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (sidebar.classList.contains('abierto')) cerrarMenu();
    $('modal-venta').classList.remove('visible');
    if (cerrarModalConfirmar) cerrarModalConfirmar();
});

// Al navegar en móvil, el menú se cierra solo
document.querySelectorAll('.menu-item').forEach(b => b.addEventListener('click', () => {
    if (window.innerWidth <= 860) cerrarMenu();
}));

// Si se agranda la ventana, no dejar el drawer colgado
window.addEventListener('resize', () => {
    if (window.innerWidth > 860 && sidebar.classList.contains('abierto')) cerrarMenu();
});

// ==========================================================
//                       ARRANQUE
// ==========================================================

if (haySesion()) {
    ocultarLogin();
    pintarUsuario();
    cargarTodo();
} else {
    mostrarLogin();
}