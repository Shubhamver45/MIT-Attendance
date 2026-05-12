import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

export const FaceCapture = ({ onCapture, buttonText = "Capture Face" }) => {
    const videoRef = useRef();
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [captureStatus, setCaptureStatus] = useState('Initializing camera...');
    const [isCapturing, setIsCapturing] = useState(false);

    useEffect(() => {
        const currentVideoRef = videoRef.current;
        const loadModels = async () => {
            const LOCAL_MODEL_URL = '/models';
            const CDN_MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
            
            try {
                // Try loading from local first
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(LOCAL_MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(LOCAL_MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(LOCAL_MODEL_URL)
                ]);
                setModelsLoaded(true);
                setCaptureStatus('Models loaded. Ready to capture.');
                startVideo();
            } catch (localError) {
                console.warn("Local models failed to load, trying CDN...", localError);
                try {
                    // Fallback to CDN
                    await Promise.all([
                        faceapi.nets.ssdMobilenetv1.loadFromUri(CDN_MODEL_URL),
                        faceapi.nets.faceLandmark68Net.loadFromUri(CDN_MODEL_URL),
                        faceapi.nets.faceRecognitionNet.loadFromUri(CDN_MODEL_URL)
                    ]);
                    setModelsLoaded(true);
                    setCaptureStatus('Models loaded (CDN). Ready to capture.');
                    startVideo();
                } catch (cdnError) {
                    console.error("All model sources failed:", cdnError);
                    setCaptureStatus('Error loading models. Please check your internet.');
                }
            }
        };
        loadModels();

        return () => {
            if (currentVideoRef && currentVideoRef.srcObject) {
                const tracks = currentVideoRef.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(stream => {
                videoRef.current.srcObject = stream;
                setCaptureStatus('Camera active. Align your face.');
            })
            .catch(err => {
                console.error(err);
                setCaptureStatus('Camera access denied.');
            });
    };

    const handleCapture = async () => {
        if (!modelsLoaded || isCapturing) return;
        setIsCapturing(true);
        setCaptureStatus('Scanning face... Keep still.');

        try {
            const detection = await faceapi.detectSingleFace(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detection) {
                // Convert Float32Array to regular array for storage
                const descriptorArray = Array.from(detection.descriptor);
                onCapture(JSON.stringify(descriptorArray));
                setCaptureStatus('✅ Face captured successfully!');
            } else {
                setCaptureStatus('❌ No face detected. Try again.');
            }
        } catch (error) {
            console.error("Capture error:", error);
            setCaptureStatus('❌ Capture failed. Try again.');
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4 w-full">
            <div className="relative w-full max-w-sm aspect-video bg-black rounded-xl overflow-hidden shadow-inner">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-dashed border-white/30 pointer-events-none rounded-xl m-4"></div>
            </div>
            
            <div className="text-center">
                <p className={`text-sm font-semibold ${captureStatus.includes('✅') ? 'text-green-600' : captureStatus.includes('❌') ? 'text-red-500' : 'text-slate-500'}`}>
                    {captureStatus}
                </p>
            </div>

            <button
                type="button"
                onClick={handleCapture}
                disabled={!modelsLoaded || isCapturing}
                className="w-full bg-[#052659] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#021024] transition-colors disabled:opacity-50"
            >
                {isCapturing ? 'Processing...' : buttonText}
            </button>
        </div>
    );
};
