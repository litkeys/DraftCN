'use client';

import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseAndValidateJSON } from '@/lib/project/import';
import { toast } from 'sonner';

export function ImportButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleButtonClick = () => {
    // Trigger the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Check if file is JSON
    if (!file.name.endsWith('.json')) {
      toast.error('Please select a JSON file');
      // Reset the input so the same file can be selected again
      event.target.value = '';
      return;
    }

    setIsProcessing(true);

    try {
      // Read file contents
      const text = await file.text();

      // Validate the JSON structure
      const validationResult = parseAndValidateJSON(text);

      if (!validationResult.valid) {
        // Show first error message to user
        const errorMessage = validationResult.errors[0] || 'Invalid file format';
        toast.error(errorMessage);

        // Reset the input
        event.target.value = '';
        setIsProcessing(false);
        return;
      }

      // If validation passes, we have valid project data in validationResult.data
      // This will be used in Task 7 & 8 to show confirmation dialog and import
      // For now, just show that validation succeeded
      console.log('Valid project data:', validationResult.data);

      // Reset the input for next import
      event.target.value = '';
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read file');

      // Reset the input
      event.target.value = '';
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleButtonClick}
        disabled={isProcessing}
      >
        <Upload className="h-4 w-4" />
        {isProcessing ? 'Processing...' : 'Import'}
      </Button>
    </>
  );
}