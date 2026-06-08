const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const updates = [
    {
      id: "2708714a-b1cc-44b4-a378-3acf7ecebba7",
      images: ["/images/29_VC-1.png"]
    },
    {
      id: "e41bfa26-3e31-473f-a67c-4e9a2414d9ff",
      images: ["/images/31_PP-1.png"]
    },
    {
      id: "a88766d4-9a1c-47a5-8b7c-c0004f989a31",
      images: ["/images/33_B-1.png"]
    }
  ];

  for (const update of updates) {
    const { error } = await supabase
      .from('products')
      .update({ images: update.images })
      .eq('id', update.id);
      
    if (error) {
      console.error(`Failed to update ${update.id}:`, error);
    } else {
      console.log(`Successfully updated ${update.id}`);
    }
  }
}

main();
