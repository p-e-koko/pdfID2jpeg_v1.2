import React, { useState, useRef } from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface FileItem {
  file: File;
  name: string;
  size: number;
}

interface ConversionResult {
  filename: string;
  status: 'success' | 'error';
  error?: string;
  jpegBlob?: Blob;
  outputName?: string;
}

interface ConversionSettings {
  dpi: number;
  quality: number;
  scaleFactor: number;
}

const PDFToJPGConverter: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [settings, setSettings] = useState<ConversionSettings>({
    dpi: 200,
    quality: 95,
    scaleFactor: 0.6
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileDropAreaRef = useRef<HTMLDivElement>(null);

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setSuccessMessage('');
    } else {
      setSuccessMessage(message);
      setErrorMessage('');
    }

    setTimeout(() => {
      setErrorMessage('');
      setSuccessMessage('');
    }, 5000);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    fileDropAreaRef.current?.classList.remove('dragover');
    const files = Array.from(event.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    addFiles(files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    fileDropAreaRef.current?.classList.add('dragover');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    fileDropAreaRef.current?.classList.remove('dragover');
  };

  const addFiles = (files: File[]) => {
    const newFiles: FileItem[] = files
      .filter(file => file.type === 'application/pdf')
      .filter(file => !selectedFiles.find(f => f.name === file.name))
      .map(file => ({
        file,
        name: file.name,
        size: file.size
      }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const convertPDFToJPEG = async (file: File, settings: ConversionSettings): Promise<ConversionResult> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      if (pdf.numPages === 0) {
        return {
          filename: file.name,
          status: 'error',
          error: 'No pages found in PDF'
        };
      }

      const page = await pdf.getPage(1);
      
      // Calculate scale based on DPI and scale factor
      const viewport = page.getViewport({ scale: 1 });
      const scale = (settings.dpi / 72) * settings.scaleFactor;
      const scaledViewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      if (!context) {
        throw new Error('Could not get canvas context');
      }

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport
      };

      await page.render(renderContext).promise;

      // Convert canvas to JPEG blob
      const jpegBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', settings.quality / 100);
      });

      const outputName = file.name.replace(/\.pdf$/i, '.jpg');

      return {
        filename: file.name,
        status: 'success',
        jpegBlob,
        outputName
      };

    } catch (error) {
      return {
        filename: file.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const convertFiles = async () => {
    if (selectedFiles.length === 0) {
      showMessage('Please select PDF files first', true);
      return;
    }

    setIsConverting(true);
    setShowResults(false);

    try {
      const conversionPromises = selectedFiles.map(fileItem => 
        convertPDFToJPEG(fileItem.file, settings)
      );

      const results = await Promise.all(conversionPromises);
      const successCount = results.filter(r => r.status === 'success').length;
      
      setResults(results);
      setShowResults(true);
      showMessage(`Successfully converted ${successCount} out of ${results.length} files`);

    } catch (error) {
      showMessage('Error during conversion: ' + (error instanceof Error ? error.message : 'Unknown error'), true);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadFile = (result: ConversionResult) => {
    if (result.jpegBlob && result.outputName) {
      saveAs(result.jpegBlob, result.outputName);
    }
  };

  const downloadAll = async () => {
    const successfulResults = results.filter(r => r.status === 'success' && r.jpegBlob);
    
    if (successfulResults.length === 0) {
      showMessage('No files to download', true);
      return;
    }

    try {
      const zip = new JSZip();
      
      successfulResults.forEach((result) => {
        if (result.jpegBlob && result.outputName) {
          zip.file(result.outputName, result.jpegBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'converted-images.zip');
    } catch (error) {
      showMessage('Error creating ZIP file: ' + (error instanceof Error ? error.message : 'Unknown error'), true);
    }
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setResults([]);
    setShowResults(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showMessage('All files cleared successfully');
  };

  return (
    <div className="container">
      <div className="header">
        <h1>PDF to JPG Converter</h1>
        <p>Convert the first page of your PDF files to high-quality JPG images</p>
      </div>

      <div className="main-content">
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <div className="upload-section">
          <div 
            className="file-drop-area"
            ref={fileDropAreaRef}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-icon">📄</div>
            <div className="upload-text">Click here or drag & drop PDF files</div>
            <div className="upload-hint">Supports multiple files</div>
            <input
              ref={fileInputRef}
              type="file"
              className="file-input"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
            />
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="file-list">
              {selectedFiles.map((fileItem, index) => (
                <div key={index} className="file-item">
                  <div>
                    <div className="file-name">{fileItem.name}</div>
                    <div className="file-size">{formatFileSize(fileItem.size)}</div>
                  </div>
                  <button className="remove-file" onClick={() => removeFile(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="settings-section">
          <div className="settings-title">Conversion Settings (by default: 200DPI, 95Quality, 0.6Scale)</div>
          <div className="settings-grid">
            <div className="setting-group">
              <label className="setting-label">DPI (Resolution)</label>
              <input
                type="number"
                className="setting-input"
                value={settings.dpi}
                min="72"
                max="600"
                onChange={(e) => setSettings(prev => ({ ...prev, dpi: parseInt(e.target.value) }))}
              />
            </div>
            <div className="setting-group">
              <label className="setting-label">JPEG Quality</label>
              <input
                type="number"
                className="setting-input"
                value={settings.quality}
                min="1"
                max="100"
                onChange={(e) => setSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
              />
            </div>
            <div className="setting-group">
              <label className="setting-label">Scale Factor</label>
              <input
                type="number"
                className="setting-input"
                value={settings.scaleFactor}
                min="0.1"
                max="2.0"
                step="0.1"
                onChange={(e) => setSettings(prev => ({ ...prev, scaleFactor: parseFloat(e.target.value) }))}
              />
            </div>
          </div>
        </div>

        <button 
          className="convert-btn" 
          onClick={convertFiles}
          disabled={selectedFiles.length === 0 || isConverting}
        >
          {isConverting ? 'Converting...' : 'Convert to JPG'}
        </button>

        {isConverting && (
          <div className="loading">
            <div className="spinner"></div>
            <div>Converting files...</div>
          </div>
        )}

        {showResults && (
          <div className="results-section">
            <h3 style={{ marginBottom: '20px', color: '#f1f5f9' }}>Conversion Results</h3>
            <div className="results-list">
              {results.map((result, index) => (
                <div key={index} className={`result-item ${result.status === 'error' ? 'error' : ''}`}>
                  <div>
                    <div className="result-filename">{result.filename}</div>
                    <div className={`result-status ${result.status === 'error' ? 'error' : ''}`}>
                      {result.status === 'success' ? '✓ Converted successfully' : `✗ ${result.error}`}
                    </div>
                  </div>
                  {result.status === 'success' && (
                    <button className="download-btn" onClick={() => downloadFile(result)}>
                      Download
                    </button>
                  )}
                </div>
              ))}
            </div>
            {results.some(r => r.status === 'success') && (
              <button className="download-all-btn" onClick={downloadAll}>
                Download All Images (ZIP)
              </button>
            )}
            <button className="clear-btn" onClick={clearFiles}>Clear All Files</button>
          </div>
        )}
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          background: #1e293b;
          border-radius: 16px;
          box-shadow: 
            0 20px 40px rgba(0,0,0,0.3),
            0 1px 3px rgba(0,0,0,0.2);
          overflow: hidden;
          border: 1px solid #334155;
          margin-top: 20px;
          margin-bottom: 20px;
        }

        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
          color: white;
          padding: 40px;
          text-align: center;
          position: relative;
        }

        .header h1 {
          font-size: 3em;
          margin-bottom: 15px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #f1f5f9;
        }

        .header p {
          font-size: 1.3em;
          opacity: 0.9;
          font-weight: 300;
          letter-spacing: 0.5px;
          color: #cbd5e1;
        }

        .main-content {
          padding: 50px;
          background: #1e293b;
        }

        .upload-section {
          margin-bottom: 30px;
        }

        .file-drop-area {
          border: 3px dashed #475569;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          background: #334155;
        }

        .file-drop-area:hover {
          border-color: #3b82f6;
          background: #374151;
        }

        .file-drop-area.dragover {
          border-color: #3b82f6;
          background: #374151;
          transform: scale(1.02);
        }

        .file-input {
          display: none;
        }

        .upload-icon {
          font-size: 3em;
          color: #64748b;
          margin-bottom: 20px;
        }

        .upload-text {
          font-size: 1.2em;
          color: #e2e8f0;
          margin-bottom: 10px;
        }

        .upload-hint {
          font-size: 0.9em;
          color: #94a3b8;
        }

        .settings-section {
          background: #334155;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 30px;
          border: 1px solid #475569;
        }

        .settings-title {
          font-size: 1.3em;
          color: #f1f5f9;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .setting-group {
          display: flex;
          flex-direction: column;
        }

        .setting-label {
          font-weight: 500;
          color: #cbd5e1;
          margin-bottom: 8px;
          font-size: 0.95em;
        }

        .setting-input {
          padding: 12px 14px;
          border: 2px solid #475569;
          border-radius: 8px;
          font-size: 1em;
          transition: border-color 0.3s ease;
          background: #1e293b;
          color: #e2e8f0;
        }

        .setting-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .convert-btn {
          background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
          color: white;
          border: none;
          padding: 16px 40px;
          font-size: 1.1em;
          font-weight: 500;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          width: 100%;
          margin-bottom: 20px;
        }

        .convert-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(30, 64, 175, 0.3);
        }

        .convert-btn:disabled {
          background: #475569;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .file-list {
          margin-top: 20px;
        }

        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #334155;
          border-radius: 8px;
          margin-bottom: 10px;
          border-left: 4px solid #3b82f6;
          border: 1px solid #475569;
        }

        .file-name {
          font-weight: 500;
          color: #f1f5f9;
        }

        .file-size {
          color: #94a3b8;
          font-size: 0.9em;
        }

        .remove-file {
          background: #dc2626;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8em;
          transition: background 0.2s ease;
        }

        .remove-file:hover {
          background: #b91c1c;
        }

        .results-section {
          margin-top: 30px;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #334155;
          border-radius: 8px;
          margin-bottom: 10px;
          border-left: 4px solid #10b981;
          border: 1px solid #475569;
        }

        .result-item.error {
          border-left-color: #dc2626;
        }

        .result-filename {
          font-weight: 500;
          color: #f1f5f9;
        }

        .result-status {
          color: #10b981;
          font-weight: 500;
        }

        .result-status.error {
          color: #dc2626;
        }

        .download-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          font-size: 0.9em;
          transition: background 0.2s ease;
        }

        .download-btn:hover {
          background: #059669;
        }

        .download-all-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 14px 30px;
          font-size: 1em;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 20px;
          width: 100%;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          margin-bottom: 10px;
        }

        .download-all-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
        }

        .clear-btn {
          background: #dc2626;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
          width: 100%;
        }

        .clear-btn:hover {
          background: #b91c1c;
        }

        .loading {
          text-align: center;
          padding: 20px;
        }

        .spinner {
          border: 4px solid #475569;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          background: #7f1d1d;
          color: #fecaca;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #dc2626;
          border: 1px solid #991b1b;
        }

        .success-message {
          background: #14532d;
          color: #bbf7d0;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #10b981;
          border: 1px solid #166534;
        }

        @media (max-width: 600px) {
          .container {
            margin: 10px;
          }
          
          .main-content {
            padding: 20px;
          }
          
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PDFToJPGConverter;
