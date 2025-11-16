import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../contexts/ToastContext';
import { CloseIcon, KeyIcon, CheckCircleIcon, IdentificationIcon } from '../icons/Icons';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef<number | null>(null);
    const { addToast } = useToast();

    const startCountdown = () => {
        setCountdown(60);
        timerRef.current = window.setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    if(timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    
    useEffect(() => {
        // Cleanup timer on component unmount
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);
    
    const resetState = () => {
        setIdentifier('');
        setIsLoading(false);
        setIsSuccess(false);
        setCountdown(0);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            resetState(); // Reset state after closing animation
        }, 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulate checking if the user exists
        const { data: user, error } = await supabase
            .from('users')
            .select('user_id')
            .eq('username', identifier) // Assuming employee_id is the username
            .single();

        await new Promise(res => setTimeout(res, 1500)); // Simulate network delay

        setIsLoading(false);

        if (error || !user) {
            addToast('خطأ', 'الرقم الوظيفي أو الهوية غير صحيح.', 'error');
            return;
        }

        // Simulate sending email logic
        console.log(`Password reset link sent for user with identifier: ${identifier}`);
        
        setIsSuccess(true);
        startCountdown();
    };
    
    const handleResend = () => {
        if (countdown === 0) {
            setIsSuccess(false); // Go back to the input form
            setIsLoading(false);
        }
    };


    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[55] flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`} onClick={handleClose} />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-md m-4 transform ${isClosing ? 'animate-modal-out-scale' : 'animate-modal-in-scale'} dark:bg-gray-800`}>
                <div className="p-6 md:p-8">
                    <button onClick={handleClose} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    
                    {!isSuccess ? (
                        <>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg text-primary dark:text-primary-light">
                                    <KeyIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">إعادة تعيين كلمة المرور</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">أدخل بياناتك لإرسال رابط إعادة التعيين.</p>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الرقم الوظيفي أو رقم الهوية</label>
                                    <div className="relative">
                                         <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <IdentificationIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="identifier"
                                            type="text"
                                            value={identifier}
                                            onChange={e => setIdentifier(e.target.value)}
                                            placeholder="أدخل الرقم هنا"
                                            required
                                            className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end gap-3">
                                    <button type="button" onClick={handleClose} className="btn btn-secondary">إلغاء</button>
                                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                        {isLoading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4 animate-checkmark" />
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">تم الإرسال بنجاح</h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">
                                تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الوزاري المسجل لدينا.
                            </p>
                            <div className="mt-8">
                                <button
                                    onClick={handleResend}
                                    disabled={countdown > 0}
                                    className="btn btn-secondary disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {countdown > 0 ? `إعادة الإرسال بعد (${countdown} ثانية)` : 'إرسال رابط جديد'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default ForgotPasswordModal;