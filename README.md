# Albedrío

Albedrío es una aplicación móvil multiplataforma orientada a la productividad personal cotidiana. Su objetivo no es limitarse a registrar tareas, sino ayudar al usuario a pasar del bloqueo a la acción mediante una experiencia clara, visual y centrada en la ejecución.

El proyecto se desarrolla como Trabajo Fin de Grado (TFG) del CFGS de Desarrollo de Aplicaciones Multiplataforma (DAM).

## Propuesta de valor

Albedrío parte de una idea sencilla: muchas personas no tienen problemas para anotar tareas, pero sí para decidir por dónde empezar, cómo aterrizar una tarea amplia o qué acción conviene realizar ahora.

Por ello, la aplicación combina una base funcional de gestión de tareas con una capa de apoyo orientada a la ejecución. Su propuesta de valor se apoya en tres diferenciadores principales:

- **Descomposición de tareas**, para convertir objetivos amplios o difusos en pasos concretos y manejables.
- **Modo anti-bloqueo**, para ofrecer una versión mínima y viable de una tarea cuando el usuario no sabe cómo empezar.
- **Siguiente acción recomendada**, para sugerir qué conviene hacer en función del contexto, el tiempo disponible y la energía.

## Funcionalidades principales

- Registro e inicio de sesión de usuarios
- Persistencia de sesión
- Gestión de tareas personales
- Edición, eliminación y completado de tareas
- Persistencia de datos por usuario
- Seguimiento del progreso diario
- Visualización de constancia y rachas
- Descomposición de tareas
- Modo anti-bloqueo
- Recomendación de siguiente acción
- Interfaz móvil con identidad visual propia

## Stack tecnológico

### Frontend
- React Native
- Expo
- Zustand
- TypeScript

### Backend y datos
- Supabase
- PostgreSQL

### Otras herramientas
- Visual Studio Code
- Git
- GitHub
- GitHub Projects
- Excalidraw
- EAS Build

## Estructura del proyecto

```text
Albedrio/
├── apps/
│   └── mobile/
│       ├── assets/
│       ├── src/
│       ├── app.json
│       ├── eas.json
│       ├── package.json
│       └── ...
├── supabase/
│   └── backup/
│       ├── README.md
│       ├── schema.sql
│       ├── roles.sql
│       └── data.safe.sql
├── README.md
└── ...
```

## Ejecución en entorno local:
### Requisitos:
- Git instalado.
- Node.js y npm instalados.
- Visual Studio Code o editor equivalente.
- Acceso al repositorio.
- Variables de entorno de Supabase y Google configuradas.

## Pasos:
- Clonar el repositorio: 
git clone https://github.com/jerssongamboa04/Albedrio.git 

- Entrar en la carpeta del proyecto:
```text 
cd Albedrio
``` 
```text
 cd apps/mobile
``` 


- Instalar dependencias:
```text
 npm install
``` 

- Crear el archivo .env dentro de apps/mobile con, al menos, estas variables:
```text
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica_de_supabase
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=tu_google_web_client_id
``` 

- Iniciar el entorno de desarrollo:
```text
 npx expo start 
```
## Despliegue en Android:
El proyecto utiliza Expo Application Services (EAS) Internal Distribution para generar builds instalables en Android fuera del entorno de desarrollo.

### Pasos básicos: 
- Acceder a la carpeta de la app:
```text
cd Albedrio
cd apps/mobile
```
- Iniciar sesión en Expo: 
```text
eas login 
```

- Lanzar la build Android: 
```text
eas build --platform android --profile preview
```
- Instalar la APK desde el enlace generado por Expo.

## Despliegue futuro en iOS:
Aunque Albedrío se ha desarrollado como aplicación multiplataforma, la validación funcional del despliegue se ha priorizado sobre Android. En iOS, la distribución de aplicaciones requiere una cuenta del Apple Developer Program y una configuración adicional de firma y aprovisionamiento. Por ello, el despliegue en iOS se plantea como una línea de evolución futura del proyecto.

## Backup de base de datos:
El repositorio incluye una copia lógica parcial de la base de datos en la carpeta supabase/backup.
### Archivos incluidos: 
- schema.sql: estructura de la base de datos.
- roles.sql: configuración de roles y permisos.
- data.safe.sql: datos ficticios y seguros de ejemplo. 

## Estado actual del proyecto:
Actualmente, Albedrío dispone de una base funcional consolidada, con autenticación, persistencia de datos, gestión de tareas, progreso diario y validación en dispositivo Android real. Sobre esta base, el proyecto incorpora además las funciones diferenciales orientadas a reducir el bloqueo y facilitar la ejecución.