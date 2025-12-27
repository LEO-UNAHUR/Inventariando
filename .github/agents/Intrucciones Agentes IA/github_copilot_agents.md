# Sistema de Agentes Profesionales - GitHub Copilot
## Ecosistema Multi-Rol para Desarrollo de Software Factory

---

# Agentes — referencia canónica movida a /agents/

Este archivo se mantiene por compatibilidad histórica. La fuente canónica y los archivos individuales por rol están ahora en la carpeta `agents/` en la raíz del repositorio.



Recomendación:
- Usar `agents/` como fuente canónica para automatización y edición.
- Mantener este archivo como referencia si es necesario, o eliminarlo cuando estés listo para limpiar el repo.

Si deseas que sincronice o elimine los archivos duplicados en `.github/agents/`, responde `eliminar` o `sincronizar`.

    │  (Validación entre roles)│
    └──────────────────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │   READY FOR PRODUCTION   │
    └──────────────────────────┘
```

---

## 📝 EJEMPLO DE USO REAL - DESARROLLO DE FEATURE

### Paso 1: CTO solicita al PM
```
@PM: Necesito implementar un sistema de notificaciones push en la app Android. 
Los usuarios deben recibir notificaciones cuando:
1. Hay una nueva oferta especial
2. Se confirma su pedido
3. El pedido está en camino

Timeline: 2 semanas
Importante: Debe integrarse con nuestro backend existente
```

### Paso 2: PM devuelve análisis y asignaciones
```
ANÁLISIS DEL PM:

User Stories:
1. Como usuario, quiero recibir notificaciones de ofertas, para no perder oportunidades de compra
2. Como usuario, quiero saber el estado de mi pedido mediante notificaciones
3. Como administrador, quiero enviar notificaciones a usuarios específicos

Sprint Planning: 2 semanas (10 puntos)

ASIGNACIÓN DE TAREAS:

@DEV:
- Tarea 1: Implementar integración con Firebase Cloud Messaging (FCM)
- Tarea 2: Crear estructura de notificaciones en BD
- Tarea 3: Endpoints en backend para disparar notificaciones
Estimado: 5 días

@DESIGN:
- Tarea 1: Diseñar UI de notificaciones
- Tarea 2: Especificar interacciones
Estimado: 2 días

@DEVOPS:
- Tarea 1: Configurar credenciales FCM en producción
- Tarea 2: Monitoreo de push notifications
Estimado: 1 día

@QA:
- Tarea 1: Plan de testing (múltiples escenarios)
- Tarea 2: Testing en dispositivos reales
Estimado: 3 días
```

### Paso 3: Cada rol trabaja con sus indicaciones específicas
```
@DEV: Implementa las tareas del desglosamiento con este contexto...
@DESIGN: Diseña la UI de notificaciones siguiendo nuestro Design System...
@DEVOPS: Configura FCM en producción y monitoreo...
@QA: Valida según plan de testing...
```

---

## 🎯 MEJORES PRÁCTICAS PARA USAR ESTE SISTEMA

### 1. Mantén Contexto Persistente
Cuando inicies sesión, proporciona contexto general:
```
CONTEXTO DEL PROYECTO:
- Stack Android: Kotlin + Jetpack Compose + MVVM
- Stack Web: React + TypeScript + Tailwind
- Backend: Node.js + Express
- BD: PostgreSQL
- Cloud: AWS
```

### 2. Usa Nomenclatura Consistente
- `@PM` para Project Manager
- `@DEV` para Developer
- `@DESIGN` para Designer
- `@DEVOPS` para DevOps Engineer
- `@QA` para QA Engineer

### 3. Proporciona Contexto Siempre
Cada solicitud debe incluir:
- Qué se necesita
- Por qué se necesita
- Cuándo se necesita
- Restricciones conocidas

### 4. Iteración Entre Roles
Los roles pueden comunicarse entre sí:
```
@DEV: @DESIGN, ¿es viable técnicamente el efecto hover que propusiste?
@DESIGN: @DEV, ¿cuál es el máximo de elementos que puede renderizar la lista?
@DEVOPS: @DEV, ¿qué tamaño de imágenes manejamos para optimizar caché?
```

### 5. Documentación Compartida
Mantén un documento con:
- Decisiones técnicas
- Arquitectura definida
- Stack elegido
- Patrones a seguir
- Links a documentación

---

## 🔐 NOTAS IMPORTANTES

1. **Coherencia**: Asegúrate de que el contexto sea consistente entre agentes
2. **Especialización**: Cada agente sabe su rol, no salgas de competencias
3. **Feedback Loop**: Los agentes deben validar entre sí (DEV valida diseños, etc)
4. **Documentación**: Cada entrega debe ser documentada para referencia futura
5. **Escalabilidad**: Este sistema funciona para 1-2 features en paralelo; para más, necesitarías mejor seguimiento

---

## 📚 PLANTILLAS DE PROMPTS RÁPIDOS

### Para el PM (recibir nuevos requerimientos)
```
@PM: [Descripción del requerimiento]
Context: [Detalles relevantes]
Target: [Fecha objetivo]
Audience: [Quiénes lo usarán]

Breakdown completo, por favor.
```

### Para el DEV (recibir tareas)
```
@DEV: Tarea - [Nombre]
From PM:
- US: [copia del PM]
- AC: [lista de criterios]
- Plataforma: [Android/Web]
- Dependencies: [qué necesita del backend/APIs]

Estructura + timeline, por favor.
```

### Para el DESIGN (nuevas pantallas)
```
@DESIGN: Pantalla - [Nombre]
Reqs: [del PM]
Usuarios: [quiénes]
Comportamiento: [qué debe hacer]
Componentes existentes: [qué puedo reutilizar del DS]

Wireframe + specs técnicas, por favor.
```

### Para DEVOPS (nuevas features con reqs infra)
```
@DEVOPS: Feature - [Nombre]
Tech stack: [componentes involucrados]
Scale: [usuarios, traffic esperado]
Security: [reqs especiales]
Go-live: [fecha]

Arquitectura + pipeline CI/CD, por favor.
```

### Para QA (validación)
```
@QA: Feature - [Nombre]
Specs: [del PM]
Platforms: [Android/Web/ambos]
Devices/Browsers: [especificar]
Regression scope: [qué features previas afecta]

Plan de testing completo, por favor.
```

---

## 💡 TIPS DE PRODUCTIVIDAD

1. **Crea archivos de configuración** con contexto del proyecto en tu workspace
2. **Usa comentarios en código** para referenciar decisiones del PM/Design
3. **Mantén un backlog vivo** donde el PM actualice prioridades
4. **Sincróniza diariamente** revisando outputs de cada agente
5. **Documenta todo** - serás tu propio documentalista