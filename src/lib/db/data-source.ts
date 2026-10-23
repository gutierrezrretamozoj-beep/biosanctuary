import "reflect-metadata";
import { DataSource, QueryRunner } from "typeorm";
import { Tenant } from "./entities/Tenant";
import { User } from "./entities/User";
import { Enclosure, Specimen, FeedingLog } from "./entities/TenantDomain";

const directUrl = (
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  ""
).trim();

declare global {
  // eslint-disable-next-line no-var
  var __appDataSource: DataSource | undefined;
  // eslint-disable-next-line no-var
  var __appDataSourcePromise: Promise<DataSource> | undefined;
}

export const AppDataSource =
  globalThis.__appDataSource ||
  new DataSource({
    type: "postgres",
    url: directUrl,
    ssl: { rejectUnauthorized: false },
    synchronize: false,
    logging: process.env.NODE_ENV === "development" ? ["error", "warn"] : false,
    entities: [Tenant, User, Enclosure, Specimen, FeedingLog],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__appDataSource = AppDataSource;
}

/**
 * Retorna la instancia singleton de TypeORM DataSource asegurando su inicialización de forma segura
 * ante llamadas concurrentes.
 */
export async function getDataSource(): Promise<DataSource> {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  if (globalThis.__appDataSourcePromise) {
    return globalThis.__appDataSourcePromise;
  }

  globalThis.__appDataSourcePromise = AppDataSource.initialize()
    .then((ds) => ds)
    .catch((error) => {
      globalThis.__appDataSourcePromise = undefined;
      throw error;
    });

  return globalThis.__appDataSourcePromise;
}

/**
 * Alias de conveniencia para obtener la conexión a base de datos inicializada.
 */
export async function getDatabaseConnection(): Promise<DataSource> {
  return getDataSource();
}

/**
 * Inicializa un QueryRunner dedicado y conmuta el search_path al schema del tenant solicitado.
 * Cumple con el aislamiento Schema-per-Tenant de BioSanctuary OS.
 * 
 * @param schemaName Nombre del schema del tenant (ej: 'tenant_amazonia_wild')
 */
export async function getTenantQueryRunner(
  schemaName: string
): Promise<QueryRunner> {
  const ds = await getDataSource();
  const queryRunner = ds.createQueryRunner();
  await queryRunner.connect();

  // Sanitizar el nombre del schema para garantizar identificador SQL seguro
  const safeSchema = schemaName.replace(/[^a-zA-Z0-9_]/g, "");
  await queryRunner.query(`SET search_path TO "${safeSchema}", public;`);

  return queryRunner;
}
