document.addEventListener("DOMContentLoaded", function () {
    var notification = document.getElementById('notification');
    // Mostrar el div de notificación al cargar la página
    notification.style.visibility = 'visible';
    // Ocultar la notificación y eliminarla después de 3 segundos
    setTimeout(function () {
      notification.classList.add('desvanecer');
      setTimeout(function () {
        notification.remove();
      }, 800); // Cambia 500 por el tiempo en milisegundos de la animación
    }, 5000); // Cambia 3000 por el tiempo en milisegundos que desees mostrar la notificación
  });