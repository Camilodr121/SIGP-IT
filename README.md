# 🎓 SIGP-IT: Sistema Integrado de Gestión de Prácticas
### Facultad de Ingeniería de Telecomunicaciones — Universidad Santo Tomás (USTA)

---

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%205-1b2240?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Storage-Supabase-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![NextAuth](https://img.shields.io/badge/Auth-NextAuth.js-000?style=flat-square&logo=next.js)](https://next-auth.js.org/)

---

## 📋 Descripción General

**SIGP-IT** (Sistema Integrado de Gestión de Prácticas de Ingeniería de Telecomunicaciones) es una plataforma web premium diseñada para centralizar, agilizar y supervisar el ciclo de vida completo de las prácticas profesionales de los estudiantes de la **Universidad Santo Tomás**. 

El sistema reemplaza los procesos tradicionales basados en correos electrónicos y formatos impresos por un workflow digital automatizado y transparente. A través de una interfaz interactiva moderna y con altos estándares estéticos (efectos de glassmorphism, partículas estáticas dinámicas y diseño adaptativo en modo oscuro), **SIGP-IT** conecta a tres actores fundamentales:

1. **Estudiante:** Quien gestiona su perfil, hace seguimiento a sus fechas límite, sube informes bimestrales y descarga su certificado final de prácticas.
2. **Empresa (Supervisor Externo):** Representante de la organización aliada que valida, retroalimenta y aprueba el desempeño laboral del practicante.
3. **Universidad (Coordinador de Prácticas):** Administrador del programa que crea los vínculos de prácticas, valida la documentación oficial de cada una de las fases y emite certificados con validez institucional.

---

## 🔄 Flujo Metodológico de Prácticas (Las 5 Fases)

La práctica profesional en la Facultad de Ingeniería de Telecomunicaciones está estructurada en **5 fases secuenciales**. Cada fase requiere la entrega de documentos específicos y su respectiva aprobación conjunta (Empresa y Universidad) para poder desbloquear la fase subsiguiente.

```mermaid
graph TD
    A[Fase 1: Iniciación] -->|Aprobado| B[Fase 2: Primer Informe]
    B -->|Aprobado| C[Fase 3: Segundo Informe]
    C -->|Aprobado| D[Fase 4: Tercer Informe]
    D -->|Aprobado| E[Fase 5: Informe Final]
    E -->|Aprobación Final| F[Generación de Certificado PDF]
    style A fill:#4f6ef7,stroke:#fff,stroke-width:2px,color:#fff
    style B fill:#9370f7,stroke:#fff,stroke-width:2px,color:#fff
    style C fill:#f5a623,stroke:#fff,stroke-width:2px,color:#fff
    style D fill:#f48220,stroke:#fff,stroke-width:2px,color:#fff
    style E fill:#34c97a,stroke:#fff,stroke-width:2px,color:#fff
    style F fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff
```

### Detalle cronológico y entregables:

| Fase | Nombre en Sistema | Plazo / Cronograma Esperado | Tipo de Entregables Requeridos |
|---|---|---|---|
| **Fase 1** | `INICIACION` | Al inscribirse o iniciar la práctica | Acta de inicio, carta de presentación, afiliación a ARL y convenio legal firmado. |
| **Fase 2** | `INFORME_1` | 2 meses de ejecución transcurridos | Primer informe bimestral detallando actividades de telecomunicaciones y redes. |
| **Fase 3** | `INFORME_2` | 4 meses de ejecución transcurridos | Segundo informe de avance, estado de objetivos y bitácora técnica de campo. |
| **Fase 4** | `INFORME_3` | 6 meses de ejecución transcurridos | Tercer informe de avance, consolidado de actividades finales de ingeniería. |
| **Fase 5** | `INFORME_FINAL` | 15 días hábiles tras el tercer informe | Informe final de prácticas, autoevaluación y formato de evaluación final firmado. |

---

## 👥 Manual de Operación y Roles

### 1. Rol: Estudiante 🧑‍🎓

El módulo del estudiante está enfocado en facilitar el registro de datos académicos y simplificar el proceso de carga de evidencias de su práctica profesional.

#### A. Registro y Completar Perfil
- Al crear una cuenta en el sistema (`/auth/register`), el estudiante debe seleccionar la opción **"Estudiante"**.
- Tras el primer inicio de sesión, debe dirigirse a la sección **Mi Perfil** para rellenar campos obligatorios que la universidad requiere para los convenios:
  - **Código USTA:** Código único de estudiante de 9 dígitos.
  - **Programa:** Programa académico (ej. *Ingeniería de Telecomunicaciones*).
  - **Semestre:** Semestre cursado actual.
  - **Teléfono de contacto:** Teléfono móvil activo.

#### B. Flujo de Mi Práctica
- **Asignación Inicial:** El panel del estudiante mostrará *"Sin práctica activa"* hasta que el Coordinador de la Universidad lo vincule formalmente con una empresa en la base de datos.
- **Línea de Tiempo de Fases:** Una vez asignado, se despliega una línea de tiempo interactiva con las 5 fases.
- **Carga de Documentos:**
  1. El estudiante da clic en la fase desbloqueada (indicada con color brillante).
  2. Presiona el botón **"Subir documento"**.
  3. En la ventana modal emergente, ingresa un título descriptivo, añade una breve descripción de los entregables y selecciona el archivo en formato **PDF** (límite recomendado: 10MB).
  4. El archivo se sube automáticamente a Supabase Storage y su estado inicial se establece como `PENDIENTE`.
- **Revisión y Correcciones:**
  - Si el Supervisor de la Empresa o el Coordinador de la Universidad rechazan un documento, el estado cambiará a `RECHAZADO` y se visualizará el icono 💬 junto con las observaciones y correcciones sugeridas. El estudiante deberá subir una versión corregida en la misma fase.
  - Si ambos actores aprueban el documento, el estado cambiará a `APROBADO` (color verde), desbloqueando inmediatamente el botón para la siguiente fase.

#### C. Descarga del Certificado
- Al completar con éxito la **Fase 5 (Informe Final)** y ser aprobado por la coordinación, se habilita una opción destacada en el panel de inicio para descargar el **Certificado de Prácticas Profesional en PDF**.
- Este PDF se genera dinámicamente usando `@react-pdf/renderer` e incorpora datos oficiales, logomarca de la USTA, horas acreditadas y firmas autorizadas.

---

### 2. Rol: Empresa (Supervisor Externo) 🏢

El supervisor externo cuenta con herramientas para monitorizar de cerca a los practicantes asignados a su organización y firmar digitalmente las entregas de informes bimestrales.

#### A. Configuración Corporativa
- En el registro, se selecciona el rol de **"Empresa"**.
- En la sección **Perfil**, el representante debe ingresar los datos de identificación corporativa:
  - **Nombre de la Empresa / Razón Social**
  - **NIT:** Número de Identificación Tributaria único de la compañía.
  - **Sector:** Sector económico (Telecomunicaciones, TI, Redes, Software, etc.).
  - **Ciudad:** Ubicación donde el estudiante realiza las labores presenciales/híbridas.
  - **Teléfono de contacto corporativo**

#### B. Supervisión de Practicantes
- El dashboard de la empresa muestra la lista de practicantes asignados actualmente.
- En la pestaña de **Practicantes**, se detalla qué estudiantes están activos, sus correos y su descripción de cargo (ej. *Auxiliar de Soporte de Redes, Diseñador de Fibra Óptica*).

#### C. Evaluación y Aprobación de Reportes
- En la pestaña **Reportes**, el supervisor tiene acceso a los documentos subidos por los practicantes que están en estado `PENDIENTE`.
- Al hacer clic en un reporte, puede:
  1. Abrir y revisar el documento PDF directamente en el navegador con el enlace externo.
  2. Si el desempeño es satisfactorio y los entregables coinciden con el trabajo realizado, presionar **"Aprobar"** (cambia el estado del documento a aprobado y notifica al estudiante y coordinador).
  3. Si requiere correcciones, presionar **"Rechazar"** e ingresar las observaciones en el campo de texto de retroalimentación.
- **Estadísticas de Retención:** La empresa tiene acceso a un módulo analítico que calcula su tasa interna de contratación (porcentaje de practicantes vinculados laboralmente a término indefinido tras finalizar sus prácticas).

---

### 3. Rol: Universidad (Coordinador) 🎓

El Coordinador de la Universidad posee los máximos privilegios dentro del flujo operativo de prácticas, actuando como el gestor central de la plataforma.

#### A. Panel de Control y KPI Ejecutivos
Al iniciar sesión, el coordinador visualiza un panel administrativo con analíticas en tiempo real (desarrolladas con `Recharts`):
- **Estudiantes Registrados:** Total de alumnos en el sistema y cuántos ya cuentan con perfil.
- **Empresas Asociadas:** Total de aliados estratégicos.
- **Prácticas Activas:** Prácticas profesionales en ejecución simultánea.
- **Tasa de Contratación:** Indicador clave de empleabilidad que mide cuántos estudiantes quedaron contratados laboralmente tras culminar su práctica.

#### B. Gestión de Usuarios y Creación de Perfiles
- **Creación de Perfiles Pendientes:** Si un estudiante o empresa se registra pero no completa su perfil, el coordinador puede dar clic en **"Crear perfil"** desde la pestaña de *Resumen* para registrar manualmente sus códigos, semestres o NITs corporativos.
- **Creación de Organizaciones:** El coordinador puede crear perfiles de empresas aliadas de forma directa para agilizar la base de datos de convenios.

#### C. Asignación de Prácticas profesionales (Vincular Alumno - Empresa)
- Para iniciar un flujo de prácticas, el coordinador da clic en **"Nueva práctica"** en el panel superior:
  1. Selecciona al estudiante (solo aparecerán aquellos que tienen perfil completo y no tienen prácticas activas).
  2. Selecciona la empresa receptora (solo aquellas con perfil de empresa completo).
  3. Establece la **Fecha de Inicio** oficial del convenio.
  4. Ingresa una descripción del cargo (ej. *Analista de Datos y Enlaces de Telecomunicación*).
  5. Envía el formulario. El sistema crea el registro e inicializa la **Fase 1 (Iniciación)** de forma automática.

#### D. Auditoría de Entregables y Cierre de Práctica
- El coordinador audita periódicamente la pestaña **Documentos** donde se listan los PDFs de todos los estudiantes de la facultad.
- **Aprobación Final:** El coordinador tiene la última palabra sobre las fases. Al aprobar el documento de un alumno en la fase final (`INFORME_FINAL`), la práctica puede darse por culminada.
- **Cierre y Empleabilidad:** Al finalizar una práctica, el coordinador hace clic en:
  - **"Finalizar":** Cierra la práctica con éxito.
  - **"Finalizó + Contrató":** Cierra la práctica y marca al estudiante como contratado en la empresa. Esto actualiza automáticamente la tasa de empleabilidad global de la facultad.
- **Certificación:** Una vez cerrada la práctica, el coordinador firma digitalmente y habilita la descarga automática del certificado institucional en el perfil del alumno.

---

## 🛠️ Arquitectura y Stack Tecnológico

El proyecto está diseñado bajo un modelo monolítico moderno y escalable utilizando el ecosistema de JavaScript:

- **Estructura y Frontend:** [Next.js 14](https://nextjs.org/) (Pages Router) con soporte completo de TypeScript.
- **Estilos y Visuales:** Tailwind CSS para layouts responsivos estructurados, y Vanilla CSS con animaciones optimizadas a nivel de GPU para fondos, estrellas flotantes sutiles y tarjetas transparentes de vidrio (glassmorphism).
- **Controlador de Base de Datos:** PostgreSQL alojado de manera segura en [Supabase DB](https://supabase.com/).
- **Mapeo de Datos:** [Prisma ORM](https://www.prisma.io/) con tipado estricto e integraciones nativas para transacciones asíncronas de base de datos.
- **Seguridad y Autenticación:** [NextAuth.js](https://next-auth.js.org/) con persistencia de sesiones seguras por Cookies y encriptación de contraseñas mediante `bcryptjs`.
- **Carga de Archivos:** API de Next.js integrada con `formidable` para parses multipartes y cliente de almacenamiento para persistencia en **Supabase Storage buckets**.
- **Reportes Visuales:** `recharts` para diagramas analíticos circulares y de barras.
- **Documentos Oficiales:** `@react-pdf/renderer` para renderizado dinámico de archivos PDF.

---

## 🚀 Guía de Instalación y Configuración Local

Sigue estos pasos detallados para configurar y desplegar el entorno de desarrollo local de **SIGP-IT** en tu sistema Windows u otro sistema operativo:

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Camilodr121/SIGP-IT.git
cd sigp-it
```

### 2. Configurar las Variables de Entorno (`.env.local`)
Crea un archivo `.env.local` en la raíz del proyecto. Este archivo contiene las credenciales de conexión necesarias para conectarse a Supabase y NextAuth. Utiliza la siguiente estructura:

```env
# URL de NextAuth (En desarrollo local)
NEXTAUTH_URL="http://localhost:3000"

# Secreto de NextAuth (Generar una cadena aleatoria robusta)
NEXTAUTH_SECRET="tu_secreto_aleatorio_muy_largo"

# Credenciales de Base de Datos Postgres (Supabase) con soporte de Pooler
DATABASE_URL="postgresql://postgres.[referencia]:[password]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[referencia]:[password]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

# Credenciales de API y Storage de Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[referencia_proyecto].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_anon_public_key"
SUPABASE_SERVICE_ROLE_KEY="tu_service_role_key"
```

### 3. Instalar Dependencias
Se recomienda utilizar `npm` o `yarn` para descargar e instalar los paquetes descritos en el `package.json`:
```bash
npm install
```

### 4. Generar el Cliente de Prisma e Inicializar la Base de Datos
Prisma requiere leer la estructura del archivo `prisma/schema.prisma` para mapear los objetos en la base de datos de PostgreSQL:

```bash
# Genera el cliente tipado de Prisma
npx prisma generate

# Sincroniza la estructura de datos local con la base de datos remota
npx prisma db push
```

### 5. Iniciar el Servidor de Desarrollo
Lanza el servidor local de Next.js:
```bash
npm run dev
```

El sistema estará disponible en [http://localhost:3000](http://localhost:3000). Abre este enlace en tu navegador web.

---

## 🗄️ Modelo de Datos (Esquema de Prisma)

El archivo `prisma/schema.prisma` gestiona las siguientes relaciones estructuradas de base de datos:

- **User:** Almacena credenciales, correos y asigna el rol principal (`ESTUDIANTE`, `EMPRESA`, `UNIVERSIDAD`).
- **PerfilEstudiante:** Relaciona a un `User` con sus datos académicos y una lista de prácticas históricas asignadas.
- **PerfilUniversidad:** Datos adicionales para el personal de coordinación académica.
- **PerfilEmpresa:** Registra detalles corporativos (NIT, Sector, Teléfono) y se vincula con las prácticas de los estudiantes.
- **Practica:** Entidad pivote que une al estudiante con la empresa receptora, definiendo fechas, roles, estado (`activa`) y estado laboral final (`quedoContratado`).
- **Documento:** Registra los reportes entregados por los alumnos en cada una de las prácticas. Guarda campos para URLs del archivo digital, estados de auditoría (`PENDIENTE`, `EN_REVISION`, `APROBADO`, `RECHAZADO`), comentarios y la fase correspondiente (`TipoDocumento`).
- **Notificacion:** Gestión de alertas internas y avisos en tiempo real para todos los usuarios.

---

## 🧪 Pruebas y Validación de Calidad

Para validar el sistema antes del despliegue en entornos de producción (ej. Vercel), ejecuta el formateador y el compilador de TypeScript para comprobar la integridad del código:

```bash
# Ejecutar Linter para análisis estático
npm run lint

# Validar compilación de producción y generación de archivos Next.js
npm run build
```

---

## 🌐 Despliegue en Producción (Vercel)

El proyecto está optimizado para desplegarse fácilmente en **Vercel**:
1. Conecta tu repositorio de GitHub con tu cuenta de Vercel.
2. Agrega las variables de entorno detalladas en la sección **2** (Configuración local) dentro de la configuración del proyecto en Vercel.
3. El script de despliegue ejecutará automáticamente `prisma generate && next build` para asegurar el tipado correcto de la base de datos en tiempo de ejecución.
