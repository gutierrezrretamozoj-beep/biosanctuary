---
name: ratelimit-engine
description: Reglas y headers de limitación de tasa (Rate Limiting) con algoritmo de ventana deslizante y respuesta HTTP 429 Retry-After.
---

# Rate Limiting Engine

## Políticas de Límite
- **Autenticación (`/api/auth/login`)**: Máximo 5 intentos por IP cada 15 minutos (900s).
- **Creación en Dominio (`POST /api/v1/*`)**: Máximo 30 peticiones por minuto por Tenant (usar `x-tenant-id`).
- **Endpoints de IA / Red**: Límite de 10 peticiones por minuto.

## Requisitos de Respuesta HTTP 429
Al superar el umbral:
1. El código HTTP de respuesta **debe ser 429 (Too Many Requests)**.
2. La cabecera **`Retry-After`** es **estrictamente obligatoria**, indicando la cantidad de segundos restantes para desbloquear la ventana.
3. Payload JSON estándar:
   ```json
   {
     "error": "Límite de peticiones excedido para este santuario",
     "retryAfterSeconds": 30
   }
   ```
