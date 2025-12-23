import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('   Need: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    process.exit(1);
  }

  console.log('🔌 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Read migration file
  const migrationPath = join(__dirname, '../../migrations/add-puck-data.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  console.log('📄 Running migration: add-puck-data.sql\n');

  // Split into individual statements and execute each
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    if (statement.startsWith('COMMENT')) {
      console.log('⏭️  Skipping COMMENT statement (not supported via RPC)');
      continue;
    }

    console.log('Executing:', statement.substring(0, 60) + '...');

    const { error } = await supabase.rpc('exec', { sql: statement });

    if (error) {
      // Try alternative method using direct query
      console.log('Trying alternative method...');
      const client = supabase;
      // Since we can't execute raw SQL directly, we'll need to use the SQL Editor in Supabase dashboard
      console.log('⚠️  Cannot execute SQL via client. Please run migration manually.');
      console.log('\n📋 Copy this SQL to Supabase Dashboard > SQL Editor:\n');
      console.log(migrationSQL);
      process.exit(0);
    }
  }

  console.log('\n✅ Migration completed successfully!');
}

runMigration().catch(console.error);
