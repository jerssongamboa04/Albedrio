import type { Task } from "./tasks.service";

export type AntiBlockLevel = "soft" | "recommended" | "urgent";

export type AntiBlockReason =
  | "low_clarity"
  | "high_difficulty"
  | "high_energy"
  | "mixed_friction";

export type AntiBlockResult = {
  level: AntiBlockLevel;
  reasons: AntiBlockReason[];
  detectedVerb: string | null;
  headline: string;
  message: string;
  micro_step: string;
  optional_step: string | null;
  cta_label: string;
};

const COMMON_TASK_VERBS = [
  "aspirar",
  "barrer",
  "fregar",
  "limpiar",
  "ordenar",
  "recoger",
  "doblar",
  "guardar",
  "lavar",
  "cocinar",
  "preparar",
  "estudiar",
  "repasar",
  "leer",
  "resumir",
  "revisar",
  "practicar",
  "buscar",
  "investigar",
  "avanzar",
  "redactar",
  "escribir",
  "corregir",
  "llamar",
  "responder",
  "enviar",
  "rellenar",
  "tramitar",
  "pagar",
  "comprar",
  "reservar",
  "planificar",
  "organizar",
  "decidir",
  "hacer",
  "terminar",
  "empezar",
] as const;

type SupportedVerb = (typeof COMMON_TASK_VERBS)[number] | "generic";

export function buildAntiBlockSuggestion(task: Task): AntiBlockResult {
  const reasons = detectAntiBlockReasons(task);
  const level = getAntiBlockLevel(task, reasons);
  const detectedVerb = detectTaskVerb(task);
  const normalizedVerb = normalizeVerb(detectedVerb);

  return {
    level,
    reasons,
    detectedVerb,
    headline: getHeadline(level),
    message: getMessage(level, reasons),
    micro_step: buildMicroStep(task, normalizedVerb, level),
    optional_step: buildOptionalStep(task, normalizedVerb, level),
    cta_label: "Empezar con esto",
  };
}

function detectAntiBlockReasons(task: Task): AntiBlockReason[] {
  const reasons: AntiBlockReason[] = [];

  if (task.clarity_level === "blocked" || task.clarity_level === "somewhat_clear") {
    reasons.push("low_clarity");
  }

  if (task.difficulty_level === "hard") {
    reasons.push("high_difficulty");
  }

  if (task.energy_level === "high") {
    reasons.push("high_energy");
  }

  if (
    (task.clarity_level === "blocked" && task.difficulty_level === "hard") ||
    (task.difficulty_level === "hard" && task.energy_level === "high")
  ) {
    reasons.push("mixed_friction");
  }

  return reasons;
}

function getAntiBlockLevel(
  task: Task,
  reasons: AntiBlockReason[]
): AntiBlockLevel {
  if (
    task.clarity_level === "blocked" &&
    (task.difficulty_level === "hard" || task.energy_level === "high")
  ) {
    return "urgent";
  }

  if (
    reasons.includes("low_clarity") ||
    reasons.includes("high_difficulty") ||
    reasons.includes("high_energy")
  ) {
    return "recommended";
  }

  return "soft";
}

function getHeadline(level: AntiBlockLevel): string {
  switch (level) {
    case "urgent":
      return "Vamos a ponértelo muy fácil";
    case "recommended":
      return "Vamos a quitarle fricción";
    case "soft":
    default:
      return "Puedes empezar por algo pequeño";
  }
}

function getMessage(
  level: AntiBlockLevel,
  reasons: AntiBlockReason[]
): string {
  if (level === "urgent") {
    return "No hace falta resolver toda la tarea ahora. Solo vamos a buscar una forma muy fácil de arrancarla.";
  }

  if (reasons.includes("low_clarity")) {
    return "Como esta tarea no está del todo clara, vamos a convertirla en una primera acción sencilla y concreta.";
  }

  if (reasons.includes("high_difficulty") || reasons.includes("high_energy")) {
    return "Parece una tarea con cierta fricción. Vamos a rebajar el inicio para que te resulte más fácil empezar.";
  }

  return "A veces empezar por una acción muy pequeña es suficiente para desbloquear el resto.";
}

function detectTaskVerb(task: Task): string | null {
  const titleWords = tokenize(task.title);
  const notesWords = tokenize(task.notes ?? "");

  const firstTitleWord = titleWords[0] ?? null;
  if (firstTitleWord && isKnownVerb(firstTitleWord)) {
    return firstTitleWord;
  }

  for (const word of titleWords) {
    if (isKnownVerb(word)) return word;
  }

  for (const word of notesWords) {
    if (isKnownVerb(word)) return word;
  }

  return null;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:¡!¿?()[\]{}"']/g, " ")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function isKnownVerb(word: string): boolean {
  return COMMON_TASK_VERBS.includes(word as (typeof COMMON_TASK_VERBS)[number]);
}

function normalizeVerb(verb: string | null): SupportedVerb {
  if (!verb) return "generic";

  switch (verb) {
    case "aspirar":
    case "barrer":
    case "fregar":
    case "limpiar":
    case "ordenar":
    case "recoger":
    case "doblar":
    case "guardar":
    case "lavar":
    case "cocinar":
    case "preparar":
    case "estudiar":
    case "repasar":
    case "leer":
    case "resumir":
    case "revisar":
    case "practicar":
    case "buscar":
    case "investigar":
    case "avanzar":
    case "redactar":
    case "escribir":
    case "corregir":
    case "llamar":
    case "responder":
    case "enviar":
    case "rellenar":
    case "tramitar":
    case "pagar":
    case "comprar":
    case "reservar":
    case "planificar":
    case "organizar":
    case "decidir":
    case "hacer":
    case "terminar":
    case "empezar":
      return verb;
    default:
      return "generic";
  }
}

function buildMicroStep(
  task: Task,
  verb: SupportedVerb,
  level: AntiBlockLevel
): string {
  switch (verb) {
    case "aspirar":
      return "Saca la aspiradora y colócala ya en la puerta o en la zona donde tengas que empezar.";

    case "barrer":
      return "Coge la escoba y barre solo una zona pequeña, sin pensar todavía en terminar todo.";

    case "fregar":
      return "Llena el cubo o prepara la fregona y empieza solo por un tramo pequeño del suelo.";

    case "limpiar":
      return "Coge lo que necesites para limpiar y empieza solo por una superficie concreta.";

    case "ordenar":
    case "organizar":
      return "Elige una sola zona pequeña y ordénala sin pensar todavía en el resto.";

    case "recoger":
      return "Recoge solo lo que esté más a la vista o lo que más moleste ahora mismo.";

    case "doblar":
      return "Dobla solo tres prendas o una pequeña pila para arrancar sin presión.";

    case "guardar":
      return "Guarda primero lo que tengas más cerca o una sola categoría de cosas.";

    case "lavar":
      return "Deja preparada una primera tanda o lava solo lo imprescindible para empezar.";

    case "cocinar":
      return "Saca los ingredientes o utensilios que necesites y deja preparada la primera parte.";

    case "preparar":
      return "Deja listo el material o el entorno necesario para empezar sin tener que pensar demasiado.";

    case "estudiar":
    case "repasar":
      return "Abre tus apuntes y lee solo un bloque corto o una página.";

    case "leer":
      return "Lee durante cinco minutos o una sola página, sin exigirte más por ahora.";

    case "resumir":
      return "Lee un fragmento corto y escribe solo una idea principal con tus palabras.";

    case "revisar":
      return "Revisa únicamente la primera parte o el primer punto que tengas delante.";

    case "practicar":
      return "Haz una sola repetición, ejercicio o intento para romper el bloqueo inicial.";

    case "buscar":
    case "investigar":
      return "Busca una sola fuente, dato o referencia para empezar a mover la tarea.";

    case "avanzar":
      return level === "urgent"
        ? "Abre lo que estabas trabajando y relee solo el último punto en el que te quedaste."
        : "Abre la tarea y haz una pequeña parte que puedas completar en pocos minutos.";

    case "redactar":
    case "escribir":
      return "Abre el documento y escribe dos frases sueltas sin preocuparte por dejarlas perfectas.";

    case "corregir":
      return "Corrige solo un fragmento breve o un único bloque de texto para empezar.";

    case "llamar":
      return "Abre el contacto o marca el número para dejar la llamada lista.";

    case "responder":
      return "Abre el mensaje o correo y escribe una primera frase de respuesta.";

    case "enviar":
      return "Deja preparado el mensaje, archivo o correo para que luego solo te quede revisarlo y enviarlo.";

    case "rellenar":
    case "tramitar":
      return "Abre el formulario o trámite y completa solo el primer dato o primer bloque.";

    case "pagar":
      return "Abre la app o la web correspondiente y deja localizada la operación que tienes que hacer.";

    case "comprar":
      return "Haz una lista mínima o añade primero los productos más importantes.";

    case "reservar":
      return "Abre la página o app de la reserva y revisa solo horarios o disponibilidad.";

    case "planificar":
    case "decidir":
      return "Escribe una sola opción o una primera decisión para que la tarea empiece a moverse.";

    case "hacer":
    case "terminar":
    case "empezar":
      return "Convierte la tarea en una acción muy pequeña y haz solo esa primera parte.";

    case "generic":
    default:
      return level === "urgent"
        ? "Dedica dos minutos a dejar preparada solo la primera acción necesaria."
        : "Empieza por una acción pequeña y muy concreta que puedas hacer ahora mismo.";
  }
}

function buildOptionalStep(
  task: Task,
  verb: SupportedVerb,
  level: AntiBlockLevel
): string | null {
  if (level === "soft") {
    return null;
  }

  switch (verb) {
    case "aspirar":
    case "barrer":
    case "fregar":
    case "limpiar":
      return "Después, continúa solo con la parte más visible o la que más te moleste.";

    case "ordenar":
    case "organizar":
    case "recoger":
    case "guardar":
      return "Cuando termines esa zona, decide si te compensa hacer otra igual de pequeña.";

    case "doblar":
    case "lavar":
      return "Si te ves con ánimo, completa una pequeña tanda más.";

    case "cocinar":
    case "preparar":
      return "Cuando tengas eso listo, pasa solo al siguiente gesto más obvio.";

    case "estudiar":
    case "repasar":
    case "leer":
      return "Si sigues con foco, subraya una idea importante o apunta una frase resumen.";

    case "resumir":
    case "revisar":
    case "corregir":
      return "Cuando acabes ese bloque, revisa solo uno más.";

    case "buscar":
    case "investigar":
      return "Si esa primera búsqueda te sirve, guarda una referencia útil y para ahí.";

    case "avanzar":
    case "redactar":
    case "escribir":
      return "Después, deja anotada una idea breve sobre lo siguiente que tocaría hacer.";

    case "llamar":
    case "responder":
    case "enviar":
      return "Si ya lo tienes abierto, termina solo el borrador básico.";

    case "rellenar":
    case "tramitar":
    case "pagar":
    case "comprar":
    case "reservar":
      return "Cuando completes ese primer paso, revisa si ya puedes dejar resuelto lo esencial.";

    case "planificar":
    case "decidir":
      return "Después, apunta cuál sería el siguiente paso más pequeño posible.";

    case "hacer":
    case "terminar":
    case "empezar":
    case "generic":
    default:
      return "Si este primer paso te desbloquea, continúa solo con otra acción igual de pequeña.";
  }
}