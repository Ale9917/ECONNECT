// Variables globales
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let usuarioActual = JSON.parse(localStorage.getItem('usuario_actual')) || null;

// Funciones de navegación
function volverInicio() {
    ocultarTodasLasSecciones();
    document.querySelector('.intro-section').style.display = 'block';
    document.getElementById("auth-nav").style.display = "flex";
    document.getElementById("main-nav").style.display = "none";
    document.getElementById("mobile-nav").style.display = "none";
}

function mostrarFormularioLogin() {
    ocultarTodasLasSecciones();
    document.getElementById('login').style.display = 'block';
}

function mostrarFormularioRegistro() {
    ocultarTodasLasSecciones();
    document.getElementById('registro').style.display = 'block';
}

function mostrarFormularioRecuperacionClave() {
    alert("Por favor, contacta al soporte técnico para recuperar tu contraseña.");
    // Aquí se podría implementar una lógica más compleja para mostrar un formulario de recuperación real.
}

function ocultarTodasLasSecciones() {
    const secciones = [
        '.intro-section',
        '#login',
        '#registro',
        '#app'
    ];
    secciones.forEach(seccion => {
        document.querySelector(seccion).style.display = 'none';
    });
}

// Función para renderizar la interfaz de la aplicación según el estado de la sesión
function renderAppUI() {
    if (usuarioActual) {
        // Usuario logueado: ocultar auth, mostrar app y navegación
        document.querySelector('.intro-section').style.display = 'none';
        document.getElementById("registro").style.display = "none";
        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "block";
        document.getElementById("auth-nav").style.display = "none";
        document.getElementById("main-nav").style.display = "flex";
        if (window.innerWidth <= 768) {
            document.getElementById("mobile-nav").style.display = "flex";
        } else {
            document.getElementById("mobile-nav").style.display = "none";
        }
        mostrarSeccion('progreso'); // Mostrar sección de progreso por defecto
        actualizarDatosUsuario(); // Actualizar datos en el dashboard
    } else {
        // No hay usuario logueado: mostrar intro y formularios de auth
        document.querySelector('.intro-section').style.display = 'block';
        document.getElementById("auth-nav").style.display = "flex";
        document.getElementById("registro").style.display = "none";
        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "none";
        document.getElementById("main-nav").style.display = "none";
        document.getElementById("mobile-nav").style.display = "none";
    }
}

// Funciones de autenticación
function crearUsuario() {
    const correo = document.getElementById('correo').value;
    const nombre = document.getElementById('nombre').value;
    const matricula = document.getElementById('matricula').value;
    const materia = document.getElementById('materia').value;
    const semestre = document.getElementById('semestre').value;
    const grupo = document.getElementById('grupo').value;
    const clave = document.getElementById('clave').value;
    const mensaje = document.getElementById('emailValidationMessage');

    if (!validarCorreoInstitucional(correo)) {
        mensaje.textContent = 'Solo se permiten correos institucionales (@cecyteqroo.edu.mx o @cancun.tecnm.mx)';
        mensaje.style.display = 'block';
        document.getElementById('correo').style.borderColor = '#dc2626';
        return;
    }

    // Verificar si el correo ya está registrado
    if (usuarios.some(u => u.correo === correo)) {
        mensaje.textContent = 'Este correo ya está registrado';
        mensaje.style.display = 'block';
        return;
    }

    // Crear nuevo usuario
    const nuevoUsuario = {
        correo,
        nombre,
        matricula,
        materia,
        semestre,
        grupo,
        clave,
        puntos: 0,
        nivel: 1,
        insignias: [],
        desafiosCompletados: [],
        fechaRegistro: new Date().toISOString()
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Iniciar sesión automáticamente
    iniciarSesionConUsuario(nuevoUsuario);
}

function iniciarSesion() {
    const correo = document.getElementById('correoLogin').value;
    const matricula = document.getElementById('matriculaLogin').value;
    const clave = document.getElementById('claveLogin').value;

    let usuario = null;

    // Buscar usuario por correo o matrícula
    if (correo) {
        usuario = usuarios.find(u => u.correo === correo && u.clave === clave);
    } else if (matricula) {
        usuario = usuarios.find(u => u.matricula === matricula && u.clave === clave);
    }

    if (usuario) {
        iniciarSesionConUsuario(usuario);
    } else {
        alert('Credenciales inválidas');
    }
}

function iniciarSesionConUsuario(usuario) {
    usuarioActual = usuario;
    localStorage.setItem('usuario_actual', JSON.stringify(usuario));
    
    // Renderizar la interfaz después de iniciar sesión
    renderAppUI();
    // Aquí puedes cargar el estado de los desafíos si es necesario
    // cargarEstadoDesafios(usuario); 
}

function cerrarSesion() {
    usuarioActual = null;
    localStorage.removeItem('usuario_actual');
    
    // Renderizar la interfaz después de cerrar sesión
    renderAppUI();
}

// Funciones de navegación del dashboard
function mostrarSeccion(seccion) {
    const secciones = ['progreso', 'desafios', 'recompensas', 'videos'];
    secciones.forEach(s => {
        document.getElementById(s).style.display = s === seccion ? 'block' : 'none';
    });
}

// Funciones de actualización de datos
function actualizarDatosUsuario() {
    if (!usuarioActual) return;

    // Actualizar nivel y puntos
    document.getElementById('nivel-badge').textContent = `Nivel ${usuarioActual.nivel}`;
    // Verificar si el elemento user-credits existe antes de intentar actualizarlo
    const userCreditsElement = document.getElementById('user-credits');
    if (userCreditsElement) {
        userCreditsElement.textContent = usuarioActual.puntos;
    }
    
    // Actualizar barra de progreso
    const progreso = (usuarioActual.puntos % 100) / 100 * 100;
    document.querySelector('.progress-fill').style.width = `${progreso}%`;
    
    // Actualizar estadísticas
    document.getElementById('nivel-perfil').textContent = usuarioActual.nivel;
    document.getElementById('puntos-perfil').textContent = usuarioActual.puntos;
    document.getElementById('insignias-perfil').textContent = usuarioActual.insignias.length;
}

// Funciones de desafíos
function subirEvidencia(desafioId) {
    const input = document.getElementById(`evidence${desafioId}`);
    if (input.files && input.files[0]) {
        const btn = document.getElementById(`completeTask${desafioId}`);
        btn.style.display = 'block';
    }
}

function completarDesafio(desafioId) {
    if (!usuarioActual) return;

    const desafio = obtenerDesafio(desafioId);
    if (!desafio) return;

    // Verificar si ya completó el desafío
    if (usuarioActual.desafiosCompletados.includes(desafioId)) {
        alert('Ya has completado este desafío');
        return;
    }

    // Agregar puntos y marcar como completado
    usuarioActual.puntos += desafio.puntos;
    usuarioActual.desafiosCompletados.push(desafioId);

    // Actualizar nivel si corresponde
    const nuevoNivel = Math.floor(usuarioActual.puntos / 100) + 1;
    if (nuevoNivel > usuarioActual.nivel) {
        usuarioActual.nivel = nuevoNivel;
        alert(`¡Felicidades! Has subido al nivel ${nuevoNivel}`);
    }

    // Guardar cambios
    const index = usuarios.findIndex(u => u.correo === usuarioActual.correo);
    usuarios[index] = usuarioActual;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('usuario_actual', JSON.stringify(usuarioActual));

    // Actualizar interfaz
    actualizarDatosUsuario();
    alert(`¡Desafío completado! Has ganado ${desafio.puntos} puntos`);
}

function obtenerDesafio(id) {
    const desafios = {
        1: { puntos: 100, titulo: 'Mes del Termo y Topper' },
        2: { puntos: 50, titulo: 'Bolsa Ecológica' },
        3: { puntos: 150, titulo: 'Trueque de Prendas' },
        4: { puntos: 75, titulo: 'Ahorro de Agua' },
        5: { puntos: 100, titulo: 'Recolección de PET' },
        6: { puntos: 50, titulo: 'Recolección de Tapitas' }
    };
    return desafios[id];
}

// Funciones de recompensas
function canjearHoras(horas, puntos) {
    if (!usuarioActual) return;

    if (usuarioActual.puntos >= puntos) {
        usuarioActual.puntos -= puntos;
        
        // Actualizar horas liberadas
        const horasLiberadas = usuarioActual.horasLiberadas || 0;
        usuarioActual.horasLiberadas = horasLiberadas + horas;

        // Guardar cambios
        const index = usuarios.findIndex(u => u.correo === usuarioActual.correo);
        usuarios[index] = usuarioActual;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        localStorage.setItem('usuario_actual', JSON.stringify(usuarioActual));

        // Actualizar interfaz
        actualizarDatosUsuario();
        alert(`¡Felicidades! Has liberado ${horas} horas de servicio social.`);
    } else {
        alert('No tienes suficientes puntos para canjear estas horas.');
    }
}

function canjearPuntosCalificacion(puntos, costo) {
    if (!usuarioActual) return;

    if (usuarioActual.puntos >= costo) {
        usuarioActual.puntos -= costo;
        
        // Actualizar puntos de calificación
        const puntosCalificacion = usuarioActual.puntosCalificacion || 0;
        usuarioActual.puntosCalificacion = puntosCalificacion + puntos;

        // Guardar cambios
        const index = usuarios.findIndex(u => u.correo === usuarioActual.correo);
        usuarios[index] = usuarioActual;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        localStorage.setItem('usuario_actual', JSON.stringify(usuarioActual));

        // Actualizar interfaz
        actualizarDatosUsuario();
        alert(`¡Felicidades! Has canjeado ${puntos} punto(s) extra para tu calificación final.`);
    } else {
        alert('No tienes suficientes puntos para realizar este canje.');
    }
}

// Funciones de validación
function validarCorreoInstitucional(correo) {
    const dominiosPermitidos = ['@cecyteqroo.edu.mx', '@cancun.tecnm.mx'];
    return dominiosPermitidos.some(dominio => correo.endsWith(dominio));
}

// Inicializar la interfaz al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const usuarioGuardadoStr = localStorage.getItem('usuario_actual');
    try {
        if (usuarioGuardadoStr) {
            const parsedUser = JSON.parse(usuarioGuardadoStr);
            // Asegurar que es un objeto de usuario válido, no solo un objeto vacío
            if (parsedUser && typeof parsedUser === 'object' && parsedUser.correo) { 
                usuarioActual = parsedUser;
            } else {
                usuarioActual = null; // Limpiar si no es un objeto de usuario válido
                localStorage.removeItem('usuario_actual'); // También eliminar el elemento inválido
            }
        } else {
            usuarioActual = null; // Explicitamente establecer a null si no hay nada guardado
        }
    } catch (e) {
        console.error("Error al parsear usuario_actual de localStorage:", e);
        usuarioActual = null; // Limpiar si falla el parseo
        localStorage.removeItem('usuario_actual'); // También eliminar el elemento corrupto
    }
    renderAppUI();
});

// Variables para el quiz actual
let quizActual = null;
let respuestasUsuario = [];

// Función para cerrar el modal de quiz
function cerrarModalQuiz() {
    document.getElementById("quizModal").style.display = "none";
    
    // Resetear el estado del quiz
    quizActual = null;
    respuestasUsuario = [];
    
    // Ocultar resultados y mostrar preguntas para el próximo quiz
    document.getElementById("quizQuestions").style.display = "block";
    document.getElementById("quizResults").style.display = "none";
    document.getElementById("submitQuiz").style.display = "block";
}

// Función para mostrar el quiz después de completar un desafío
function mostrarQuiz(desafioId, titulo) {
    // Buscar el quiz correspondiente al desafío
    const quiz = bancoDeQuizzes.find(q => q.desafioId === desafioId);
    
    // Si no hay quiz para este desafío, no hacer nada
    if (!quiz) {
        console.log("No se encontró quiz para el desafío ID:", desafioId);
        return;
    }
    
    quizActual = quiz;
    respuestasUsuario = new Array(quiz.preguntas.length).fill(-1);
    
    // Actualizar título del quiz
    document.getElementById("quizTitulo").textContent = quiz.titulo;
    
    // Cargar PDF si existe
    const pdfViewer = document.getElementById("pdfViewer");
    const pdfPlaceholder = pdfViewer.querySelector(".pdf-placeholder");
    const pdfFrame = document.getElementById("pdfFrame");
    
    if (quiz.pdfUrl) {
        pdfFrame.src = quiz.pdfUrl;
        pdfFrame.style.display = "block";
        pdfPlaceholder.style.display = "none";
    } else {
        pdfFrame.style.display = "none";
        pdfPlaceholder.style.display = "flex";
        pdfPlaceholder.innerHTML = `
            <i class="fas fa-file-pdf"></i>
            <span>No hay material educativo disponible para este desafío.</span>
        `;
    }
    
    // Generar preguntas
    const questionsContainer = document.getElementById("quizQuestions");
    questionsContainer.innerHTML = "";
    
    quiz.preguntas.forEach((pregunta, preguntaIndex) => {
        const questionElement = document.createElement("div");
        questionElement.className = "quiz-question";
        
        const questionText = document.createElement("div");
        questionText.className = "question-text";
        questionText.textContent = `${preguntaIndex + 1}. ${pregunta.pregunta}`;
        
        const optionsContainer = document.createElement("div");
        optionsContainer.className = "question-options";
        
        pregunta.opciones.forEach((opcion, opcionIndex) => {
            const optionItem = document.createElement("label");
            optionItem.className = "option-item";
            
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = `pregunta-${preguntaIndex}`;
            radio.className = "option-radio";
            radio.value = opcionIndex;
            radio.addEventListener("change", () => {
                respuestasUsuario[preguntaIndex] = opcionIndex;
            });
            
            const optionText = document.createElement("span");
            optionText.className = "option-text";
            optionText.textContent = opcion;
            
            optionItem.appendChild(radio);
            optionItem.appendChild(optionText);
            optionsContainer.appendChild(optionItem);
        });
        
        questionElement.appendChild(questionText);
        questionElement.appendChild(optionsContainer);
        questionsContainer.appendChild(questionElement);
    });
    
    // Mostrar el botón de enviar respuestas
    document.getElementById("submitQuiz").style.display = "block";
    // Ocultar los resultados
    document.getElementById("quizResults").style.display = "none";
    // Mostrar las preguntas
    document.getElementById("quizQuestions").style.display = "block";
    
    // Mostrar el modal
    document.getElementById("quizModal").style.display = "block";
}

// Función para evaluar el quiz
function evaluarQuiz() {
    if (!quizActual) return;
    
    // Verificar si todas las preguntas están respondidas
    const sinResponder = respuestasUsuario.some(r => r === -1);
    if (sinResponder) {
        alert("Por favor, responde todas las preguntas antes de enviar.");
        return;
    }
    
    // Calcular puntuación
    let puntosObtenidos = 0;
    respuestasUsuario.forEach((respuesta, index) => {
        if (respuesta === quizActual.preguntas[index].respuestaCorrecta) {
            puntosObtenidos++;
        }
    });
    
    // Mostrar resultados
    const resultadosContainer = document.getElementById("quizResults");
    document.getElementById("quizScore").textContent = `${puntosObtenidos}/${quizActual.preguntas.length}`;
    
    // Determinar mensaje según puntuación
    const porcentajeAcierto = (puntosObtenidos / quizActual.preguntas.length) * 100;
    let mensaje = "";
    let puntosExtra = 0;
    
    if (porcentajeAcierto === 100) {
        mensaje = "¡Excelente! Has respondido correctamente todas las preguntas. Recibirás 30 puntos extra.";
        puntosExtra = 30;
    } else if (porcentajeAcierto >= 70) {
        mensaje = "¡Muy bien! Has respondido correctamente la mayoría de las preguntas. Recibirás 20 puntos extra.";
        puntosExtra = 20;
    } else if (porcentajeAcierto >= 50) {
        mensaje = "¡Bien! Has aprobado el quiz. Recibirás 10 puntos extra.";
        puntosExtra = 10;
    } else {
        mensaje = "Has completado el quiz, pero necesitas reforzar tus conocimientos sobre este tema. No recibirás puntos extra esta vez.";
        puntosExtra = 0;
    }
    
    document.getElementById("resultMessage").textContent = mensaje;
    
    // Marcar respuestas correctas e incorrectas
    const questionsContainer = document.getElementById("quizQuestions");
    const questionElements = questionsContainer.querySelectorAll(".quiz-question");
    
    questionElements.forEach((questionElement, questionIndex) => {
        const optionItems = questionElement.querySelectorAll(".option-item");
        const respuestaCorrecta = quizActual.preguntas[questionIndex].respuestaCorrecta;
        
        optionItems.forEach((optionItem, optionIndex) => {
            if (optionIndex === respuestaCorrecta) {
                optionItem.classList.add("correct-answer");
            } else if (optionIndex === respuestasUsuario[questionIndex] && respuestasUsuario[questionIndex] !== respuestaCorrecta) {
                optionItem.classList.add("wrong-answer");
            }
            
            // Deshabilitar los inputs
            const radio = optionItem.querySelector("input");
            if (radio) radio.disabled = true;
        });
    });
    
    // Actualizar puntos del usuario
    if (puntosExtra > 0) {
        const usuario = JSON.parse(localStorage.getItem('usuario_actual'));
        usuario.puntos += puntosExtra;
        
        // Actualizar nivel si es necesario
        if (usuario.puntos >= 100) {
            usuario.nivel++;
            usuario.puntos -= 100;
            mostrarNotificacion(`¡Felicidades! Has subido al nivel ${usuario.nivel}.`);
        }
        
        localStorage.setItem('usuario_actual', JSON.stringify(usuario));
        
        // Actualizar en lista de usuarios
        let usuarios = JSON.parse(localStorage.getItem('usuarios'));
        const index = usuarios.findIndex(u => u.email === usuario.email);
        if (index !== -1) {
            usuarios[index] = usuario;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
        }
        
        // Actualizar nivel en la UI
        document.getElementById('nivel-badge').textContent = `Nivel ${usuario.nivel}`;
        
        // Mostrar notificación
        mostrarNotificacion(`Has ganado ${puntosExtra} puntos extra por completar el quiz.`);
    }
    
    // Ocultar botón de enviar y mostrar resultados
    document.getElementById("submitQuiz").style.display = "none";
    resultadosContainer.style.display = "block";
}

// Función para cerrar el formulario de login
function cerrarFormularioLogin() {
    const loginContainer = document.getElementById('loginContainer');
    if (loginContainer) {
        loginContainer.style.display = 'none';
    }
}

// Agregar event listener para el formulario de recuperación
document.addEventListener('DOMContentLoaded', function() {
    const recoveryForm = document.getElementById('recoveryForm');
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', handleRecoverySubmit);
    }
});

// Función para mostrar el perfil
function verPerfil() {
    ocultarTodasLasSecciones();
    const perfilSection = document.getElementById('perfil');
    if (perfilSection) {
        perfilSection.style.display = 'block';
        cargarDatosPerfil();
    }
}

// Función para mostrar una sección específica
function mostrarSeccion(seccionId) {
    const seccion = document.getElementById(seccionId);
    const mainNav = document.getElementById('main-nav');
    const mobileNav = document.getElementById('mobile-nav');
    
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar la sección seleccionada
    if (seccion) {
        seccion.style.display = 'block';
    }
    
    // Asegurarse de que la navegación esté visible
    if (mainNav) mainNav.style.display = 'flex';
    if (mobileNav) mobileNav.style.display = 'flex';
}

// Función para cargar los datos del perfil
function cargarDatosPerfil() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (usuario) {
        document.getElementById('profileName').textContent = usuario.nombre || 'Usuario';
        document.getElementById('profileEmail').textContent = usuario.email || 'correo@ejemplo.com';
        document.getElementById('profilePoints').textContent = `Puntos: ${usuario.puntos || 0}`;
        document.getElementById('completedChallenges').textContent = usuario.desafiosCompletados || 0;
        document.getElementById('environmentalImpact').textContent = `${usuario.impactoAmbiental || 0} kg CO₂`;
        document.getElementById('userLevel').textContent = calcularNivel(usuario.puntos || 0);
        cargarLogros(usuario);
    }
}

// Función para calcular el nivel del usuario
function calcularNivel(puntos) {
    if (puntos < 100) return 'Principiante';
    if (puntos < 500) return 'Intermedio';
    if (puntos < 1000) return 'Avanzado';
    return 'Experto';
}

// Función para cargar los logros del usuario
function cargarLogros(usuario) {
    const achievementsGrid = document.getElementById('achievementsGrid');
    if (!achievementsGrid) return;

    const logros = [
        {
            icon: 'fa-leaf',
            titulo: 'Primer Desafío',
            descripcion: 'Completaste tu primer desafío ambiental'
        },
        {
            icon: 'fa-recycle',
            titulo: 'Reciclador',
            descripcion: 'Reciclaste más de 10 kg de materiales'
        },
        {
            icon: 'fa-water',
            titulo: 'Guardian del Agua',
            descripcion: 'Ahorraste más de 100 litros de agua'
        }
    ];

    achievementsGrid.innerHTML = logros.map(logro => `
        <div class="achievement-card">
            <i class="fas ${logro.icon}"></i>
            <h4>${logro.titulo}</h4>
            <p>${logro.descripcion}</p>
        </div>
    `).join('');
}

// Función para editar el perfil
function editarPerfil() {
    const perfilContent = document.querySelector('.profile-content');
    const editForm = document.getElementById('editProfileForm');
    
    if (perfilContent && editForm) {
        perfilContent.style.display = 'none';
        editForm.style.display = 'block';
        
        // Cargar datos actuales en el formulario
        const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
        if (usuario) {
            document.getElementById('editName').value = usuario.nombre || '';
            document.getElementById('editEmail').value = usuario.email || '';
            
            // Cargar credencial si existe
            if (usuario.credencial) {
                const credentialImage = document.getElementById('credentialImage');
                const uploadPlaceholder = document.getElementById('uploadPlaceholder');
                const removeCredential = document.getElementById('removeCredential');
                
                credentialImage.src = usuario.credencial;
                credentialImage.style.display = 'block';
                uploadPlaceholder.style.display = 'none';
                removeCredential.style.display = 'block';
            }
        }
    }
}

// Función para cerrar la edición del perfil
function cerrarEdicionPerfil() {
    const perfilContent = document.querySelector('.profile-content');
    const editForm = document.getElementById('editProfileForm');
    
    if (perfilContent && editForm) {
        perfilContent.style.display = 'block';
        editForm.style.display = 'none';
    }
}

// Función para guardar los cambios del perfil
function guardarCambiosPerfil(event) {
    event.preventDefault();
    
    const usuario = JSON.parse(localStorage.getItem('usuarioActual')) || {};
    const nuevaContrasena = document.getElementById('editPassword').value;
    
    // Actualizar datos del usuario
    usuario.nombre = document.getElementById('editName').value;
    usuario.email = document.getElementById('editEmail').value;
    
    // Actualizar contraseña solo si se proporcionó una nueva
    if (nuevaContrasena) {
        usuario.password = nuevaContrasena;
    }
    
    // Guardar cambios
    localStorage.setItem('usuarioActual', JSON.stringify(usuario));
    
    // Actualizar vista del perfil
    cargarDatosPerfil();
    cerrarEdicionPerfil();
    
    // Mostrar mensaje de éxito
    alert('Perfil actualizado correctamente');
}

// Función para previsualizar la credencial
function previewCredencial(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const credentialImage = document.getElementById('credentialImage');
            const uploadPlaceholder = document.getElementById('uploadPlaceholder');
            const removeCredential = document.getElementById('removeCredential');
            
            credentialImage.src = e.target.result;
            credentialImage.style.display = 'block';
            uploadPlaceholder.style.display = 'none';
            removeCredential.style.display = 'block';
            
            // Guardar la credencial en el usuario actual
            const usuario = JSON.parse(localStorage.getItem('usuarioActual')) || {};
            usuario.credencial = e.target.result;
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));
        };
        reader.readAsDataURL(file);
    }
}

// Función para eliminar la credencial
function eliminarCredencial() {
    const credentialImage = document.getElementById('credentialImage');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const removeCredential = document.getElementById('removeCredential');
    const credentialUpload = document.getElementById('credentialUpload');
    
    credentialImage.src = '';
    credentialImage.style.display = 'none';
    uploadPlaceholder.style.display = 'block';
    removeCredential.style.display = 'none';
    credentialUpload.value = '';
    
    // Eliminar la credencial del usuario actual
    const usuario = JSON.parse(localStorage.getItem('usuarioActual')) || {};
    delete usuario.credencial;
    localStorage.setItem('usuarioActual', JSON.stringify(usuario));
}    