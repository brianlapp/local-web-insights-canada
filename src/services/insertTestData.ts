
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const insertTestBusinesses = async () => {
  try {
    const testBusinesses = [
      {
        name: "Riverside Café",
        city: "ottawa",
        category: "Restaurant",
        description: "A cozy café by the riverside with outdoor seating and fantastic coffee.",
        website: "https://example.com/riverside-cafe",
        address: "123 River St, Ottawa, ON",
        image: "https://images.unsplash.com/photo-1467753934612-32b78a5c0c77?auto=format&fit=crop&w=800&q=80",
        slug: "riverside-cafe",
        scores: { seo: 68, performance: 75, accessibility: 82, design: 90, overall: 80 },
        suggested_improvements: ["Add alt text to images", "Improve mobile menu"],
        is_upgraded: true
      },
      {
        name: "Oakwood Hardware",
        city: "toronto",
        category: "Hardware",
        description: "Family-owned hardware store serving the community for over 50 years.",
        website: "https://example.com/oakwood-hardware",
        address: "456 Oak Ave, Toronto, ON",
        image: "https://images.unsplash.com/photo-1591006698886-58236a3590b7?auto=format&fit=crop&w=800&q=80",
        slug: "oakwood-hardware",
        scores: { seo: 45, performance: 62, accessibility: 58, design: 40, overall: 50 },
        suggested_improvements: ["Add proper meta descriptions", "Fix broken links", "Improve page load speed"],
        is_upgraded: false
      },
      {
        name: "Green Thumb Garden Center",
        city: "vancouver",
        category: "Garden",
        description: "Specializing in native plants and organic gardening supplies.",
        website: "https://example.com/green-thumb",
        address: "789 Maple Rd, Vancouver, BC",
        image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80",
        slug: "green-thumb-garden-center",
        scores: { seo: 72, performance: 65, accessibility: 60, design: 85, overall: 70 },
        suggested_improvements: ["Implement structured data", "Add product schema"],
        is_upgraded: false
      },
      {
        name: "Maritime Bookshop",
        city: "halifax",
        category: "Retail",
        description: "Independent bookstore with a focus on local authors and maritime literature.",
        website: "https://example.com/maritime-books",
        address: "101 Harbor Dr, Halifax, NS",
        image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80",
        slug: "maritime-bookshop",
        scores: { seo: 88, performance: 90, accessibility: 95, design: 92, overall: 91 },
        suggested_improvements: ["Add reviews schema"],
        is_upgraded: true
      },
      {
        name: "Montreal Bistro",
        city: "montreal",
        category: "Restaurant",
        description: "Authentic French cuisine in the heart of Montreal.",
        website: "https://example.com/montreal-bistro",
        address: "202 Rue St-Denis, Montreal, QC",
        image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80",
        slug: "montreal-bistro",
        scores: { seo: 60, performance: 45, accessibility: 50, design: 75, overall: 58 },
        suggested_improvements: ["Optimize images", "Fix mobile layout issues", "Add alt text to all images"],
        is_upgraded: false
      }
    ];

    const { error } = await supabase.rpc('process_business_import', { businesses: testBusinesses });

    if (error) {
      console.error('Error inserting test businesses:', error);
      toast.error(`Error inserting data: ${error.message}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception inserting test businesses:', error);
    return false;
  }
};
