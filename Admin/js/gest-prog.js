(function() {
    'use strict';

    /* simulacion base de datos */
    let programas = [
        { id: 1, tipo: 'Programa', nombre: 'Habilidades para la Vida', descripcion: 'Desarrollo de habilidades funcionales para la vida diaria.', responsable: 'María López', estado: 'activo', fechaInicio: '2025-02-01' },
        { id: 2, tipo: 'Programa', nombre: 'Autonomía Personal', descripcion: 'Fomento de la independencia en actividades cotidianas.', responsable: 'Carlos Ramírez', estado: 'activo', fechaInicio: '2025-03-15' },
        { id: 3, tipo: 'Terapia', nombre: 'Terapia Ocupacional', descripcion: 'Rehabilitación y desarrollo de destrezas motoras finas y gruesas.', responsable: 'Carmen Reyes', estado: 'activo', fechaInicio: '2025-01-10' },
        { id: 4, tipo: 'Terapia', nombre: 'Terapia de Lenguaje', descripcion: 'Estimulación y corrección del lenguaje oral y escrito.', responsable: 'Jorge Mora', estado: 'activo', fechaInicio: '2025-02-20' },
        { id: 5, tipo: 'Especialidad', nombre: 'Educación Especial', descripcion: 'Atención pedagógica adaptada a necesidades educativas especiales.', responsable: 'Ana Villalobos', estado: 'activo', fechaInicio: '2024-08-01' },
        { id: 6, tipo: 'Especialidad', nombre: 'Psicopedagogía', descripcion: 'Evaluación y acompañamiento en procesos de aprendizaje.', responsable: 'Roberto Sánchez', estado: 'inactivo', fechaInicio: '2024-06-15' },
        { id: 7, tipo: 'Programa', nombre: 'Comunicación Aumentativa', descripcion: 'Uso de sistemas alternativos de comunicación.', responsable: 'María López', estado: 'activo', fechaInicio: '2025-05-01' },
        { id: 8, tipo: 'Terapia', nombre: 'Terapia Física', descripcion: 'Desarrollo de capacidades motoras y posturales.', responsable: 'Carmen Reyes', estado: 'activo', fechaInicio: '2025-04-10' }
    ];

    let contadorId = 9;
    let filtroTipoActual = 'todos';
    let textoBusqueda = '';
    let idEnEdicion = null;
    let idPendienteEliminar = null;
    let tipoPreseleccionado = '';

    /* DOM */
    let contenedorListado, inputBusqueda, botonesFiltro, estadisticaResumen;
    let modalPrograma, formularioPrograma, tituloModal, btnCerrarModal, btnCancelarModal;
    let modalConfirmacion, btnConfirmarEliminar, btnCancelarEliminar, textoConfirmacion;
    let contenedorNotificaciones;

    document.addEventListener('DOMContentLoaded', inicializar);

    function inicializar() {
        contenedorListado = document.getElementById('contenedor-listado-programas');
        inputBusqueda = document.getElementById('input-busqueda-programa');
        botonesFiltro = document.querySelectorAll('.btn-filtro-tipo');
        estadisticaResumen = document.getElementById('estadistica-resumen-programas');

        modalPrograma = document.getElementById('modal-programa');
        formularioPrograma = document.getElementById('formulario-programa');
        tituloModal = document.getElementById('titulo-modal-programa');
        btnCerrarModal = document.getElementById('btn-cerrar-modal-programa');
        btnCancelarModal = document.getElementById('btn-cancelar-formulario-prog');

        modalConfirmacion = document.getElementById('modal-confirmacion-eliminar-prog');
        btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar-prog');
        btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar-prog');
        textoConfirmacion = document.getElementById('texto-confirmacion-eliminar-prog');

        contenedorNotificaciones = document.getElementById('contenedor-notificaciones');

        renderizarLista();

        // Eventos
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
                // Mapear plural a singular para el select
                var mapa = { 'Programas': 'Programa', 'Terapias': 'Terapia', 'Especialidades': 'Especialidad' };
                tipoPreseleccionado = mapa[titulo] || titulo;
                abrirModal('crear', null);
            });
        });

        // Modal
        btnCerrarModal.addEventListener('click', cerrarModal);
        btnCancelarModal.addEventListener('click', cerrarModal);
        formularioPrograma.addEventListener('submit', manejarEnvio);

        // Deleg de eventos
        contenedorListado.addEventListener('click', manejarClickListado);

        // Confirmacion/eliminar
        btnCancelarEliminar.addEventListener('click', cerrarModalConfirmacion);
        btnConfirmarEliminar.addEventListener('click', confirmarEliminacion);

        // Cerrar con click fuera/ tecla Escape
        modalPrograma.addEventListener('click', function(e) {
            if (e.target === modalPrograma) cerrarModal();
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
        var filtrados = programas.filter(function(p) {
            var coincideTipo = filtroTipoActual === 'todos' || p.tipo === filtroTipoActual;
            var textoCompleto = (p.nombre + ' ' + p.tipo + ' ' + p.responsable).toLowerCase();
            var coincideBusqueda = textoCompleto.includes(textoBusqueda);
            return coincideTipo && coincideBusqueda;
        });

        if (filtrados.length === 0) {
            contenedorListado.innerHTML = '<p class="mensaje-vacio">No se encontraron programas con los filtros aplicados.</p>';
        } else {
            contenedorListado.innerHTML = filtrados.map(crearTarjetaHTML).join('');
        }
        actualizarEstadistica();
    }

    function crearTarjetaHTML(p) {
        var claseEstado = p.estado === 'activo' ? 'estado--activo' : 'estado--inactivo';
        var textoEstado = p.estado === 'activo' ? 'Activo' : 'Inactivo';
        var iconoTipo = p.tipo === 'Programa' ? '📋' : p.tipo === 'Terapia' ? '🩺' : '🎓';

        return (
            '<div class="tarjeta-programa" data-id="' + p.id + '">' +
            '<div class="tarjeta-programa__encabezado">' +
            '<div class="tarjeta-programa__icono">' + iconoTipo + '</div>' +
            '<div class="tarjeta-programa__info">' +
            '<p class="tarjeta-programa__nombre">' + escaparHTML(p.nombre) + '</p>' +
            '<p class="tarjeta-programa__tipo">' + escaparHTML(p.tipo) + ' · ' + escaparHTML(p.responsable) + '</p>' +
            '</div>' +
            '<span class="tarjeta-programa__estado ' + claseEstado + '">' + textoEstado + '</span>' +
            '</div>' +
            '<p class="tarjeta-programa__descripcion">' + escaparHTML(p.descripcion) + '</p>' +
            '<div class="tarjeta-programa__acciones">' +
            '<button type="button" class="btn-accion btn-editar" data-accion="editar" title="Editar">✏️ Editar</button>' +
            '<button type="button" class="btn-accion btn-eliminar" data-accion="eliminar" title="Eliminar">🗑️ Eliminar</button>' +
            '</div>' +
            '</div>'
        );
    }

    function actualizarEstadistica() {
        var activos = programas.filter(function(p) { return p.estado === 'activo'; }).length;
        estadisticaResumen.textContent = activos + ' activos · ' + programas.length + ' total';
    }

    /* modal */
    function abrirModal(modo, id) {
        limpiarErrores();
        if (modo === 'crear') {
            idEnEdicion = null;
            tituloModal.textContent = 'Registrar Programa / Terapia / Especialidad';
            formularioPrograma.reset();
            if (tipoPreseleccionado) {
                document.getElementById('select-tipo-programa').value = tipoPreseleccionado;
            }
        } else {
            idEnEdicion = id;
            tituloModal.textContent = 'Editar Registro';
            var p = programas.find(function(x) { return x.id === id; });
            document.getElementById('input-nombre-programa').value = p.nombre;
            document.getElementById('input-descripcion-programa').value = p.descripcion;
            document.getElementById('input-responsable-programa').value = p.responsable;
            document.getElementById('select-tipo-programa').value = p.tipo;
            document.getElementById('select-estado-programa').value = p.estado;
            document.getElementById('input-fecha-inicio-programa').value = p.fechaInicio;
        }
        modalPrograma.removeAttribute('hidden');
        document.getElementById('input-nombre-programa').focus();
        tipoPreseleccionado = '';
    }

    function cerrarModal() {
        modalPrograma.setAttribute('hidden', '');
        limpiarErrores();
        formularioPrograma.reset();
        idEnEdicion = null;
    }

    /* validaciones */
    function manejarEnvio(e) {
        e.preventDefault();
        limpiarErrores();

        var nombre = document.getElementById('input-nombre-programa').value.trim();
        var descripcion = document.getElementById('input-descripcion-programa').value.trim();
        var responsable = document.getElementById('input-responsable-programa').value.trim();
        var tipo = document.getElementById('select-tipo-programa').value;
        var estado = document.getElementById('select-estado-programa').value;
        var fechaInicio = document.getElementById('input-fecha-inicio-programa').value;

        var errores = [];

        if (!nombre || nombre.length < 3) {
            errores.push({ campo: 'nombreProg', msg: 'El nombre es requerido (mínimo 3 caracteres).' });
        }
        if (!descripcion || descripcion.length < 10) {
            errores.push({ campo: 'descripcionProg', msg: 'La descripción debe tener al menos 10 caracteres.' });
        }
        if (!responsable || responsable.length < 3) {
            errores.push({ campo: 'responsableProg', msg: 'El responsable es requerido.' });
        }
        if (!tipo) {
            errores.push({ campo: 'tipoProg', msg: 'Seleccione un tipo.' });
        }
        if (!estado) {
            errores.push({ campo: 'estadoProg', msg: 'Seleccione un estado.' });
        }
        if (!fechaInicio) {
            errores.push({ campo: 'fechaInicioProg', msg: 'Seleccione una fecha de inicio.' });
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

        if (idEnEdicion === null) {
            programas.push({
                id: contadorId++,
                tipo: tipo,
                nombre: nombre,
                descripcion: descripcion,
                responsable: responsable,
                estado: estado,
                fechaInicio: fechaInicio
            });
            mostrarNotificacion('Registro creado exitosamente.', 'exito');
        } else {
            var p = programas.find(function(x) { return x.id === idEnEdicion; });
            p.nombre = nombre;
            p.descripcion = descripcion;
            p.responsable = responsable;
            p.tipo = tipo;
            p.estado = estado;
            p.fechaInicio = fechaInicio;
            mostrarNotificacion('Registro actualizado exitosamente.', 'exito');
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

    /* ========== ELIMINAR ========== */
    function manejarClickListado(e) {
        var btn = e.target.closest('[data-accion]');
        if (!btn) return;
        var tarjeta = btn.closest('.tarjeta-programa');
        var id = parseInt(tarjeta.dataset.id, 10);

        if (btn.dataset.accion === 'editar') {
            abrirModal('editar', id);
        } else if (btn.dataset.accion === 'eliminar') {
            idPendienteEliminar = id;
            var p = programas.find(function(x) { return x.id === id; });
            textoConfirmacion.textContent = '¿Está seguro de eliminar "' + p.nombre + '"?';
            modalConfirmacion.removeAttribute('hidden');
        }
    }

    function confirmarEliminacion() {
        programas = programas.filter(function(p) { return p.id !== idPendienteEliminar; });
        cerrarModalConfirmacion();
        renderizarLista();
        mostrarNotificacion('Registro eliminado.', 'exito');
    }

    function cerrarModalConfirmacion() {
        modalConfirmacion.setAttribute('hidden', '');
        idPendienteEliminar = null;
    }

    /* ========== NOTIFICACIONES ========== */
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

    /* ========== UTILIDADES ========== */
    function escaparHTML(texto) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(texto));
        return div.innerHTML;
    }

})();