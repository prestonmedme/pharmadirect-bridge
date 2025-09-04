import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const TestMapboxToken: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testToken = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing Mapbox token function...');
      
      const { data, error } = await supabase.functions.invoke('mapbox-token');
      
      console.log('🧪 Token function response:', { data, error });
      
      if (error) {
        setResult({ error: error.message || 'Unknown error' });
        return;
      }
      
      setResult({ 
        success: true, 
        token: data?.token ? `${data.token.substring(0, 15)}...` : 'No token',
        fullResponse: data 
      });
    } catch (error) {
      console.error('🧪 Token test error:', error);
      setResult({ error: error instanceof Error ? error.message : 'Test failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="font-semibold mb-2">Test Mapbox Token</h3>
      <Button onClick={testToken} disabled={loading}>
        {loading ? 'Testing...' : 'Test Token Function'}
      </Button>
      {result && (
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};