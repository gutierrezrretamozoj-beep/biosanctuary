---
name: multitenant-isolation
description: Reglas estrictas de aislamiento de datos PostgreSQL por schema dinámico (schema-per-tenant). Usar al crear queries, endpoints API o servicios de base de datos.
---

# Reglas de Aislamiento Multitenant (BioSanctuary OS)

## Contexto Arquitectónico
- La base de datos es PostgreSQL (Supabase).
- Existe un schema compartido: `public` (exclusivo para `tenants`, `users`, `transfer_requests`, `network_messages`).
- Cada santuario posee un schema independiente: `tenant_<slug>` (donde residen `enclosures`, `specimens`, `feeding_logs`, `idempotency_keys`).

## Instrucciones de Implementación
1. **Nunca violar el aislamiento**: Jamás consultes tablas de un tenant desde el schema de otro tenant ni intentes hacer joins cross-schema no autorizados.
2. **Conmutación de Schema en cada Petición**:
   - Todo endpoint en `/api/v1/*` debe extraer el schema del tenant desde el middleware (header `x-tenant-schema`).
   - Siempre ejecuta las consultas mediante `getTenantQueryRunner(schemaName)` aplicando:
     ```sql
     SET search_path TO "tenant_<slug>", public;
     ```
3. **Aprovisionamiento Transaccional**:
   - Al registrar un nuevo santuario, invoca siempre la función PostgreSQL `public.provision_new_tenant(...)`.
   - No intentes crear tablas manualmente fuera del aprovisionador para evitar inconsistencias en el DDL.