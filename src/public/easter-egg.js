// ========================================
// EASTER EGG TEMPORAL - ELIMINAR EN PRODUCCIÓN
// ========================================
// Este archivo contiene el easter egg de Hatsune Miku
// Para eliminar: borrar este archivo y la línea de script en index.html

class EasterEgg {
    constructor() {
        this.sequence = [];
        this.targetSequence = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        this.isActive = false;
        this.timeout = null;
        
        this.init();
    }
    
    init() {
        console.log('🎵 Easter Egg inicializado - Secuencia: ↑↓←→');
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleKeyPress(e) {
        // Solo procesar flechas direccionales
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            return;
        }
        
        // Agregar tecla a la secuencia
        this.sequence.push(e.code);
        
        // Limpiar timeout anterior
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        
        // Verificar si la secuencia coincide
        if (this.checkSequence()) {
            this.triggerEasterEgg();
            this.sequence = [];
        } else {
            // Resetear secuencia después de 2 segundos de inactividad
            this.timeout = setTimeout(() => {
                this.sequence = [];
            }, 2000);
        }
    }
    
    checkSequence() {
        if (this.sequence.length !== this.targetSequence.length) {
            return false;
        }
        
        return this.sequence.every((key, index) => key === this.targetSequence[index]);
    }
    
    triggerEasterEgg() {
        if (this.isActive) return;
        
        this.isActive = true;
        console.log('🎵 ¡Easter Egg activado!');
        
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.id = 'easter-egg-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.5s ease-in;
        `;
        
        // Crear contenedor del contenido
        const content = document.createElement('div');
        content.style.cssText = `
            text-align: center;
            color: white;
            max-width: 80%;
            animation: slideIn 0.8s ease-out;
        `;
        
        // Crear imagen de Hatsune Miku
        const image = document.createElement('img');
        image.src = 'telepathy-hatsune-miku.gif';
        image.alt = 'Hatsune Miku';
        image.style.cssText = `
            max-width: 300px;
            max-height: 300px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(255, 255, 255, 0.3);
            margin-bottom: 20px;
            animation: bounce 2s infinite;
        `;
        
        // Crear mensaje de agradecimiento
        const message = document.createElement('div');
        message.innerHTML = `
            <h2 style="color: #00ff88; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                🎵 Agradecimientos Especiales 🎵
            </h2>
            <p style="font-size: 18px; line-height: 1.6; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                A <strong>Jaime</strong>, <strong>Samu</strong> y <strong>Pablo V</strong><br>
                por su colaboración y asistencia
            </p>
            <p style="font-size: 14px; margin-top: 20px; opacity: 0.8;">
                Presiona cualquier tecla o haz clic para cerrar
            </p>
        `;
        
        // Agregar elementos
        content.appendChild(image);
        content.appendChild(message);
        overlay.appendChild(content);
        
        // Agregar estilos CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { 
                    transform: translateY(-50px);
                    opacity: 0;
                }
                to { 
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-10px);
                }
                60% {
                    transform: translateY(-5px);
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        
        // Event listeners para cerrar
        const closeEasterEgg = () => {
            overlay.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                document.body.removeChild(overlay);
                document.head.removeChild(style);
                this.isActive = false;
            }, 500);
        };
        
        overlay.addEventListener('click', closeEasterEgg);
        document.addEventListener('keydown', closeEasterEgg, { once: true });
        
        // Agregar animación de salida
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(fadeOutStyle);
    }
}

// Inicializar easter egg cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new EasterEgg();
    });
} else {
    new EasterEgg();
}
