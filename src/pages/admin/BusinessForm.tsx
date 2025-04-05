import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createTableQuery, validateInsertData, validateUpdateData } from '@/integrations/supabase/database-utils';
import { Database } from '@/integrations/supabase/schema';

type Business = Database['public']['Tables']['businesses']['Row'];
type BusinessInsert = Database['public']['Tables']['businesses']['Insert'];
type BusinessUpdate = Database['public']['Tables']['businesses']['Update'];

const emptyBusiness: BusinessInsert = {
  id: '',
  name: '',
  city: '',
  category: '',
  description: '',
  website: '',
  address: '',
  image: '',
  mobileScreenshot: '',
  desktopScreenshot: '',
  scores: {
    seo: 0,
    performance: 0,
    accessibility: 0,
    design: 0,
    overall: 0
  },
  suggestedImprovements: [],
  isUpgraded: false,
  auditDate: new Date().toISOString()
};

const BusinessForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState<BusinessInsert | BusinessUpdate>(emptyBusiness);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const fetchBusiness = async () => {
        setFetchLoading(true);
        try {
          const { data, error } = await createTableQuery(supabase, 'businesses')
            .select()
            .eq('id', id)
            .single();
            
          if (error) throw error;
          if (data) {
            setFormData(data);
          }
        } catch (error) {
          console.error('Error fetching business:', error);
          toast({
            title: 'Error',
            description: 'Failed to load business data',
            variant: 'destructive'
          });
        } finally {
          setFetchLoading(false);
        }
      };
      
      fetchBusiness();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && id) {
        // Update existing business
        const { error } = await createTableQuery(supabase, 'businesses')
          .update(validateUpdateData('businesses', formData))
          .eq('id', id);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Business updated successfully'
        });
      } else {
        // Create new business
        const { error } = await createTableQuery(supabase, 'businesses')
          .insert(validateInsertData('businesses', formData as BusinessInsert));
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Business created successfully'
        });
      }
      
      // Redirect back to business list
      navigate('/admin/businesses');
    } catch (error) {
      console.error('Error saving business:', error);
      toast({
        title: 'Error',
        description: 'Failed to save business',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScoresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Ensure scores is not undefined
      const scores = prev.scores || {
        seo: 0,
        performance: 0,
        accessibility: 0,
        design: 0,
        overall: 0
      };
  
      return {
        ...prev,
        scores: {
          ...scores,
          [name]: Number(value)
        }
      };
    });
  };

  const handleSuggestedImprovementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    // Split the textarea value into an array of strings
    const improvementsArray = value.split('\n').map(item => item.trim());
    
    setFormData(prev => ({
      ...prev,
      suggestedImprovements: improvementsArray
    }));
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isUpgraded: checked
    }));
  };

  if (fetchLoading) return <div>Loading business data...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input 
          type="text" 
          id="name" 
          name="name" 
          value={(formData as Business).name || ''} 
          onChange={handleInputChange} 
        />
      </div>
      <div>
        <Label htmlFor="city">City</Label>
        <Input 
          type="text" 
          id="city" 
          name="city" 
          value={(formData as Business).city || ''} 
          onChange={handleInputChange} 
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input 
          type="text" 
          id="category" 
          name="category" 
          value={(formData as Business).category || ''} 
          onChange={handleInputChange} 
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={(formData as Business).description || ''}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input 
          type="text" 
          id="website" 
          name="website" 
          value={(formData as Business).website || ''} 
          onChange={handleInputChange} 
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input 
          type="text" 
          id="address" 
          name="address" 
          value={(formData as Business).address || ''} 
          onChange={handleInputChange} 
        />
      </div>
      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input 
          type="text" 
          id="image" 
          name="image" 
          value={(formData as Business).image || ''} 
          onChange={handleInputChange} 
        />
      </div>
      <div>
        <Label htmlFor="mobileScreenshot">Mobile Screenshot URL</Label>
        <Input 
          type="text" 
          id="mobileScreenshot" 
          name="mobileScreenshot" 
          value={(formData as Business).mobileScreenshot || ''} 
          onChange={handleInputChange} 
        />
      </div>
      <div>
        <Label htmlFor="desktopScreenshot">Desktop Screenshot URL</Label>
        <Input 
          type="text" 
          id="desktopScreenshot" 
          name="desktopScreenshot" 
          value={(formData as Business).desktopScreenshot || ''} 
          onChange={handleInputChange} 
        />
      </div>
      <div>
        <Label>Scores</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="seo">SEO</Label>
            <Input
              type="number"
              id="seo"
              name="seo"
              value={String(((formData as Business).scores && (formData as Business).scores.seo) || 0)}
              onChange={handleScoresChange}
            />
          </div>
          <div>
            <Label htmlFor="performance">Performance</Label>
            <Input
              type="number"
              id="performance"
              name="performance"
              value={String(((formData as Business).scores && (formData as Business).scores.performance) || 0)}
              onChange={handleScoresChange}
            />
          </div>
          <div>
            <Label htmlFor="accessibility">Accessibility</Label>
            <Input
              type="number"
              id="accessibility"
              name="accessibility"
              value={String(((formData as Business).scores && (formData as Business).scores.accessibility) || 0)}
              onChange={handleScoresChange}
            />
          </div>
          <div>
            <Label htmlFor="design">Design</Label>
            <Input
              type="number"
              id="design"
              name="design"
              value={String(((formData as Business).scores && (formData as Business).scores.design) || 0)}
              onChange={handleScoresChange}
            />
          </div>
          <div>
            <Label htmlFor="overall">Overall</Label>
            <Input
              type="number"
              id="overall"
              name="overall"
              value={String(((formData as Business).scores && (formData as Business).scores.overall) || 0)}
              onChange={handleScoresChange}
            />
          </div>
        </div>
      </div>
      <div>
        <Label htmlFor="suggestedImprovements">Suggested Improvements</Label>
        <Textarea
          id="suggestedImprovements"
          name="suggestedImprovements"
          value={((formData as Business).suggestedImprovements || []).join('\n')}
          onChange={handleSuggestedImprovementsChange}
          placeholder="Enter each improvement on a new line"
        />
      </div>
      <div>
        <Label htmlFor="isUpgraded">Is Upgraded</Label>
        <Switch
          id="isUpgraded"
          checked={(formData as Business).isUpgraded || false}
          onCheckedChange={handleToggleChange}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
};

export default BusinessForm;
