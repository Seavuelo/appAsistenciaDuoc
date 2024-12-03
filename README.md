# appAsistencia

AsistenciaApp es una aplicación móvil desarrollada en Ionic Angular diseñada para optimizar la gestión de asistencia en establecimientos educacionales. La aplicación ofrece herramientas intuitivas para profesores y alumnos, simplificando el registro, monitoreo y confirmación de asistencia mediante tecnologías como Firebase y LocalStorage de Ionic.

Características
Registro e Inicio de Sesión

Autenticación mediante correo electrónico y contraseña utilizando Firebase Authentication.
Inicio de sesión local con LocalStorage para garantizar acceso offline tras la autenticación inicial.
Gestión de Roles

Profesor: Acceso a herramientas administrativas, como creación, edición y eliminación de asignaturas y clases.
Alumno: Acceso a información personalizada, como asignaturas inscritas, porcentajes de asistencia y confirmación de asistencia en tiempo real.
Funciones para Alumnos

Visualización y selección de asignaturas disponibles.
Consulta de porcentaje de asistencia e información asociada a cada asignatura.
Confirmación de asistencia mediante escaneo de códigos QR.
Verificación automática de ubicación para confirmar la presencia dentro del establecimiento.
Actualización instantánea del estado de asistencia en la base de datos.
Funciones para Profesores

Creación, edición y eliminación de asignaturas.
Gestión de alumnos inscritos y profesores asignados a cada asignatura.
Generación de códigos QR únicos para cada clase, facilitando la confirmación de asistencia.
Visualización de clases impartidas, incluyendo:
Listado de alumnos presentes.
Registro de profesores responsables.
Fecha y hora de las clases.
Eliminación de clases según sea necesario.
Tecnologías Utilizadas
Ionic Angular: Framework híbrido para el desarrollo multiplataforma.
Firebase: Manejo de autenticación y sincronización en tiempo real.
LocalStorage de Ionic: Almacenamiento seguro de datos de usuario para acceso sin conexión.
Capacitor Geolocation: Verificación de ubicación para confirmación de asistencia mediante GPS.
AsistenciaApp mejora la experiencia educativa al digitalizar y automatizar procesos clave de asistencia, garantizando confiabilidad y accesibilidad para alumnos y profesores.
