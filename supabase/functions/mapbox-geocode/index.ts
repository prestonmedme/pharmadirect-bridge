import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeocodeParams {
  query: string;
  center?: { lat: number; lng: number };
  radiusKm?: number;
  country?: string;
  types?: string[];
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Mapbox geocode request received');

    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    if (!mapboxToken) {
      console.error('MAPBOX_ACCESS_TOKEN not found in environment');
      return new Response(
        JSON.stringify({ error: 'Mapbox token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: GeocodeParams = await req.json();
    const { query, center, radiusKm, country = 'us' } = body;

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build Mapbox Geocoding API URL
    const baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
    const encodedQuery = encodeURIComponent(query.trim());
    let url = `${baseUrl}${encodedQuery}.json?access_token=${mapboxToken}&country=${country}&limit=5`;

    // Add proximity bias if center is provided
    if (center) {
      url += `&proximity=${center.lng},${center.lat}`;
    }

    // Add bbox if center and radius are provided
    if (center && radiusKm && radiusKm > 0) {
      const latRadius = radiusKm / 111; // degrees per km
      const lngRadius = radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180));
      const bbox = [
        center.lng - lngRadius, // min lng
        center.lat - latRadius, // min lat
        center.lng + lngRadius, // max lng
        center.lat + latRadius  // max lat
      ];
      url += `&bbox=${bbox.join(',')}`;
    }

    console.log('Making request to Mapbox Geocoding API:', url.replace(mapboxToken, '[TOKEN]'));

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Mapbox API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Geocoding service error' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Mapbox API response:', data.features?.length || 0, 'results');

    // Transform Mapbox response to our format
    const results = data.features?.map((feature: any) => ({
      formatted_address: feature.place_name,
      position: {
        lat: feature.center[1],
        lng: feature.center[0]
      },
      place_id: feature.id,
      address_components: feature.context?.map((ctx: any) => ({
        long_name: ctx.text,
        short_name: ctx.short_code || ctx.text,
        types: [ctx.id.split('.')[0]]
      })) || [],
      place_type: feature.place_type?.[0] || 'address',
      relevance: feature.relevance || 1
    })) || [];

    return new Response(
      JSON.stringify({ 
        results,
        success: true 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in mapbox-geocode function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});