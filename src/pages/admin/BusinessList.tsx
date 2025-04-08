
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createTableQuery } from '@/integrations/supabase/database-utils';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/schema';

type Business = Database['public']['Tables']['businesses']['Row'];

const BusinessList = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const { data, error } = await createTableQuery(supabase, 'businesses')
          .select();

        if (error) throw error;
        setBusinesses(data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load businesses';
        setError(errorMessage);
        console.error('Error fetching businesses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  if (loading) return <div>Loading businesses...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Businesses</h1>
        <Button asChild>
          <Link to="/admin/businesses/new">Add Business</Link>
        </Button>
      </div>
      <Table>
        <TableCaption>A list of businesses in the system.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Upgraded</TableHead>
            <TableHead>Audit Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((business) => (
            <TableRow key={business.id}>
              <TableCell className="font-medium">{business.id}</TableCell>
              <TableCell>{business.name}</TableCell>
              <TableCell>{business.city}</TableCell>
              <TableCell>
                <a href={business.website} target="_blank" rel="noopener noreferrer">
                  {business.website}
                </a>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{business.scores?.overall}</Badge>
              </TableCell>
              <TableCell>
                {business.is_upgraded ? (
                  <Badge>Yes</Badge>
                ) : (
                  <Badge variant="outline">No</Badge>
                )}
              </TableCell>
              <TableCell>{business.audit_date}</TableCell>
              <TableCell className="text-right">
                <Button asChild variant="link">
                  <Link to={`/admin/businesses/edit/${business.id}`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BusinessList;
