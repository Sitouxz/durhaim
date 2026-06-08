const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase.from('products').select('images').eq('id', '2708714a-b1cc-44b4-a378-3acf7ecebba7').single();
  if (data) {
    console.log('Type of images:', typeof data.images);
    console.log('Is Array?', Array.isArray(data.images));
    console.log('Images value:', data.images);
    if (typeof data.images === 'string') {
       console.log('Parsed:', JSON.parse(data.images));
    }
  }
}
main();
