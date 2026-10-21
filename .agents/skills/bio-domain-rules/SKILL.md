---
name: bio-domain-rules
description: Lógica de negocio de BioSanctuary OS: gestión de recintos, fauna silvestre, bitácoras de alimentación, estados y roles RBAC.
---

# Lógica de Negocio y Entidades del Dominio

## Entidades Principales
1. **`Enclosure` (Recintos)**:
   - Estados: `OPTIMAL`, `MAINTENANCE_REQUIRED`, `UNDER_REPAIR`, `QUARANTINE_LOCKED`.
   - Biomas: `JUNGLE`, `AQUATIC`, `SAVANNA`, `DESERT`, `FOREST`.
   - **Regla crítica**: Si `operational_status` es `UNDER_REPAIR` o `QUARANTINE_LOCKED`, está prohibido asignar nuevos especímenes (retornar `409 Conflict`).
   - **Regla de capacidad**: No permitir inserciones si el conteo actual de especímenes es >= `capacity`.

2. **`Specimen` (Fauna)**:
   - Estados: `QUARANTINE`, `REHABILITATION`, `PERMANENT_RESIDENT`, `READY_FOR_RELEASE`.
   - Todo nuevo ingreso entra por defecto en estado `QUARANTINE`.
   - Microchip es opcional pero debe ser único si se ingresa.

3. **`FeedingLog` (Alimentación)**:
   - Tipos: `REGULAR_FEEDING`, `MEDICAL_TREATMENT`, `EMERGENCY_SUPPLEMENT`.
   - Requiere `keeper_id` y porciones en gramos mayores a cero.

## Matriz de Roles
- Solo `DIRECTOR_ADMIN` y `FACILITY_LEAD` pueden alterar el estado operativo de los recintos.
- Solo `DIRECTOR_ADMIN` y `VET_OFFICER` pueden cambiar el estado clínico de un espécimen.
- `ZOOKEEPER` puede registrar bitácoras de alimentación y listar animales.

