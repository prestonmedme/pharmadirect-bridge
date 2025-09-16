import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { importCAPharmacyData, clearCAPharmacyData } from '@/utils/importCAPharmacyData';

export const ImportCAData: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    imported?: number;
  } | null>(null);

  const handleImport = async () => {
    setImporting(true);
    setResult(null);
    
    try {
      const importResult = await importCAPharmacyData();
      
      setResult({
        type: importResult.success ? 'success' : 'error',
        message: importResult.message,
        imported: importResult.imported
      });
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Import failed'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all Canadian pharmacy data? This action cannot be undone.')) {
      return;
    }
    
    setClearing(true);
    setResult(null);
    
    try {
      const clearResult = await clearCAPharmacyData();
      
      setResult({
        type: clearResult.success ? 'info' : 'error',
        message: clearResult.message
      });
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Clear failed'
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Canadian Pharmacy Data Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Import Canadian pharmacy data from the CSV file into the database. 
          This will populate the CA site with MedMe-connected pharmacies across Canada.
        </div>
        
        {result && (
          <Alert className={`${
            result.type === 'success' 
              ? 'border-green-200 bg-green-50 text-green-800' 
              : result.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-blue-200 bg-blue-50 text-blue-800'
          }`}>
            {result.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : result.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {result.message}
              {result.imported && (
                <div className="mt-1 font-medium">
                  Total imported: {result.imported} pharmacies
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-3">
          <Button 
            onClick={handleImport} 
            disabled={importing || clearing}
            className="flex-1"
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </>
            )}
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={handleClear} 
            disabled={importing || clearing}
          >
            {clearing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Data
              </>
            )}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <strong>Note:</strong> Make sure to run this import only once to avoid duplicate data. 
          Use "Clear Data" first if you need to re-import.
        </div>
      </CardContent>
    </Card>
  );
};