const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase.from('products').select('id, name, images');
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  console.log('Products:', JSON.stringify(data, null, 2));
}

main();
