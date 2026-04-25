# Backup de base de datos de Albedrio

Esta carpeta contiene una copia lógica parcial de la base de datos del proyecto, pensada para facilitar la comprensión técnica y la reproducibilidad del entorno.

## Archivos incluidos

- `schema.sql`: estructura de la base de datos exportada desde Supabase.
- `roles.sql`: definición de roles y configuración relacionada con permisos.
- `data.safe.sql`: conjunto mínimo de datos ficticios y seguros para pruebas o restauración orientativa.

## Archivo excluido por seguridad

El archivo `data.sql`, generado durante el proceso de backup, no se incluye en el repositorio porque contenía información real de autenticación, sesiones, perfiles y uso de la aplicación. Por motivos de privacidad y seguridad, ese archivo se mantiene solo en entorno local y está excluido mediante `.gitignore`.

## Finalidad

Este backup no pretende sustituir una restauración completa de producción, sino aportar una base técnica documentada del modelo de datos utilizado en el MVP de Albedrio.