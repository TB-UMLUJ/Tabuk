import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FingerprintIcon } from '../icons/Icons';

type Status = 'scanning' | 'success' | 'failed';

interface WebAuthnPromptModalProps {
    isOpen: boolean;
    status: Status;
    onClose: () => void;
}

const StatusGraphic: React.FC<{ status: Status }> = ({ status }) => {
    if (status === 'failed') {
        return (
            <div className="relative w-[7.5rem] h-[7.5rem] flex items-center justify-center">
                <FingerprintIcon className="w-[6.25rem] h-[6.25rem] text-red-400" />
                <svg viewBox="0 0 100 100" className="absolute w-full h-full">
                    <path d="M 35 35 L 65 65 M 65 35 L 35 65" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="animate-checkmark" />
                </svg>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="relative w-[7.5rem] h-[7.5rem] flex items-center justify-center">
                <FingerprintIcon className="w-[6.25rem] h-[6.25rem] text-green-400" />
                <svg viewBox="0 0 100 100" className="absolute w-full h-full">
                    <path d="M 30 50 L 45 65 L 75 35" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="animate-checkmark" />
                </svg>
            </div>
        );
    }
    
    // Scanning state
    return (
        <div className="relative w-[7.5rem] h-[7.5rem] flex items-center justify-center">
            <FingerprintIcon className="w-[6.25rem] h-[6.25rem] text-emerald-300 animate-pulse-strong" />
        </div>
    );
};


const WebAuthnPromptModal: React.FC<WebAuthnPromptModalProps> = ({ isOpen, status, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
        if (!isOpen) return;

        let interval: number;
        if (status === 'scanning') {
            setProgress(0);
            interval = window.setInterval(() => {
                setProgress(p => {
                    if (p >= 90) {
                        clearInterval(interval);
                        return p;
                    }
                    return p + Math.random() * 5 + 2;
                });
            }, 80);
        } else if (status === 'success') {
            setProgress(100);
        } else if (status === 'failed') {
             setProgress(0);
        }
        
        return () => clearInterval(interval);
    }, [isOpen, status]);


    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };
    
    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;
    
    const messages = {
        scanning: {
            title: 'الرجاء وضع إصبعك على المستشعر',
            progressText: `جاري المسح...`,
            progressValue: Math.min(Math.floor(progress), 100),
        },
        success: {
            title: 'تم التحقق بنجاح!',
            progressText: 'اكتمل المسح',
            progressValue: 100,
        },
        failed: {
            title: 'فشل التحقق',
            progressText: 'يرجى المحاولة مرة أخرى',
            progressValue: 0,
        }
    };

    const currentMessage = messages[status];

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[60] flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`} onClick={handleClose} />
            <div className={`relative bg-[#2A304C] rounded-2xl w-full max-w-sm text-center p-8 text-white transform ${isClosing ? 'animate-modal-out-scale' : 'animate-modal-in-scale'}`}>
                <p className="font-semibold text-lg mb-8">{currentMessage.title}</p>
                
                <div className="relative flex justify-center items-center mb-8 h-[7.5rem]">
                   <StatusGraphic status={status} />
                </div>
                
                <p className="text-3xl font-bold tracking-wider">{currentMessage.progressValue}%</p>
                <p className="text-gray-300 mt-1">{currentMessage.progressText}</p>
            </div>
        </div>,
        modalRoot
    );
};

export default WebAuthnPromptModal;