/**
 * Utility to import Canadian pharmacy data from CSV to Supabase
 * This imports directly into the pharmacies_ca table with CSV-compatible structure
 */

import { supabase } from '@/integrations/supabase/client';

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

export const importCAPharmacyData = async (): Promise<{success: boolean; message: string; imported: number}> => {
  try {
    console.log('Starting Canadian pharmacy data import...');
    
    // Fetch the CSV file
    const response = await fetch('/data/cad_medme_pharmacies.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV file: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV file appears to be empty or invalid');
    }
    
    // Parse header row
    const headers = parseCSVLine(lines[0]);
    console.log('CSV Headers:', headers);
    
    // Parse data rows
    const pharmacies: any[] = [];
    let skippedRows = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      try {
        const values = parseCSVLine(line);
        if (values.length !== headers.length) {
          console.warn(`Row ${i + 1}: Column count mismatch. Expected ${headers.length}, got ${values.length}`);
          skippedRows++;
          continue;
        }
        
        // Create object from headers and values
        const csvRow: any = {};
        headers.forEach((header, index) => {
          const value = values[index] || '';
          
          // Parse numeric fields
          if (header === 'Pharmacy Address__latitude' || header === 'Pharmacy Address__longitude') {
            csvRow[header] = value ? parseFloat(value) : null;
          } else {
            csvRow[header] = value || null;
          }
        });
        
        // Skip rows with missing essential data
        if (!csvRow.id || !csvRow.name) {
          console.warn(`Row ${i + 1}: Missing essential data (id or name)`);
          skippedRows++;
          continue;
        }
        
        pharmacies.push(csvRow);
        
      } catch (error) {
        console.warn(`Row ${i + 1}: Parse error - ${error instanceof Error ? error.message : 'Unknown error'}`);
        skippedRows++;
      }
    }
    
    console.log(`Parsed ${pharmacies.length} valid pharmacy records, skipped ${skippedRows} rows`);
    
    if (pharmacies.length === 0) {
      return { success: false, message: 'No valid pharmacy data found to import', imported: 0 };
    }
    
    // Import in batches to avoid overwhelming the database
    const batchSize = 100;
    let totalImported = 0;
    
    for (let i = 0; i < pharmacies.length; i += batchSize) {
      const batch = pharmacies.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('pharmacies_ca')
        .insert(batch);
      
      if (error) {
        console.error(`Batch ${Math.floor(i / batchSize) + 1} import error:`, error);
        throw new Error(`Database insert error: ${error.message}`);
      }
      
      totalImported += batch.length;
      console.log(`Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(pharmacies.length / batchSize)} (${totalImported}/${pharmacies.length})`);
    }
    
    return { 
      success: true, 
      message: `Successfully imported ${totalImported} Canadian pharmacies`, 
      imported: totalImported 
    };
    
  } catch (error) {
    console.error('Import error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown import error', 
      imported: 0 
    };
  }
};

// Helper function to clear all data (useful for re-imports)
export const clearCAPharmacyData = async (): Promise<{success: boolean; message: string}> => {
  try {
    const { error } = await supabase
      .from('pharmacies_ca')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    if (error) {
      throw new Error(`Delete error: ${error.message}`);
    }
    
    return { success: true, message: 'All Canadian pharmacy data cleared' };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown delete error' 
    };
  }
};