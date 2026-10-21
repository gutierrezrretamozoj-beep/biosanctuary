---
name: idempotency-handler
description: Guía de implementación del patrón de idempotencia con header Idempotency-Key para endpoints POST críticos.
---

# Patrón de Idempotencia Obligatorio

## Operaciones Sujetas a Idempotencia
1. `POST /api/v1/specimens` (Registro de fauna rescatada / microchips).
2. `POST /api/v1/feeding-logs` (Registro de porciones de alimento / medicación).

## Protocolo de Ejecución
Cada vez que implementes o edites estos endpoints, debes seguir este flujo:
1. **Extracción y Validación de Header**:
   - Leer `request.headers.get('idempotency-key')`.
   - Si no existe, responder inmediatamente con `HTTP 400 Bad Request` indicando que el header es obligatorio.
2. **Verificación de Clave**:
   - Consultar si la clave ya existe en la tabla `idempotency_keys` del schema del tenant (o en Redis).
   - Si existe y `expires_at > NOW()`: responder de inmediato con el `response_code` y `response_body` almacenados originalmente. **No reejecutar la lógica de negocio ni inserciones**.
3. **Ejecución y Persistencia**:
   - Si no existe: procesar la transacción del dominio.
   - Guardar el resultado en `idempotency_keys` con un tiempo de expiración (TTL) de 24 horas (`NOW() + interval '24 hours'`).
   - Retornar la respuesta generada (`201 Created`).