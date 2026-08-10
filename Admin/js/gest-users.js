(function() {
    'use strict';

    /* simulacion base de datos */
    let usuarios = [
        { id: 1, tipo: 'Docente', nombre: 'María López', correo: 'maria.lopez@cnehk.ac.cr', telefono: '8812-3456', estado: 'activo', fechaRegistro: '2025-03-10' },
        { id: 2, tipo: 'Docente', nombre: 'Carlos Ramírez', correo: 'carlos.ramirez@cnehk.ac.cr', telefono: '8834-7890', estado: 'activo', fechaRegistro: '2025-04-15' },
        { id: 3, tipo: 'Terapeuta', nombre: 'Carmen Reyes', correo: 'carmen.reyes@cnehk.ac.cr', telefono: '8856-1234', estado: 'activo', fechaRegistro: '2025-02-20' },
        { id: 4, tipo: 'Terapeuta', nombre: 'Jorge Mora', correo: 'jorge.mora@cnehk.ac.cr', telefono: '8878-5678', estado: 'inactivo', fechaRegistro: '2024-11-05' },
        { id: 5, tipo: 'Encargado Legal', nombre: 'Ana Villalobos', correo: 'ana.villalobos@gmail.com', telefono: '8890-9012', estado: 'activo', fechaRegistro: '2025-05-01' },
        { id: 6, tipo: 'Estudiante', nombre: 'Sebastián Morales', correo: 'smorales@estudiante.cnehk.ac.cr', telefono: '8801-2345', estado: 'activo', fechaRegistro: '2025-01-10' },
        { id: 7, tipo: 'Estudiante', nombre: 'Valentina Cruz', correo: 'vcruz@estudiante.cnehk.ac.cr', telefono: '8823-4567', estado: 'activo', fechaRegistro: '2025-01-10' },
        { id: 8, tipo: 'Docente', nombre: 'Roberto Sánchez', correo: 'roberto.sanchez@cnehk.ac.cr', telefono: '8845-6789', estado: 'activo', fechaRegistro: '2025-06-01' }
    ];

    let contadorId = 9;
    let filtroTipoActual = 'todos';
    let textoBusqueda = '';
    let idEnEdicion = null;
    let idPendienteEliminar = null;
    let tipoPreseleccionado = '';

    /* DOM */
    let contenedorListado, inputBusqueda, botonesFiltro, estadisticaResumen;
    let modalUsuario, formularioUsuario, tituloModal, btnCerrarModal, btnCancelarModal;
    let modalConfirmacion, btnConfirmarEliminar, btnCancelarEliminar, textoConfirmacion;
    let contenedorNotificaciones;

    document.addEventListener('DOMContentLoaded', inicializar);

    function inicializar() {
        contenedorListado = document.getElementById('contenedor-listado-usuarios');
        inputBusqueda = document.getElementById('input-busqueda-usuario');
        botonesFiltro = document.querySelectorAll('.btn-filtro-tipo');
        estadisticaResumen = document.getElementById('estadistica-resumen-usuarios');

        modalUsuario = document.getElementById('modal-usuario');
        formularioUsuario = document.getElementById('formulario-usuario');
        tituloModal = document.getElementById('titulo-modal-usuario');
        btnCerrarModal = document.getElementById('btn-cerrar-modal-usuario');
        btnCancelarModal = document.getElementById('btn-cancelar-formulario');

        modalConfirmacion = document.getElementById('modal-confirmacion-eliminar');
        btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
        btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
        textoConfirmacion = document.getElementById('texto-confirmacion-eliminar');

        contenedorNotificaciones = document.getElementById('contenedor-notificaciones');

        renderizarLista();

        // busqueda y filtro   - Eventos
        inputBusqueda.addEventListener('input', function(e) {
            textoBusqueda = e.target.value.trim().toLowerCase();
            renderizarLista();
        });

        botonesFiltro.forEach(function(btn) {
            btn.addEventListener('click', function() {
                botonesFiltro.forEach(function(b) {
                    b.classList.remove('filtro-activo');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('filtro-activo');
                btn.setAttribute('aria-pressed', 'true');
                filtroTipoActual = btn.dataset.filtro;
                renderizarLista();
            });
        });

        // Cards de registro
        document.querySelectorAll('.register-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var titulo = card.querySelector('.register-card__title').textContent.trim();
                tipoPreseleccionado = titulo;
                abrirModal('crear', null);
            });
        });

        // Modal
        btnCerrarModal.addEventListener('click', cerrarModal);
        btnCancelarModal.addEventListener('click', cerrarModal);
        formularioUsuario.addEventListener('submit', manejarEnvio);

        // Deleg eventos en lista
        contenedorListado.addEventListener('click', manejarClickListado);

        // Confirm eliminar
        btnCancelarEliminar.addEventListener('click', cerrarModalConfirmacion);
        btnConfirmarEliminar.addEventListener('click', confirmarEliminacion);

        // Cerrar modals con click fuera / tecla Escape
        modalUsuario.addEventListener('click', function(e) {
            if (e.target === modalUsuario) cerrarModal();
        });
        modalConfirmacion.addEventListener('click', function(e) {
            if (e.target === modalConfirmacion) cerrarModalConfirmacion();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                cerrarModal();
                cerrarModalConfirmacion();
            }
        });
    }

    /* render */
    function renderizarLista() {
        var filtrados = usuarios.filter(function(u) {
            var coincideTipo = filtroTipoActual === 'todos' || u.tipo === filtroTipoActual;
            var textoCompleto = (u.nombre + ' ' + u.correo + ' ' + u.tipo).toLowerCase();
            var coincideBusqueda = textoCompleto.includes(textoBusqueda);
            return coincideTipo && coincideBusqueda;
        });

        if (filtrados.length === 0) {
            contenedorListado.innerHTML = '<p class="mensaje-vacio">No se encontraron usuarios con los filtros aplicados.</p>';
        } else {
            contenedorListado.innerHTML = filtrados.map(crearFilaHTML).join('');
        }
        actualizarEstadistica();
    }

    function crearFilaHTML(u) {
        var iniciales = u.nombre.split(' ').map(function(p) { return p[0]; }).join('').substring(0, 2).toUpperCase();
        var claseEstado = u.estado === 'activo' ? 'estado--activo' : 'estado--inactivo';
        var textoEstado = u.estado === 'activo' ? 'Activo' : 'Inactivo';

        return (
            '<div class="fila-usuario" data-id="' + u.id + '">' +
            '<div class="fila-usuario__info">' +
            '<div class="fila-usuario__avatar">' + iniciales + '</div>' +
            '<div class="fila-usuario__datos">' +
            '<p class="fila-usuario__nombre">' + escaparHTML(u.nombre) + '</p>' +
            '<p class="fila-usuario__correo">' + escaparHTML(u.correo) + '</p>' +
            '</div>' +
            '</div>' +
            '<span class="fila-usuario__tipo">' + escaparHTML(u.tipo) + '</span>' +
            '<span class="fila-usuario__estado ' + claseEstado + '">' + textoEstado + '</span>' +
            '<div class="fila-usuario__acciones">' +
            '<button type="button" class="btn-accion btn-editar" data-accion="editar" title="Editar">✏️</button>' +
            '<button type="button" class="btn-accion btn-eliminar" data-accion="eliminar" title="Eliminar">🗑️</button>' +
            '</div>' +
            '</div>'
        );
    }

    function actualizarEstadistica() {
        var activos = usuarios.filter(function(u) { return u.estado === 'activo'; }).length;
        estadisticaResumen.textContent = activos + ' activos · ' + usuarios.length + ' total';
    }

    /* Modal */
    function abrirModal(modo, id) {
        limpiarErrores();
        if (modo === 'crear') {
            idEnEdicion = null;
            tituloModal.textContent = 'Registrar Usuario';
            formularioUsuario.reset();
            if (tipoPreseleccionado) {
                document.getElementById('select-tipo-usuario').value = tipoPreseleccionado;
            }
        } else {
            idEnEdicion = id;
            tituloModal.textContent = 'Editar Usuario';
            var u = usuarios.find(function(x) { return x.id === id; });
            document.getElementById('input-nombre-usuario').value = u.nombre;
            document.getElementById('input-correo-usuario').value = u.correo;
            document.getElementById('input-telefono-usuario').value = u.telefono;
            document.getElementById('select-tipo-usuario').value = u.tipo;
            document.getElementById('select-estado-usuario').value = u.estado;
        }
        modalUsuario.removeAttribute('hidden');
        document.getElementById('input-nombre-usuario').focus();
        tipoPreseleccionado = '';
    }

    function cerrarModal() {
        modalUsuario.setAttribute('hidden', '');
        limpiarErrores();
        formularioUsuario.reset();
        idEnEdicion = null;
    }

    /* validaciones */
    function manejarEnvio(e) {
        e.preventDefault();
        limpiarErrores();

        var nombre = document.getElementById('input-nombre-usuario').value.trim();
        var correo = document.getElementById('input-correo-usuario').value.trim();
        var telefono = document.getElementById('input-telefono-usuario').value.trim();
        var tipo = document.getElementById('select-tipo-usuario').value;
        var estado = document.getElementById('select-estado-usuario').value;

        var errores = [];

        if (!nombre || nombre.length < 3) {
            errores.push({ campo: 'nombre', msg: 'El nombre es requerido (mínimo 3 caracteres).' });
        }
        if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            errores.push({ campo: 'correo', msg: 'Ingrese un correo electrónico válido.' });
        }
        if (!telefono || !/^\d{4}-?\d{4}$/.test(telefono)) {
            errores.push({ campo: 'telefono', msg: 'Formato de teléfono inválido (ej: 8812-3456).' });
        }
        if (!tipo) {
            errores.push({ campo: 'tipo', msg: 'Seleccione un tipo de usuario.' });
        }
        if (!estado) {
            errores.push({ campo: 'estado', msg: 'Seleccione un estado.' });
        }

        if (errores.length > 0) {
            errores.forEach(function(err) {
                var span = document.querySelector('[data-error-de="' + err.campo + '"]');
                if (span) {
                    span.textContent = err.msg;
                    span.classList.add('error-visible');
                }
            });
            return;
        }

        // guardar
        if (idEnEdicion === null) {
            usuarios.push({
                id: contadorId++,
                tipo: tipo,
                nombre: nombre,
                correo: correo,
                telefono: telefono,
                estado: estado,
                fechaRegistro: new Date().toISOString().split('T')[0]
            });
            mostrarNotificacion('Usuario registrado exitosamente.', 'exito');
        } else {
            var u = usuarios.find(function(x) { return x.id === idEnEdicion; });
            u.nombre = nombre;
            u.correo = correo;
            u.telefono = telefono;
            u.tipo = tipo;
            u.estado = estado;
            mostrarNotificacion('Usuario actualizado exitosamente.', 'exito');
        }

        cerrarModal();
        renderizarLista();
    }

    function limpiarErrores() {
        document.querySelectorAll('.mensaje-error-campo').forEach(function(el) {
            el.textContent = '';
            el.classList.remove('error-visible');
        });
    }

    /* eliminar */
    function manejarClickListado(e) {
        var btn = e.target.closest('[data-accion]');
        if (!btn) return;
        var fila = btn.closest('.fila-usuario');
        var id = parseInt(fila.dataset.id, 10);

        if (btn.dataset.accion === 'editar') {
            abrirModal('editar', id);
        } else if (btn.dataset.accion === 'eliminar') {
            idPendienteEliminar = id;
            var u = usuarios.find(function(x) { return x.id === id; });
            textoConfirmacion.textContent = '¿Está seguro de eliminar a "' + u.nombre + '"?';
            modalConfirmacion.removeAttribute('hidden');
        }
    }

    function confirmarEliminacion() {
        usuarios = usuarios.filter(function(u) { return u.id !== idPendienteEliminar; });
        cerrarModalConfirmacion();
        renderizarLista();
        mostrarNotificacion('Usuario eliminado.', 'exito');
    }

    function cerrarModalConfirmacion() {
        modalConfirmacion.setAttribute('hidden', '');
        idPendienteEliminar = null;
    }

    /* notificaciones*/
    function mostrarNotificacion(mensaje, tipo) {
        var notif = document.createElement('div');
        notif.className = 'notificacion notificacion--' + tipo;
        notif.textContent = mensaje;
        contenedorNotificaciones.appendChild(notif);
        setTimeout(function() {
            notif.classList.add('notificacion--salir');
            setTimeout(function() { notif.remove(); }, 300);
        }, 3000);
    }

    /* utilidads */
    function escaparHTML(texto) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(texto));
        return div.innerHTML;
    }

})();