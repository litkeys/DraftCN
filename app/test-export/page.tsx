'use client';

import { exportProject, generateExportFilename, downloadJSON } from '@/lib/project/export';
import type { Block } from '@/types';

export default function TestExportPage() {
  const handleTestDownload = () => {
    // Create mock data for testing
    const mockBlocks: Block[] = [
      {
        id: 'test-block-1',
        typeId: 'hero-template',
        props: { title: 'Test Hero', subtitle: 'Testing export functionality' },
        x: 100,
        y: 200,
        width: 800,
        height: 400,
        z: 1,
        selected: false,
      },
      {
        id: 'test-block-2',
        typeId: 'text-template',
        props: { content: 'This is a test text block' },
        x: 100,
        y: 650,
        width: 600,
        height: 200,
        z: 2,
        selected: false,
      },
    ];

    const mockCanvasDimensions = {
      width: 1200,
      height: 1800,
    };

    // Generate export data
    const projectData = exportProject(mockBlocks, mockCanvasDimensions);
    const filename = generateExportFilename();

    // Trigger download
    downloadJSON(projectData, filename);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Export Functionality Test Page</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Browser Compatibility Testing</h2>
          <p className="text-gray-600 mb-4">
            Click the button below to test the JSON download functionality in your browser.
            The download should work in:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6">
            <li>Chrome (latest)</li>
            <li>Firefox (latest)</li>
            <li>Safari (latest)</li>
            <li>Edge (latest)</li>
          </ul>

          <button
            onClick={handleTestDownload}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Download JSON
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Expected Behavior</h2>
          <ol className="list-decimal list-inside text-gray-600 space-y-2">
            <li>Click the "Test Download JSON" button</li>
            <li>A file should download with name format: draftcn-project-YYYY-MM-DD-HHmmss.json</li>
            <li>The file should contain valid JSON with:
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>timestamp (ISO format)</li>
                <li>canvas dimensions (width: 1200, height: 1800)</li>
                <li>2 test blocks with complete properties</li>
              </ul>
            </li>
            <li>No page navigation or refresh should occur</li>
          </ol>
        </div>
      </div>
    </div>
  );
}