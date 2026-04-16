export const copy = {
  brand: {
    name: "Albedrio",
    tagline: "Hazlo pequeño. Hazlo hoy.",
  },

  loading: {
    session: "Calentando motores… 🎯",
  },

  auth: {
    title: "¡Bienvenido de nuevo!",
    subtitle: "Aquí no vienes a apuntar tareas. Vienes a avanzar de verdad.",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Contraseña",
    signIn: "Entrar Modo misión.",
    signUp: "Crear cuenta y empezar",
    hint: "Tip Albedrio: empieza ridículamente fácil y gana inercia.",
    createdOk: "✅ Cuenta creada. Si te pide confirmación, revisa el email y volvemos al ataque.",
  },

  home: {
    title: "Misión de hoy",
    subtitle: (email?: string) =>
      email ? `Ey, ${email}. Una cosa pequeña y ya estás ganando.` : "Una cosa pequeña y ya estás ganando.",
    newTaskPlaceholder: "Tu siguiente paso (aunque sea mini)…",
    addTask: "Añadir",
    refresh: "Refrescar",
    empty: "Aún no hay misión. Pon una fácil y rompemos el hielo.",
    done: "✅ Completada",
    pending: "⬜ Pendiente",
    delete: "Borrar",
    signOut: "Cerrar sesión",
  },

  feedback: {
    genericError: "Uy, pulsa otra vez y lo tenemos.",
  },

  // Extra: frases del “compañero Albedrio” (para gamificación/UX)
  albendrio: {
    onAdd: [
      "Buena. Pequeño paso, gran señal.",
      "Eso es. Ya estás en movimiento.",
      "Vale, eso cuenta. Siguiente.",
    ],
    onComplete: [
      "¡Tachada! Así se gana.",
      "¡Hecha! Te acabas de demostrar algo.",
      "Otra menos. Tú mandas.",
    ],
    onEmpty: [
      "Si hoy solo haces una cosa, que sea la primera.",
      "Pon una mini-tarea. Lo demás viene solo.",
    ],
  },
};
