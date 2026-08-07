(function () {
  'use strict';

  /* ESTADO DE LA APLICACIÓN (simulación de "base de datos")
  */
  let planesPEI = [
    { id: 1, estudiante: 'Sebastián Morales', tituloPlan: 'Cocina adaptada', categoria: 'Habilidades para la vida', estado: 'activo', objetivosCompletados: 2, objetivosTotales: 4, fechaInicio: '2026-03-01', fechaRevision: '2026-06-30', descripcion: 'Desarrollo de habilidades culinarias básicas con adaptaciones sensoriales para la preparación de alimentos simples.' },
    { id: 2, estudiante: 'Valentina Cruz', tituloPlan: 'Cocina adaptada', categoria: 'Habilidades para la vida', estado: 'activo', objetivosCompletados: 1, objetivosTotales: 3, fechaInicio: '2026-02-10', fechaRevision: '2026-07-15', descripcion: 'Introducción a la preparación de alimentos con apoyo visual y adaptaciones para motricidad fina.' },
    { id: 3, estudiante: 'Diego Ramirez', tituloPlan: 'Higiene y autocuidado avanzado', categoria: 'Autonomía personal', estado: 'activo', objetivosCompletados: 4, objetivosTotales: 5, fechaInicio: '2026-01-20', fechaRevision: '2026-05-20', descripcion: 'Fortalecimiento de rutinas de higiene personal y autocuidado con mayor nivel de independencia.' },
    { id: 4, estudiante: 'Andres Fuentes', tituloPlan: 'Manejo del dinero', categoria: 'Habilidades para la vida', estado: 'activo', objetivosCompletados: 2, objetivosTotales: 4, fechaInicio: '2026-02-01', fechaRevision: '2026-06-01', descripcion: 'Reconocimiento de monedas y billetes, y práctica de compras simples con apoyo.' },
    { id: 5, estudiante: 'Lucía Mendoza', tituloPlan: 'Uso del transporte público', categoria: 'Autonomía personal', estado: 'pausado', objetivosCompletados: 4, objetivosTotales: 6, fechaInicio: '2025-11-05', fechaRevision: '2026-04-05', descripcion: 'Entrenamiento en rutas y señalización para el uso independiente del transporte público.' },
    { id: 6, estudiante: 'Nicolas Orozco', tituloPlan: 'Rutinas escolares básicas', categoria: 'Autonomía personal', estado: 'completado', objetivosCompletados: 3, objetivosTotales: 3, fechaInicio: '2025-08-01', fechaRevision: '2026-01-15', descripcion: 'Consolidación de rutinas de organización y seguimiento de horario escolar.' }
  ];

  let contadorId = 7;
  let filtroEstadoActual = 'todos';
  let textoBusquedaActual = '';
  let idPlanEnEdicion = null;
  let idPlanPendienteEliminar = null;

  const NOMBRES_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  const MAPA_ID_CAMPOS = {
    nombreEstudiante: 'input-nombre-estudiante',
    tituloPlan: 'input-titulo-plan',
    categoria: 'select-categoria-pei',
    estado: 'select-estado-pei',
    fechaInicio: 'input-fecha-inicio',
    fechaRevision: 'input-fecha-revision',
    objetivosTotales: 'input-objetivos-totales',
    objetivosCompletados: 'input-objetivos-completados',
    descripcion: 'input-descripcion-pei'
  };

  /* REFERENCIAS AL DOM */
  let contenedorListado, entradaBusqueda, botonesFiltro, estadisticaResumen, botonNuevoPEI;
  let modalPEI, formularioPEI, tituloModalPEI, botonCerrarModal, botonCancelarModal;
  let modalConfirmacion, botonConfirmarEliminar, botonCancelarEliminar, textoConfirmacionEliminar;
  let contenedorNotificaciones;

  document.addEventListener('DOMContentLoaded', inicializar);

  function inicializar() {
    contenedorListado = document.getElementById('contenedor-listado-planes');
    entradaBusqueda = document.getElementById('entrada-busqueda-estudiante-plan');
    botonesFiltro = document.querySelectorAll('.boton-filtro-estado-pei');
    estadisticaResumen = document.getElementById('estadistica-resumen-planes');
    botonNuevoPEI = document.getElementById('boton-abrir-nuevo-pei');

    modalPEI = document.getElementById('modal-pei');
    formularioPEI = document.getElementById('formulario-pei');
    tituloModalPEI = document.getElementById('titulo-modal-pei');
    botonCerrarModal = document.getElementById('boton-cerrar-modal-pei');
    botonCancelarModal = document.getElementById('boton-cancelar-formulario-pei');

    modalConfirmacion = document.getElementById('modal-confirmacion-eliminar');
    botonConfirmarEliminar = document.getElementById('boton-confirmar-eliminar');
    botonCancelarEliminar = document.getElementById('boton-cancelar-eliminar');
    textoConfirmacionEliminar = document.getElementById('texto-confirmacion-eliminar');

    contenedorNotificaciones = document.getElementById('contenedor-notificaciones');

    renderizarListaPlanes();

    entradaBusqueda.addEventListener('input', manejarBusqueda);
    botonesFiltro.forEach(function (boton) {
      boton.addEventListener('click', manejarClickFiltro);
    });

    botonNuevoPEI.addEventListener('click', function () { abrirModalPEI('crear', null); });
    botonCerrarModal.addEventListener('click', cerrarModalPEI);
    botonCancelarModal.addEventListener('click', cerrarModalPEI);
    formularioPEI.addEventListener('submit', manejarEnvioFormulario);
    contenedorListado.addEventListener('click', manejarClickListado);

    botonCancelarEliminar.addEventListener('click', cerrarModalConfirmacion);
    botonConfirmarEliminar.addEventListener('click', confirmarEliminacionPlan);

    modalPEI.addEventListener('click', function (evento) {
      if (evento.target === modalPEI) cerrarModalPEI();
    });
    modalConfirmacion.addEventListener('click', function (evento) {
      if (evento.target === modalConfirmacion) cerrarModalConfirmacion();
    });
    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape') {
        cerrarModalPEI();
        cerrarModalConfirmacion();
      }
    });

    const parametrosURL = new URLSearchParams(window.location.search);
    if (parametrosURL.get('nuevo') === 'true') {
      abrirModalPEI('crear', null);
    }
  }

  /* BÚSQUEDA Y FILTROS */
  function manejarBusqueda(evento) {
    textoBusquedaActual = evento.target.value.trim().toLowerCase();
    renderizarListaPlanes();
  }

  function manejarClickFiltro(evento) {
    const boton = evento.currentTarget;
    botonesFiltro.forEach(function (b) {
      b.classList.remove('filtro-seleccionado-activo');
      b.setAttribute('aria-pressed', 'false');
    });
    boton.classList.add('filtro-seleccionado-activo');
    boton.setAttribute('aria-pressed', 'true');
    filtroEstadoActual = boton.dataset.filtro;
    renderizarListaPlanes();
  }

  /* RENDERIZADO (manipulación del DOM)*/
  function renderizarListaPlanes() {
    const planesFiltrados = planesPEI.filter(function (plan) {
      const coincideEstado = filtroEstadoActual === 'todos' || plan.estado === filtroEstadoActual;
      const textoCompleto = (plan.estudiante + ' ' + plan.tituloPlan).toLowerCase();
      const coincideBusqueda = textoCompleto.includes(textoBusquedaActual);
      return coincideEstado && coincideBusqueda;
    });

    if (planesFiltrados.length === 0) {
      contenedorListado.innerHTML = '<p class="mensaje-lista-vacia">No se encontraron planes PEI con los filtros aplicados.</p>';
    } else {
      contenedorListado.innerHTML = planesFiltrados.map(crearTarjetaHTML).join('');
    }

    actualizarEstadisticaResumen();
  }

  function crearTarjetaHTML(plan) {
    const porcentaje = Math.round((plan.objetivosCompletados / plan.objetivosTotales) * 100);
    const nivel = obtenerNivelProgreso(porcentaje, plan.estado);
    const etiqueta = obtenerEtiquetaEstado(plan.estado);
    const nombreSeguro = escaparHTML(plan.estudiante);
    const tituloSeguro = escaparHTML(plan.tituloPlan);

    return (
      '<details class="tarjeta-plan-pei-individual" data-id="' + plan.id + '">' +
        '<summary class="encabezado-resumen-plan-pei">' +
          '<div class="avatar-iniciales-circular avatar-iniciales-pequeno" aria-hidden="true">' + obtenerIniciales(plan.estudiante) + '</div>' +
          '<div class="detalle-nombre-y-estudiante-pei">' +
            '<p class="nombre-plan-pei-titulo">' + tituloSeguro +
              ' <span class="etiqueta-estado-plan-pei ' + etiqueta.clase + '">' + etiqueta.texto + '</span>' +
            '</p>' +
            '<p class="nombre-estudiante-y-categoria-pei">' + nombreSeguro + ' · ' + escaparHTML(plan.categoria) + '</p>' +
          '</div>' +
          '<div class="resumen-progreso-plan-pei">' +
            '<p class="porcentaje-avance-plan-pei">' + porcentaje + '%</p>' +
            '<div class="pista-barra-progreso-pei" role="progressbar" aria-valuenow="' + porcentaje + '" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso del plan ' + tituloSeguro + ' de ' + nombreSeguro + '">' +
              '<div class="relleno-barra-progreso-pei ' + nivel + '" style="width: ' + porcentaje + '%;"></div>' +
            '</div>' +
            '<p class="contador-objetivos-plan-pei">' + plan.objetivosCompletados + ' / ' + plan.objetivosTotales + ' objetivos</p>' +
          '</div>' +
          '<svg class="icono-flecha-expandir-plan" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 15l6-6 6 6"/></svg>' +
        '</summary>' +
        '<div class="contenido-detalle-plan-pei">' +
          '<p class="descripcion-completa-plan-pei">' + escaparHTML(plan.descripcion) + '</p>' +
          '<div class="cuadricula-datos-clave-plan-pei">' +
            '<div class="tarjeta-dato-clave-plan-pei"><p class="etiqueta-dato-clave-plan-pei">Inicio</p><p class="valor-dato-clave-plan-pei">' + formatearFecha(plan.fechaInicio) + '</p></div>' +
            '<div class="tarjeta-dato-clave-plan-pei"><p class="etiqueta-dato-clave-plan-pei">Revisión</p><p class="valor-dato-clave-plan-pei">' + formatearFecha(plan.fechaRevision) + '</p></div>' +
            '<div class="tarjeta-dato-clave-plan-pei"><p class="etiqueta-dato-clave-plan-pei">Objetivos</p><p class="valor-dato-clave-plan-pei">' + plan.objetivosCompletados + '/' + plan.objetivosTotales + '</p></div>' +
            '<div class="tarjeta-dato-clave-plan-pei"><p class="etiqueta-dato-clave-plan-pei">Progreso</p><p class="valor-dato-clave-plan-pei">' + porcentaje + '%</p></div>' +
          '</div>' +
          '<div class="grupo-acciones-plan-pei">' +
            '<button type="button" class="boton-editar-plan-pei" data-id="' + plan.id + '">Editar PEI</button>' +
            '<button type="button" class="boton-eliminar-plan-pei" data-id="' + plan.id + '">Eliminar</button>' +
          '</div>' +
        '</div>' +
      '</details>'
    );
  }

  function actualizarEstadisticaResumen() {
    const activos = planesPEI.filter(function (p) { return p.estado === 'activo'; }).length;
    estadisticaResumen.textContent = activos + ' activos · ' + planesPEI.length + ' total';
  }

  /* ACCIONES SOBRE LA LISTA (editar / eliminar) — delegación de eventos */
  function manejarClickListado(evento) {
    const botonEditar = evento.target.closest('.boton-editar-plan-pei');
    if (botonEditar) {
      abrirModalPEI('editar', Number(botonEditar.dataset.id));
      return;
    }
    const botonEliminar = evento.target.closest('.boton-eliminar-plan-pei');
    if (botonEliminar) {
      abrirModalConfirmacion(Number(botonEliminar.dataset.id));
    }
  }

  /* MODAL CREAR / EDITAR */
  function abrirModalPEI(modo, idPlan) {
    formularioPEI.reset();
    limpiarErroresFormulario();
    idPlanEnEdicion = null;

    if (modo === 'editar') {
      const plan = planesPEI.find(function (p) { return p.id === idPlan; });
      if (!plan) return;
      idPlanEnEdicion = plan.id;
      tituloModalPEI.textContent = 'Editar PEI';
      document.getElementById('input-nombre-estudiante').value = plan.estudiante;
      document.getElementById('input-titulo-plan').value = plan.tituloPlan;
      document.getElementById('select-categoria-pei').value = plan.categoria;
      document.getElementById('select-estado-pei').value = plan.estado;
      document.getElementById('input-fecha-inicio').value = plan.fechaInicio;
      document.getElementById('input-fecha-revision').value = plan.fechaRevision;
      document.getElementById('input-objetivos-totales').value = plan.objetivosTotales;
      document.getElementById('input-objetivos-completados').value = plan.objetivosCompletados;
      document.getElementById('input-descripcion-pei').value = plan.descripcion;
    } else {
      tituloModalPEI.textContent = 'Nuevo PEI';
    }

    modalPEI.hidden = false;
    document.getElementById('input-nombre-estudiante').focus();
  }

  function cerrarModalPEI() {
    modalPEI.hidden = true;
    idPlanEnEdicion = null;
  }

  function manejarEnvioFormulario(evento) {
    evento.preventDefault();

    const datos = {
      nombreEstudiante: document.getElementById('input-nombre-estudiante').value,
      tituloPlan: document.getElementById('input-titulo-plan').value,
      categoria: document.getElementById('select-categoria-pei').value,
      estado: document.getElementById('select-estado-pei').value,
      fechaInicio: document.getElementById('input-fecha-inicio').value,
      fechaRevision: document.getElementById('input-fecha-revision').value,
      objetivosTotales: document.getElementById('input-objetivos-totales').value,
      objetivosCompletados: document.getElementById('input-objetivos-completados').value,
      descripcion: document.getElementById('input-descripcion-pei').value
    };

    const errores = validarFormulario(datos);
    limpiarErroresFormulario();

    if (Object.keys(errores).length > 0) {
      Object.keys(errores).forEach(function (campo) {
        mostrarError(campo, errores[campo]);
      });
      mostrarNotificacion('Revisa los campos marcados en rojo.', 'error');
      return;
    }

    const planProcesado = {
      estudiante: datos.nombreEstudiante.trim(),
      tituloPlan: datos.tituloPlan.trim(),
      categoria: datos.categoria,
      estado: datos.estado,
      fechaInicio: datos.fechaInicio,
      fechaRevision: datos.fechaRevision,
      objetivosTotales: Number(datos.objetivosTotales),
      objetivosCompletados: Number(datos.objetivosCompletados),
      descripcion: datos.descripcion.trim()
    };

    if (idPlanEnEdicion === null) {
      planProcesado.id = contadorId++;
      planesPEI.push(planProcesado);
      mostrarNotificacion('Plan PEI creado correctamente.', 'exito');
    } else {
      const indice = planesPEI.findIndex(function (p) { return p.id === idPlanEnEdicion; });
      if (indice !== -1) {
        planProcesado.id = idPlanEnEdicion;
        planesPEI[indice] = planProcesado;
      }
      mostrarNotificacion('Plan PEI actualizado correctamente.', 'exito');
    }

    cerrarModalPEI();
    renderizarListaPlanes();
  }

  /* VALIDACIÓN DEL FORMULARIO */
  function validarFormulario(datos) {
    const errores = {};

    if (!datos.nombreEstudiante || datos.nombreEstudiante.trim().length < 3) {
      errores.nombreEstudiante = 'Ingresa un nombre válido (mínimo 3 caracteres).';
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(datos.nombreEstudiante.trim())) {
      errores.nombreEstudiante = 'El nombre solo puede contener letras y espacios.';
    }

    if (!datos.tituloPlan || datos.tituloPlan.trim().length < 3) {
      errores.tituloPlan = 'El título del plan debe tener al menos 3 caracteres.';
    }

    if (!datos.categoria) {
      errores.categoria = 'Selecciona una categoría.';
    }

    if (!datos.estado) {
      errores.estado = 'Selecciona un estado.';
    }

    if (!datos.fechaInicio) {
      errores.fechaInicio = 'La fecha de inicio es obligatoria.';
    }

    if (!datos.fechaRevision) {
      errores.fechaRevision = 'La fecha de revisión es obligatoria.';
    } else if (datos.fechaInicio && datos.fechaRevision < datos.fechaInicio) {
      errores.fechaRevision = 'La fecha de revisión no puede ser anterior al inicio.';
    }

    const totales = Number(datos.objetivosTotales);
    if (!datos.objetivosTotales || !Number.isInteger(totales) || totales <= 0 || totales > 20) {
      errores.objetivosTotales = 'Ingresa un número entero entre 1 y 20.';
    }

    const completados = Number(datos.objetivosCompletados);
    if (datos.objetivosCompletados === '' || !Number.isInteger(completados) || completados < 0) {
      errores.objetivosCompletados = 'Ingresa un número entero igual o mayor a 0.';
    } else if (!errores.objetivosTotales && completados > totales) {
      errores.objetivosCompletados = 'No puede ser mayor al total de objetivos.';
    }

    if (!datos.descripcion || datos.descripcion.trim().length < 10) {
      errores.descripcion = 'Describe el plan con al menos 10 caracteres.';
    }

    return errores;
  }

  function mostrarError(campo, mensaje) {
    const span = document.querySelector('[data-error-de="' + campo + '"]');
    if (span) span.textContent = mensaje;
    const input = document.getElementById(MAPA_ID_CAMPOS[campo]);
    if (input) input.setAttribute('aria-invalid', 'true');
  }

  function limpiarErroresFormulario() {
    document.querySelectorAll('.mensaje-error-campo').forEach(function (span) {
      span.textContent = '';
    });
    document.querySelectorAll('[aria-invalid]').forEach(function (el) {
      el.removeAttribute('aria-invalid');
    });
  }

  /* MODAL DE CONFIRMACIÓN PARA ELIMINAR */
  function abrirModalConfirmacion(id) {
    const plan = planesPEI.find(function (p) { return p.id === id; });
    if (!plan) return;
    idPlanPendienteEliminar = id;
    textoConfirmacionEliminar.textContent = '¿Deseas eliminar el plan "' + plan.tituloPlan + '" de ' + plan.estudiante + '? Esta acción no se puede deshacer.';
    modalConfirmacion.hidden = false;
  }

  function cerrarModalConfirmacion() {
    modalConfirmacion.hidden = true;
    idPlanPendienteEliminar = null;
  }

  function confirmarEliminacionPlan() {
    planesPEI = planesPEI.filter(function (p) { return p.id !== idPlanPendienteEliminar; });
    cerrarModalConfirmacion();
    renderizarListaPlanes();
    mostrarNotificacion('Plan PEI eliminado.', 'exito');
  }

  /* UTILIDADES */
  function obtenerNivelProgreso(porcentaje, estado) {
    if (estado === 'completado' || porcentaje >= 100) return 'nivel-completado';
    if (porcentaje >= 60) return 'nivel-alto';
    return 'nivel-medio';
  }

  function obtenerEtiquetaEstado(estado) {
    const mapa = {
      activo: { clase: 'estado-activo', texto: 'Activo' },
      pausado: { clase: 'estado-pausado', texto: 'Pausado' },
      completado: { clase: 'estado-completado', texto: 'Completado' }
    };
    return mapa[estado] || mapa.activo;
  }

  function obtenerIniciales(nombre) {
    return nombre.trim().split(/\s+/).slice(0, 2).map(function (palabra) {
      return palabra[0].toUpperCase();
    }).join('');
  }

  function formatearFecha(fechaISO) {
    const partes = fechaISO.split('-').map(Number);
    const anio = partes[0], mes = partes[1], dia = partes[2];
    return String(dia).padStart(2, '0') + ' ' + NOMBRES_MESES[mes - 1] + ' ' + anio;
  }

  function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  function mostrarNotificacion(mensaje, tipo) {
    const toast = document.createElement('div');
    toast.className = 'notificacion-toast ' + tipo;
    toast.textContent = mensaje;
    contenedorNotificaciones.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3500);
  }

})();