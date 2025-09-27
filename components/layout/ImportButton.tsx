'use client';

import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseAndValidateJSON } from '@/lib/project/import';
import { toast } from 'sonner';
import { useAppStore } from '@/store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ImportButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingProjectData, setPendingProjectData] = useState<any>(null);

  // Get store actions for clearing and adding blocks
  const clearBlocks = useAppStore((state) => state.clearBlocks);
  const addBlock = useAppStore((state) => state.addBlock);

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

      // If validation passes, store the data and show confirmation dialog
      setPendingProjectData(validationResult.data);
      setShowConfirmDialog(true);

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

  const handleConfirmImport = () => {
    // Close the dialog
    setShowConfirmDialog(false);

    if (!pendingProjectData) {
      return;
    }

    try {
      // Clear all existing blocks
      clearBlocks();

      // Add each imported block
      if (pendingProjectData.blocks && Array.isArray(pendingProjectData.blocks)) {
        pendingProjectData.blocks.forEach((block: any) => {
          // Ensure all required properties are present
          addBlock({
            id: block.id,
            typeId: block.typeId,
            props: block.props || {},
            x: block.x,
            y: block.y,
            width: block.width,
            height: block.height,
            z: block.z,
            selected: false, // Always set to false on import
          });
        });
      }

      // Show success notification (Task 10 integration)
      toast.success('Project imported successfully');

      // Clear pending data
      setPendingProjectData(null);
    } catch (error) {
      console.error('Error importing project:', error);
      toast.error('Failed to import project');

      // Clear pending data even on error
      setPendingProjectData(null);
    }
  };

  const handleCancelImport = () => {
    // Close dialog and clear pending data
    setShowConfirmDialog(false);
    setPendingProjectData(null);
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace Current Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current project. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelImport}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}