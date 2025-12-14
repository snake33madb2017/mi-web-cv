// script.js

// Esperamos a que el documento se cargue completamente
document.addEventListener('DOMContentLoaded', () => {
    console.log("¡La web está cargada y lista!");

    // Efecto suave al hacer scroll (opcional ya que CSS scroll-behavior hace la mayor parte)
    // Aquí podemos añadir lógica futura
    
    // Animación de aparición simple al hacer scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));
});
