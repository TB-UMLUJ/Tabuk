import React, { useState, useEffect } from 'react';
import { UserIcon, KeyIcon, ArrowRightOnRectangleIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '../icons/Icons';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User } from '../types';
import InactiveAccountModal from './InactiveAccountModal';

type NotificationType = 'success' | 'error' | 'info';

const LoginScreen: React.FC = () => {
    const { verifyCredentials, performLogin } = useAuth();
    const { logos } = useTheme();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);
    const [showInactiveAccountModal, setShowInactiveAccountModal] = useState(false);
    
    useEffect(() => {
        const logoutMessage = sessionStorage.getItem('logoutMessage');
        if (logoutMessage) {
            showNotification(logoutMessage, 'info', 2000);
            sessionStorage.removeItem('logoutMessage');
        }
    }, []);

    const showNotification = (message: string, type: NotificationType, duration: number = 2000) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, duration);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNotification(null);
        setForgotPasswordMessage(null);
        setIsSubmitting(true);

        const result = await verifyCredentials(username, password);
        
        if (result === 'INACTIVE_ACCOUNT') {
            setShowInactiveAccountModal(true);
            setIsSubmitting(false);
        } else if (result) {
            showNotification('تم تسجيل الدخول بنجاح!', 'success', 2000);
            setTimeout(() => {
                performLogin(result as User);
            }, 2000); // Delay redirect to show message
        } else {
            showNotification('اسم المستخدم أو كلمة المرور غير صحيحة.', 'error', 3000);
            setPassword('');
            setIsSubmitting(false);
        }
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        setForgotPasswordMessage('يرجى التواصل مع قسم الدعم الفني للمساعدة.');
        setTimeout(() => {
            setForgotPasswordMessage(null);
        }, 5000); // Hide after 5 seconds
    };
    
    const notificationConfig = {
        success: { icon: <CheckCircleIcon className="h-5 w-5"/>, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
        error: { icon: <XCircleIcon className="h-5 w-5"/>, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
        info: { icon: <InformationCircleIcon className="h-5 w-5"/>, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
            <div className="absolute top-4 left-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-md mx-auto">
                <img
                    src={logos.mainLogoUrl}
                    alt="شعار تجمع تبوك الصحي"
                    className="w-56 h-auto mx-auto mb-10"
                />
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 dark:bg-gray-800/80 dark:backdrop-blur-sm dark:border dark:border-gray-700">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">أهلاً بك</h1>
                        <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">سجّل الدخول لتجربة إدارة أسرع وأذكى</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="sr-only">اسم المستخدم</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                    }}
                                    placeholder="اسم المستخدم"
                                    className={`w-full pr-10 pl-4 py-2.5 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition dark:focus:bg-gray-900 dark:focus:text-white bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white`}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>
                        <div>
                             <label htmlFor="password" className="sr-only">كلمة المرور</label>
                            <div className="relative">
                                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <KeyIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                    }}
                                    placeholder="كلمة المرور"
                                    className={`w-full pr-10 pl-4 py-2.5 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition dark:focus:bg-gray-900 dark:focus:text-white bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white`}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                            <div className="text-left mt-2">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-sm font-semibold text-primary hover:underline focus:outline-none dark:text-primary-light"
                                >
                                    نسيت كلمة السر؟
                                </button>
                            </div>
                            {forgotPasswordMessage && (
                                <div className="mt-2 p-2.5 rounded-lg flex items-center justify-center gap-2 animate-fade-in font-semibold text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    <InformationCircleIcon className="h-5 w-5"/>
                                    <span>{forgotPasswordMessage}</span>
                                </div>
                            )}
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white font-bold py-2.5 px-4 rounded-lg hover:from-primary-dark hover:to-accent-dark transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/30 dark:shadow-lg dark:shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'جاري الدخول...' : 'تسجيل الدخول'}
                            {!isSubmitting && <ArrowRightOnRectangleIcon className="h-5 w-5" />}
                        </button>
                    </form>
                </div>

                <div className="h-16 mt-2 flex items-center justify-center">
                    {notification && (
                        <div className={`w-full text-center p-3 rounded-lg flex items-center justify-center gap-2 animate-fade-in font-semibold text-sm ${notificationConfig[notification.type].className}`}>
                            {notificationConfig[notification.type].icon}
                            <span>{notification.message}</span>
                        </div>
                    )}
                </div>

                <p className="text-center text-gray-500 text-sm dark:text-gray-400">
                    🌿 بيانات دقيقة.. تواصل أسرع 🌿
                </p>
                 <p className="text-center text-gray-400 text-xs mt-6 dark:text-gray-500">
                    &copy; {new Date().getFullYear()} تجمع تبوك الصحي. جميع الحقوق محفوظة.
                </p>
            </div>

             <InactiveAccountModal 
                isOpen={showInactiveAccountModal}
                onClose={() => setShowInactiveAccountModal(false)}
            />
        </div>
    );
};

export default LoginScreen;