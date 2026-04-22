import type { Task } from "./tasks.service";

export type BreakdownCategory =
  | "writing"
  | "study"
  | "home"
  | "admin"
  | "preparation"
  | "pet_care"
  | "generic";

export type BreakdownStep = {
  id: string;
  text: string;
};

export type BreakdownResult = {
  category: BreakdownCategory;
  headline: string;
  message: string;
  steps: BreakdownStep[];
};

const WRITING_VERBS = [
  "redactar",
  "escribir",
  "avanzar",
  "corregir",
] as const;

const STUDY_VERBS = [
  "estudiar",
  "repasar",
  "leer",
  "resumir",
  "revisar",
  "practicar",
  "investigar",
  "buscar",
] as const;

const HOME_VERBS = [
  "lavar",
  "limpiar",
  "aspirar",
  "barrer",
  "fregar",
  "recoger",
  "ordenar",
  "organizar",
  "guardar",
  "doblar",
  "cocinar",
] as const;

const ADMIN_VERBS = [
  "llamar",
  "responder",
  "enviar",
  "rellenar",
  "tramitar",
  "pagar",
  "reservar",
  "comprar",
] as const;

const PREPARATION_VERBS = [
  "preparar",
  "planificar",
  "decidir",
  "hacer",
  "terminar",
] as const;

const PET_CARE_VERBS = [
  "banar",
  "pasear",
  "cepillar",
  "alimentar",
  "sacar",
  "llevar",
] as const;

const PET_CARE_KEYWORDS = [
  "perro",
  "perra",
  "gato",
  "gata",
  "mascota",
  "veterinario",
  "correa",
  "champu",
  "pienso",
] as const;

export function buildTaskBreakdown(task: Task): BreakdownResult {
  const detectedVerb = detectTaskVerb(task);
  const category = getBreakdownCategory(task, detectedVerb);

  return {
    category,
    headline: getHeadline(category),
    message: getMessage(category),
    steps: buildSteps(task, category),
  };
}

function detectTaskVerb(task: Task): string | null {
  const titleWords = tokenize(task.title);
  const notesWords = tokenize(task.notes ?? "");

  const firstTitleWord = titleWords[0] ?? null;
  if (firstTitleWord && isKnownBreakdownVerb(firstTitleWord)) {
    return firstTitleWord;
  }

  for (const word of titleWords) {
    if (isKnownBreakdownVerb(word)) return word;
  }

  for (const word of notesWords) {
    if (isKnownBreakdownVerb(word)) return word;
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

function isKnownBreakdownVerb(word: string): boolean {
  return (
    HOME_VERBS.includes(word as (typeof HOME_VERBS)[number]) ||
    WRITING_VERBS.includes(word as (typeof WRITING_VERBS)[number]) ||
    STUDY_VERBS.includes(word as (typeof STUDY_VERBS)[number]) ||
    ADMIN_VERBS.includes(word as (typeof ADMIN_VERBS)[number]) ||
    PREPARATION_VERBS.includes(word as (typeof PREPARATION_VERBS)[number]) ||
    PET_CARE_VERBS.includes(word as (typeof PET_CARE_VERBS)[number])
  );
}

function hasPetCareContext(task: Task): boolean {
  const words = [...tokenize(task.title), ...tokenize(task.notes ?? "")];

  return words.some((word) =>
    PET_CARE_KEYWORDS.includes(word as (typeof PET_CARE_KEYWORDS)[number])
  );
}

function detectNamedTarget(task: Task): string | null {
  const rawTitle = task.title.trim();

  const match = rawTitle.match(/\ba\s+([A-ZÁÉÍÓÚÑ][\p{L}]+)/u);
  if (match?.[1]) {
    return match[1].trim();
  }

  return null;
}

function getBreakdownCategory(
  task: Task,
  verb: string | null
): BreakdownCategory {
  if (verb && PET_CARE_VERBS.includes(verb as (typeof PET_CARE_VERBS)[number])) {
    return "pet_care";
  }

  if (hasPetCareContext(task)) {
    return "pet_care";
  }

  if (!verb) return "generic";

  if (HOME_VERBS.includes(verb as (typeof HOME_VERBS)[number])) {
    return "home";
  }

  if (WRITING_VERBS.includes(verb as (typeof WRITING_VERBS)[number])) {
    return "writing";
  }

  if (STUDY_VERBS.includes(verb as (typeof STUDY_VERBS)[number])) {
    return "study";
  }

  if (ADMIN_VERBS.includes(verb as (typeof ADMIN_VERBS)[number])) {
    return "admin";
  }

  if (PREPARATION_VERBS.includes(verb as (typeof PREPARATION_VERBS)[number])) {
    return "preparation";
  }

  return "generic";
}

function getHeadline(category: BreakdownCategory): string {
  switch (category) {
    case "writing":
      return "Vamos a dividirlo para que escribir te resulte más fácil";
    case "study":
      return "Vamos a dejarlo en pasos más manejables";
    case "home":
      return "Vamos a ordenarlo por partes";
    case "admin":
      return "Vamos a separar esta gestión en pasos claros";
    case "preparation":
      return "Vamos a estructurarlo un poco mejor";
    case "pet_care":
      return "Vamos a convertir este cuidado en pasos claros y fáciles";
    case "generic":
    default:
      return "Vamos a convertir esta tarea en algo más manejable";
  }
}

function getMessage(category: BreakdownCategory): string {
  switch (category) {
    case "writing":
      return "No hace falta resolver toda la tarea de golpe. Estos tres pasos pueden ayudarte a verla más clara.";
    case "study":
      return "Dividir la tarea en partes pequeñas puede hacer que empezar resulte mucho más sencillo.";
    case "home":
      return "Si lo ves por bloques, la tarea deja de sentirse tan pesada.";
    case "admin":
      return "Separar la gestión en pasos concretos reduce bastante la sensación de carga.";
    case "preparation":
      return "Una estructura breve puede ayudarte a arrancar con más claridad.";
    case "pet_care":
      return "Cuando una tarea de cuidado se aterriza bien, empezar resulta mucho más sencillo.";
    case "generic":
    default:
      return "Aquí tienes una forma simple de dividir la tarea sin complicarla demasiado.";
  }
}

function buildHomeSteps(verb: string | null): BreakdownStep[] {
  switch (verb) {
    case "lavar":
      return [
        createStep("1", "Reúne lo que necesitas y deja preparada la zona para empezar."),
        createStep("2", "Limpia primero la parte más visible o más fácil de resolver."),
        createStep("3", "Haz un repaso final de lo esencial y da la tarea por cerrada."),
      ];

    case "limpiar":
      return [
        createStep("1", "Elige una sola parte o superficie para empezar."),
        createStep("2", "Limpia esa zona sin pensar todavía en el resto."),
        createStep("3", "Revisa si con eso ya has resuelto lo principal."),
      ];

    case "aspirar":
    case "barrer":
    case "fregar":
      return [
        createStep("1", "Prepara el material y decide por qué zona vas a empezar."),
        createStep("2", "Haz primero una parte visible o fácil de completar."),
        createStep("3", "Termina la parte principal y deja el resto para después si hace falta."),
      ];

    case "ordenar":
    case "organizar":
    case "recoger":
    case "guardar":
      return [
        createStep("1", "Elige una sola zona o grupo de cosas para empezar."),
        createStep("2", "Separa lo que se queda, lo que se guarda o lo que sobra."),
        createStep("3", "Deja esa parte cerrada antes de pasar a otra."),
      ];

    case "doblar":
      return [
        createStep("1", "Reúne la ropa o la parte que vas a doblar."),
        createStep("2", "Dobla una tanda pequeña para coger ritmo."),
        createStep("3", "Deja guardado lo esencial y da por cerrada esta parte."),
      ];

    case "cocinar":
      return [
        createStep("1", "Prepara los ingredientes y utensilios que vayas a usar."),
        createStep("2", "Haz primero la parte base de la receta o preparación."),
        createStep("3", "Termina lo principal y deja recogido lo imprescindible."),
      ];

    default:
      return [
        createStep("1", "Elige una parte concreta para empezar."),
        createStep("2", "Haz esa primera parte sin pensar todavía en todo lo demás."),
        createStep("3", "Deja resuelto lo principal antes de cerrar la tarea."),
      ];
  }
}

function buildPetCareSteps(task: Task, verb: string | null): BreakdownStep[] {
  const targetName = detectNamedTarget(task);
  const petReference = targetName ?? "tu mascota";

  switch (verb) {
    case "banar":
      return [
        createStep("1", `Prepara la toalla, el champú y la zona donde vas a bañar a ${petReference}.`),
        createStep("2", `Baña a ${petReference} con calma, empezando por una parte sencilla.`),
        createStep("3", `Sécalo bien y déjalo cómodo al terminar.`),
      ];

    case "pasear":
    case "sacar":
      return [
        createStep("1", `Prepara la correa o lo necesario para salir con ${petReference}.`),
        createStep("2", `Haz primero el paseo o la salida principal sin pensar todavía en más.`),
        createStep("3", `Vuelve, deja a ${petReference} tranquilo y cierra la tarea.`),
      ];

    case "cepillar":
      return [
        createStep("1", `Prepara el cepillo y deja a ${petReference} en un sitio tranquilo.`),
        createStep("2", `Cepilla primero una zona pequeña para empezar con calma.`),
        createStep("3", `Termina lo principal y deja todo recogido al acabar.`),
      ];

    case "alimentar":
      return [
        createStep("1", `Prepara la comida y el cuenco de ${petReference}.`),
        createStep("2", `Déjale la comida lista y comprueba que todo está bien.`),
        createStep("3", `Recoge lo imprescindible y da la tarea por cerrada.`),
      ];

    default:
      return [
        createStep("1", `Prepara lo necesario antes de empezar con ${petReference}.`),
        createStep("2", `Haz primero la parte principal de la tarea sin complicarla.`),
        createStep("3", `Deja a ${petReference} atendido y cierra lo esencial.`),
      ];
  }
}

function buildSteps(task: Task, category: BreakdownCategory): BreakdownStep[] {
  const verb = detectTaskVerb(task);

  switch (category) {
    case "home":
      return buildHomeSteps(verb);
    case "pet_care":
      return buildPetCareSteps(task, verb);
    case "writing":
      return [
        createStep("1", "Revisa qué parte concreta quieres trabajar ahora."),
        createStep("2", "Reúne el material o las ideas mínimas que necesitas."),
        createStep("3", "Haz un primer borrador breve sin buscar que quede perfecto."),
      ];
    case "study":
      return [
        createStep("1", "Decide qué bloque o apartado vas a tocar primero."),
        createStep("2", "Lee o repasa solo esa parte con calma."),
        createStep("3", "Deja una idea resumida o una anotación breve para fijarlo."),
      ];
    case "admin":
      return [
        createStep("1", "Abre el canal, formulario o documento que necesites."),
        createStep("2", "Reúne o completa solo la información principal."),
        createStep("3", "Revisa lo esencial y deja cerrada la gestión."),
      ];
    case "preparation":
      return [
        createStep("1", "Aclara qué resultado quieres conseguir con esta tarea."),
        createStep("2", "Prepara lo necesario para empezar sin fricción."),
        createStep("3", "Haz la primera parte concreta y deja visible la siguiente."),
      ];
    case "generic":
    default:
      return [
        createStep("1", "Aclara cuál es la primera parte real de esta tarea."),
        createStep("2", "Prepara lo mínimo que necesitas para empezar."),
        createStep("3", "Haz una primera parte pequeña y concreta."),
      ];
  }
}

function createStep(id: string, text: string): BreakdownStep {
  return { id, text };
}