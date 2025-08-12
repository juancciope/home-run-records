"use client"

import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function FixArtistDataButton() {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleFix = async () => {
    setIsFixing(true);
    setResult(null);

    try {
      const response = await fetch('/api/fix/artist-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'Artist data refreshed successfully!'
        });
        
        // Refresh the page after a short delay to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setResult({
          success: false,
          message: data.message || 'Failed to refresh artist data'
        });
      }
    } catch (error) {
      console.error('Error fixing artist data:', error);
      setResult({
        success: false,
        message: 'Network error occurred'
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleFix}
        disabled={isFixing}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isFixing ? 'animate-spin' : ''}`} />
        {isFixing ? 'Refreshing...' : 'Refresh Artist Data'}
      </Button>
      
      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}