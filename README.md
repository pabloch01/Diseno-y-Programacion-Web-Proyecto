Nombre del proyecto:
Hellen Keller

Integrantes: 
Miguel Angel Bravo Malavasi - Designer y Developer

Katherine Paola Calderon Quesada - Designer y Developer

Pablo Andres Chinchilla Moya - Designer y Developer

Descripcion del proyecto y alcance: El Centro Nacional de Educación Hellen Keller requiere el desarrollo de un sistemav informático para la gestión académica y administrativa, con el objetivo de centralizar y optimizar los procesos educativos especializados que ofrece la institución. Este sistema contará con diversos tipos de usuarios, cada uno con distintos niveles de acceso y funcionalidades dentro de la plataforma. Se creará un wireframe que ilustre la visión del prototipo a trabajar en la etapa de desarrollo.

Estrategia de trabajar: Al comenzar el desarrollo del proyecto utilizando como base los wireframes creados, se pretende separar las funcionalidades de la pagina en branches nombradas tras los usuarios de la pagina, esto con el fin de garantizar un trabajo ordenado y sin conflictos. Se realizarán commits una vez se logre completar la funcionalidad de por lo menos una de las secciones de los distintos branches. Una vez los branches para todos los usuarios se encuentren en su versión final, se publicará la versión completa de la pagina en el apartado main del repositorio.

Instrucciones para abrir y ejecutar el proyecto: Se debe descargar la carpeta comprimida titulada "Producto final" la cual se encuentra en el apartado main del repositorio. Una vez se cuenta con la carpeta descargada, será necesario descomprimirla (extraerla) para abrirla y acceder al archivo HTML llamado "Gestión Integral - Hellen Keller", el cual cumple la función de mostrar la pantalla de inicio de sesión de la página, comenzando así el flujo de navegación

Funcionalidades implementadas:\
├── Manejo de eventos y DOM (Click, submit, input/change. Crear/editar/eliminar elementos)\
├── Formularios con validación (Campos requeridos, formatos (correo, contraseñas, números), mensajes de error/éxito.)\
├── Login simulado (rol/usuario)\
├── CRUD simulado (crear y listar; editar o eliminar)\
└── Búsqueda/filtro de listas

Estructura de archivos JS: Cada pantalla tiene su propio archivo JS con la lógica que le corresponde. El módulo de Login además usa un archivo de utilidades compartido para evitar duplicar las validaciones en cada pantalla.

Producto Final/Front End Hellen Keller/js/\
├── validaciones-login.js   → compartido por las 6 pantallas con formulario\
│                             (validacion de correo/contraseña, notificaciones,\
│                             mensajes de error)\
├── registro.js             → registro.html\
├── identificarse.js        → identificarse.html\
├── tipo-usuario.js         → tipo-usuario.html\
├── actualizar-contrasena.js → actualizar-contrasena.html\
├── restablecer-contrasena.js → restablecer-contrasena.html\
├── restablecer-nueva.js     → restablecer-nueva.html\
├── gest-prog.js        → gest-prog.html   (CRUD de programas educativos)\
├── gest-users.js       → gest-users.html  (CRUD de usuarios)\
└── planes_pei.js        → planes_pei.html  (gestión de PEIs)\
