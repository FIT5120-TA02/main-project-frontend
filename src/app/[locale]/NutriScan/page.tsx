'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDetectFoodItems, useQRCodeFlow } from '../../../api';

export default function NutriScanPage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { execute: detectFoodItems, isLoading: isDetecting } = useDetectFoodItems();
  const {
    qrData,
    initializeQRCode,
    uploadStatus,
    resultData,
    errorMessage,
    isLoading: isQrProcessing,
    reset: resetQrFlow,
  } = useQRCodeFlow();

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  useEffect(() => {
    const shouldGenerateQR = !isMobile && !qrData && !isQrProcessing;
    if (shouldGenerateQR) {
      const generateQR = async () => {
        try {
          await initializeQRCode(300);
        } catch (error) {
          toast.error('Failed to generate QR Code');
        }
      };
      generateQR();
    }
  }, [isMobile, qrData, isQrProcessing, initializeQRCode]);

  useEffect(() => {
    if (uploadStatus === 'uploaded') {
      toast.success('Image uploaded! Processing...');
    } else if (uploadStatus === 'processed' && resultData) {
      toast.success('Food detection completed!');
      if (resultData.detected_items && resultData.detected_items.length > 0) {
        const items = encodeURIComponent(JSON.stringify(resultData.detected_items));
        router.push(`/NutriResult?items=${items}`);
      } else {
        toast.error('No food items detected in the uploaded image');
      }
    } else if (uploadStatus === 'error') {
      toast.error(errorMessage || 'An error occurred');
    }
  }, [uploadStatus, resultData, errorMessage, router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setImage(file);
      toast.success('Image selected successfully!');
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };


  const handleScan = async () => {
    if (!image) {
      toast.error('Please upload an image or take a photo first!');
      return;
    }

    const toastId = 'scan';
    toast.loading('Processing your scan...', { id: toastId });

    try {
      const data = await detectFoodItems(image);
      toast.success('Scan completed!', { id: toastId });

      if (data.detected_items && data.detected_items.length > 0) {
        const items = encodeURIComponent(JSON.stringify(data.detected_items));
        router.push(`/NutriResult?items=${items}`);
      } else {
        toast.error('No food items detected in the image', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to process the image!', { id: toastId });
    }
  };

  const regenerateQRCode = useCallback(() => {
    if (isQrProcessing) return;

    const regenerate = async () => {
      try {
        resetQrFlow();
        await initializeQRCode(300);
      } catch (error) {
        toast.error('Failed to regenerate QR Code');
      }
    };

    regenerate();
  }, [initializeQRCode, resetQrFlow, isQrProcessing]);

  const isLoading = isDetecting || isQrProcessing;

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Start Your NutriScan</h1>
      <p className="text-lg font-semibold text-gray-600 mb-6 text-center">
        Upload a photo of your food to analyze the nutritional contents!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Upload section */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full">
          <h2 className="text-xl font-semibold mb-4 text-center">Upload Image</h2>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isLoading} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" disabled={isLoading} />

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Browse Files
            </button>
            {isMobile && (
              <button
                onClick={handleCameraCapture}
                className="flex-1 bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Take Photo
              </button>
            )}
          </div>

          <button
            onClick={handleScan}
            className="w-full bg-green-500 text-white py-3 rounded-lg mt-4 hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={isLoading || !image}
          >
            {isLoading ? 'Processing...' : 'Analyze Image'}
          </button>
        </div>

        {/* QR code section */}
        {!isMobile && (
          <div className="bg-white rounded-lg shadow-md p-6 w-full">
            <h2 className="text-xl font-semibold mb-2 text-center">Scan with Phone</h2>
            <div className="flex flex-col items-center">
              <div className={`mb-4 p-4 rounded-lg ${uploadStatus === 'uploaded' ? 'bg-blue-50' : uploadStatus === 'processed' ? 'bg-green-50' : 'bg-gray-50'}`}>
                {isQrProcessing && !qrData && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-gray-500 text-center mb-2">Generating QR Code...</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                )}
                {errorMessage && (
                  <div className="py-6">
                    <p className="text-red-500 text-center">{errorMessage}</p>
                    <button
                      onClick={regenerateQRCode}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      Try Again
                    </button>
                  </div>
                )}
                {qrData && (
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm">
                      <img src={`data:image/png;base64,${qrData.qrcode_base64}`} alt="Generated QR Code" className="w-48 h-48 object-contain" />
                    </div>
                  </div>
                )}
              </div>

              {qrData && (
                <div className="text-center mt-2">
                  <h3 className="font-medium text-gray-700 mb-2">How to use:</h3>
                  <ol className="text-left text-sm text-gray-600 space-y-2 mb-4">
                    <li>Open your phone's camera app</li>
                    <li>Point it at the QR code above</li>
                    <li>Take a photo of your food when prompted</li>
                    <li>Results will appear automatically</li>
                  </ol>
                  <div className="text-xs text-gray-400 mb-1">
                    QR code expires in {qrData.expires_in_seconds} seconds
                  </div>
                  <button
                    onClick={regenerateQRCode}
                    className="text-sm text-blue-500 hover:text-blue-700"
                    disabled={isQrProcessing}
                  >
                    {isQrProcessing ? 'Generating...' : 'Generate New QR Code'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}