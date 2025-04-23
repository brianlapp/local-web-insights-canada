
import { supabase } from '@/integrations/supabase/client';

export async function insertTestBusinesses() {
  const testBusinesses = [
    {
      name: "Jane's Florist",
      city: "Ottawa",
      category: "Retail",
      description: "Beautiful floral arrangements for all occasions",
      website: "http://janesflorist.ca",
      address: "123 Flower St, Ottawa, ON",
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      slug: "janes-florist",
      scores: {
        seo: 65,
        performance: 72,
        accessibility: 58,
        design: 80,
        overall: 68
      },
      suggested_improvements: ["Improve image alt text", "Add proper meta descriptions", "Optimize for mobile"],
      is_upgraded: false
    },
    {
      name: "Oakwood Hardware",
      city: "Toronto",
      category: "Hardware",
      description: "Your local hardware store with everything you need for home projects",
      website: "http://oakwoodhardware.com",
      address: "456 Oak Ave, Toronto, ON",
      image: "https://images.unsplash.com/photo-1591006698886-58236a3590b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      slug: "oakwood-hardware",
      scores: {
        seo: 45,
        performance: 60,
        accessibility: 40,
        design: 55,
        overall: 50
      },
      suggested_improvements: ["Increase site speed", "Add product schema", "Improve navigation"],
      is_upgraded: true
    },
    {
      name: "Green Thumb Garden Center",
      city: "Vancouver",
      category: "Garden",
      description: "Plants, tools and expert advice for garden enthusiasts",
      website: "http://greenthumbgarden.ca",
      address: "789 Plant Rd, Vancouver, BC",
      image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      slug: "green-thumb-garden",
      scores: {
        seo: 78,
        performance: 82,
        accessibility: 70,
        design: 90,
        overall: 80
      },
      suggested_improvements: ["Add more calls to action", "Optimize checkout process"],
      is_upgraded: false
    }
  ];

  const { data, error } = await supabase.from('businesses').insert(testBusinesses);
  
  if (error) {
    console.error('Error inserting test businesses:', error);
    return false;
  }
  
  console.log('Successfully inserted test businesses');
  return true;
}
