const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('--- Connecting to PostgreSQL server ---');
  const rootClient = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: '192820',
    database: 'postgres'
  });
  await rootClient.connect();

  const dbRes = await rootClient.query("SELECT 1 FROM pg_database WHERE datname = 'biosanctuary'");
  if (dbRes.rows.length === 0) {
    await rootClient.query('CREATE DATABASE biosanctuary');
    console.log('Created database: biosanctuary');
  } else {
    console.log('Database biosanctuary already exists');
  }
  await rootClient.end();

  console.log('--- Setting up biosanctuary schema and tables ---');
  const dbClient = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: '192820',
    database: 'biosanctuary'
  });
  await dbClient.connect();

  // Extension for UUIDs
  await dbClient.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

  // 1. Table public.tenants
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS public.tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      schema_name VARCHAR(63) UNIQUE NOT NULL,
      allow_network_collaboration BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  // 2. Table public.users
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS public.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  // 3. Table public.transfer_requests
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS public.transfer_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      from_tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
      to_tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
      species_name VARCHAR(255) NOT NULL,
      urgency VARCHAR(50) DEFAULT 'STANDARD',
      reason TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'PENDING',
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  // 4. Table public.network_messages
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS public.network_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      from_tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
      to_tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
      sender_user_id UUID NOT NULL,
      message TEXT NOT NULL,
      sent_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  // 5. Stored function: public.provision_new_tenant
  await dbClient.query(`
    CREATE OR REPLACE FUNCTION public.provision_new_tenant(
      p_name VARCHAR,
      p_slug VARCHAR,
      p_allow_collaboration BOOLEAN,
      p_admin_name VARCHAR,
      p_email VARCHAR,
      p_password_hash TEXT
    )
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      v_tenant_id UUID;
      v_user_id UUID;
      v_schema_name VARCHAR(63);
    BEGIN
      -- Sanitizar nombre de schema
      v_schema_name := 'tenant_' || replace(lower(p_slug), '-', '_');

      -- 1. Insertar Tenant
      INSERT INTO public.tenants (name, slug, schema_name, allow_network_collaboration, is_active)
      VALUES (p_name, lower(p_slug), v_schema_name, p_allow_collaboration, true)
      RETURNING id INTO v_tenant_id;

      -- 2. Insertar Usuario Administrador
      INSERT INTO public.users (tenant_id, email, password_hash, full_name, role, is_active)
      VALUES (v_tenant_id, lower(trim(p_email)), p_password_hash, p_admin_name, 'DIRECTOR_ADMIN', true)
      RETURNING id INTO v_user_id;

      -- 3. Crear Schema aislado
      EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', v_schema_name);

      -- 4. Crear tabla enclosures en el schema del tenant
      EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.enclosures (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          bioma_type VARCHAR(50) NOT NULL,
          operational_status VARCHAR(50) DEFAULT ''OPTIMAL'',
          capacity INT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      ', v_schema_name);

      -- 5. Crear tabla specimens en el schema del tenant
      EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.specimens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          enclosure_id UUID REFERENCES %I.enclosures(id) ON DELETE CASCADE,
          common_name VARCHAR(255) NOT NULL,
          scientific_name VARCHAR(255) NOT NULL,
          microchip_id VARCHAR(100) UNIQUE,
          rescue_status VARCHAR(50) DEFAULT ''QUARANTINE'',
          weight_kg NUMERIC(8,2) NOT NULL,
          arrival_date DATE NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      ', v_schema_name, v_schema_name);

      -- 6. Crear tabla feeding_logs en el schema del tenant
      EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.feeding_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          specimen_id UUID REFERENCES %I.specimens(id) ON DELETE CASCADE,
          keeper_id UUID NOT NULL,
          diet_type VARCHAR(50) DEFAULT ''REGULAR_FEEDING'',
          portion_grams NUMERIC(10,2) NOT NULL,
          diet_notes TEXT,
          fed_at TIMESTAMPTZ DEFAULT now()
        );
      ', v_schema_name, v_schema_name);

      -- 7. Crear tabla idempotency_keys en el schema del tenant
      EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.idempotency_keys (
          key VARCHAR(255) PRIMARY KEY,
          request_path VARCHAR(255) NOT NULL,
          response_code INT NOT NULL,
          response_body JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now(),
          expires_at TIMESTAMPTZ NOT NULL
        );
      ', v_schema_name);

      RETURN jsonb_build_object(
        'tenant_id', v_tenant_id,
        'user_id', v_user_id,
        'schema_name', v_schema_name
      );
    END;
    $$;
  `);

  console.log('Function public.provision_new_tenant registered.');

  // 6. Check if initial default tenant exists, if not provision Amazonia Wild with default admin!
  const existingTenant = await dbClient.query("SELECT id FROM public.tenants WHERE slug = 'amazonia-wild'");
  if (existingTenant.rows.length === 0) {
    const pwHash = await bcrypt.hash('Admin1234*', 10);
    const provRes = await dbClient.query(`
      SELECT public.provision_new_tenant(
        'Santuario Amazonia Wild',
        'amazonia-wild',
        true,
        'Dra. Mariana Cordero',
        'admin@amazonia.org',
        $1
      ) AS res
    `, [pwHash]);
    console.log('Provisioned default Amazonia Wild sanctuary:', provRes.rows[0].res);

    // Also insert initial enclosures and specimens in tenant_amazonia_wild
    await dbClient.query(`
      INSERT INTO tenant_amazonia_wild.enclosures (name, bioma_type, operational_status, capacity)
      VALUES 
        ('Recinto Selva Nubosa 1', 'JUNGLE', 'OPTIMAL', 6),
        ('Laguna Cristalina', 'AQUATIC', 'OPTIMAL', 8),
        ('Pradera de Acacias', 'SAVANNA', 'OPTIMAL', 5),
        ('Cañón Rocoso Árido', 'DESERT', 'OPTIMAL', 4),
        ('Bosque de Pinos Alpinos', 'FOREST', 'OPTIMAL', 6)
      RETURNING id, name;
    `);

    // Insert specimen in first enclosure
    const encRows = await dbClient.query('SELECT id FROM tenant_amazonia_wild.enclosures LIMIT 1');
    if (encRows.rows.length > 0) {
      const encId = encRows.rows[0].id;
      await dbClient.query(`
        INSERT INTO tenant_amazonia_wild.specimens (
          enclosure_id, common_name, scientific_name, microchip_id, rescue_status, weight_kg, arrival_date
        ) VALUES (
          $1, 'Jaguar Melánico', 'Panthera onca', 'RFID-AMZ-001', 'PERMANENT_RESIDENT', 68.5, CURRENT_DATE
        )
      `, [encId]);
      console.log('Inserted initial fauna in tenant_amazonia_wild');
    }
  } else {
    console.log('Default tenant amazonia-wild already exists');
  }

  await dbClient.end();
  console.log('--- Local Database Setup Completed Successfully ---');
}

main().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
