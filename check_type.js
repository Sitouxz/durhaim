const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase.from('products').select('images').limit(1);
  if (data && data.length > 0) {
    console.log('Type of images:', typeof data[0].images);
    console.log('Is Array?', Array.isArray(data[0].images));
    console.log('Images value:', data[0].images);
    if (typeof data[0].images === 'string') {
       console.log('Parsed:', JSON.parse(data[0].images));
    }
  }
}
main();
