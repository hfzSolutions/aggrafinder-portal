
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { trackAffiliateClick } from '@/utils/analytics';

export type AffiliateData = {
  id: string;
  affiliateCode: string;
  earnings: number;
  paymentEmail: string | null;
  isActive: boolean;
  createdAt: string;
};

export const useAffiliate = () => {
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const location = useLocation();

  // Check URL for affiliate code on page load
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const affiliateCode = searchParams.get('ref');
    
    if (affiliateCode) {
      // Store the affiliate code in local storage for attribution
      localStorage.setItem('affiliate_code', affiliateCode);
      
      // Record the referral in analytics
      trackEvent('affiliate', 'referral', affiliateCode);
    }
  }, [location]);

  // Get user's affiliate data
  const fetchAffiliateData = async () => {
    try {
      setIsLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        return null;
      }

      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setAffiliateData({
          id: data.id,
          affiliateCode: data.affiliate_code,
          earnings: data.earnings,
          paymentEmail: data.payment_email,
          isActive: data.is_active,
          createdAt: data.created_at,
        });
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create affiliate account for the current user
  const createAffiliateAccount = async () => {
    try {
      setIsCreating(true);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        toast.error('You must be logged in to become an affiliate');
        return null;
      }

      const { data, error } = await supabase.rpc('create_affiliate', {
        user_id: userData.user.id,
      });

      if (error) throw error;

      toast.success('Affiliate account created successfully!');
      await fetchAffiliateData();
      return data;
    } catch (error) {
      console.error('Error creating affiliate account:', error);
      toast.error('Failed to create affiliate account');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  // Update affiliate account settings
  const updateAffiliateSettings = async (paymentEmail: string | null) => {
    if (!affiliateData) return false;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('affiliates')
        .update({ payment_email: paymentEmail, updated_at: new Date().toISOString() })
        .eq('id', affiliateData.id);

      if (error) throw error;

      toast.success('Affiliate settings updated successfully');
      await fetchAffiliateData();
      return true;
    } catch (error) {
      console.error('Error updating affiliate settings:', error);
      toast.error('Failed to update affiliate settings');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Track affiliate click for a specific tool
  const recordAffiliateClick = async (
    affiliateCode: string,
    toolId: string,
    toolName: string
  ) => {
    try {
      // Get affiliate ID from code
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliates')
        .select('id')
        .eq('affiliate_code', affiliateCode)
        .single();

      if (affiliateError || !affiliateData) {
        console.error('Error finding affiliate:', affiliateError);
        return false;
      }

      // Record click in analytics
      trackAffiliateClick(affiliateCode, toolId, toolName);

      // Record click in database
      const { error } = await supabase.from('affiliate_clicks').insert([
        {
          affiliate_id: affiliateData.id,
          tool_id: toolId,
          ip_address: 'redacted', // For privacy reasons, we don't store actual IP
          user_agent: navigator.userAgent.substring(0, 255), // Truncate to ensure it fits
        },
      ]);

      if (error) {
        console.error('Error recording affiliate click:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error recording affiliate click:', error);
      return false;
    }
  };

  // Get current affiliate code from URL or localStorage
  const getCurrentAffiliateCode = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('ref');
    
    if (codeFromUrl) {
      return codeFromUrl;
    }
    
    return localStorage.getItem('affiliate_code');
  };

  return {
    affiliateData,
    isLoading,
    isCreating,
    fetchAffiliateData,
    createAffiliateAccount,
    updateAffiliateSettings,
    recordAffiliateClick,
    getCurrentAffiliateCode
  };
};

// Helper to track general events
const trackEvent = (category: string, action: string, label?: string) => {
  if (typeof window !== 'undefined') {
    try {
      trackAffiliateClick(label || '', '', '');
    } catch (e) {
      console.error('Analytics error:', e);
    }
  }
};
