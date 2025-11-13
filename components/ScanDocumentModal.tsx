import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon, CameraIcon, ArrowPathIcon } from '../icons/Icons';

interface ScanDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanComplete: (file: File) => void;
}

const ScanDocumentModal: React.FC<ScanDocumentModalProps> = ({ isOpen, onClose, onScanComplete }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capture, setCapture] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        stopStream();
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setCapture(null);
            setError(null);
        }, 300);
    }, [onClose, stopStream]);

    useEffect(() => {
        const startStream = async () => {
            if (isOpen && !stream && !capture) {
                try {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'environment' },
                        audio: false
                    });
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setError("لا يمكن الوصول إلى الكاميرا. يرجى التحقق من الأذونات.");
                }
            }
        };

        startStream();

        return () => {
            stopStream();
        };
    }, [isOpen, stream, capture, stopStream]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Compressed JPG
            setCapture(dataUrl);
            stopStream();
        }
    };
    
    const handleRetake = () => {
        setCapture(null);
        setError(null);
    };

    const handleConfirm = () => {
        if (capture && canvasRef.current) {
            canvasRef.current.toBlob(blob => {
                if (blob) {
                    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
                    const scannedFile = new File([blob], `scan_${timestamp}.jpg`, { type: 'image/jpeg' });
                    onScanComplete(scannedFile);
                    handleClose();
                }
            }, 'image/jpeg', 0.9);
        }
    };
    
    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[60] flex justify-center items-center p-0" role="dialog" aria-modal="true">
            <div className={`fixed inset-0 bg-black/80 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`} onClick={handleClose} />
            <div className={`relative bg-gray-900 rounded-2xl shadow-xl w-full h-full sm:w-auto sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col overflow-hidden transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>
                <div className="p-4 flex justify-between items-center text-white bg-black/20 flex-shrink-0">
                    <h3 className="font-bold text-lg">مسح المستند ضوئياً</h3>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow relative flex items-center justify-center bg-black overflow-hidden">
                    {error ? (
                        <div className="text-center text-red-400 p-4">
                            <p>{error}</p>
                            <button onClick={handleClose} className="mt-4 bg-primary text-white font-semibold py-2 px-4 rounded-lg">إغلاق</button>
                        </div>
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-contain ${capture ? 'hidden' : 'block'}`} />
                            {capture && <img src={capture} alt="Preview" className="w-full h-full object-contain" />}
                             <canvas ref={canvasRef} className="hidden" />
                        </>
                    )}
                </div>

                <div className="p-4 bg-black/20 flex-shrink-0 flex justify-center items-center gap-4">
                    {capture ? (
                        <>
                            <button onClick={handleRetake} className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-500 transition-colors">
                                <ArrowPathIcon className="w-6 h-6" />
                                <span>إعادة الالتقاط</span>
                            </button>
                            <button onClick={handleConfirm} className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors">
                                <span>تأكيد ورفع</span>
                            </button>
                        </>
                    ) : (
                        <button onClick={handleCapture} disabled={!stream} className="w-16 h-16 rounded-full bg-white flex items-center justify-center ring-4 ring-white/30 disabled:opacity-50">
                            <CameraIcon className="w-8 h-8 text-primary" />
                        </button>
                    )}
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default ScanDocumentModal;
