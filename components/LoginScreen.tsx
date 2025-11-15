import React, { useState, useEffect } from 'react';
import { UserIcon, KeyIcon, ArrowRightOnRectangleIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon, FingerprintIcon } from '../icons/Icons';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, WebAuthnCredential } from '../types';
import InactiveAccountModal from './InactiveAccountModal';
import { supabase } from '../lib/supabaseClient';
import { base64UrlToArrayBuffer, arrayBufferToBase64Url } from '../lib/webauthnHelpers';
import { useToast } from '../contexts/ToastContext';
import WebAuthnPromptModal from './WebAuthnPromptModal';


type NotificationType = 'success' | 'error' | 'info';

const LoginScreen: React.FC = () => {
    const { verifyCredentials, performLogin } = useAuth();
    const { addToast } = useToast();
    const { logos } = useTheme();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isWebAuthnSubmitting, setIsWebAuthnSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);
    const [showInactiveAccountModal, setShowInactiveAccountModal] = useState(false);
    const [verifiedUserName, setVerifiedUserName] = useState<string | null>(null);
    const [loginStepMessage, setLoginStepMessage] = useState('');
    const [webAuthnPrompt, setWebAuthnPrompt] = useState<{ isOpen: boolean; status: 'scanning' | 'success' | 'failed' }>({ isOpen: false, status: 'scanning' });

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

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNotification(null);
        setForgotPasswordMessage(null);
        setIsSubmitting(true);
        setVerifiedUserName(null);
        setLoginStepMessage('');

        // Step 1: Connecting to DB
        setLoginStepMessage('جاري الاتصال بقاعدة البيانات...');
        await sleep(1500);
        const result = await verifyCredentials(username, password);
        
        if (result === 'INACTIVE_ACCOUNT') {
            setShowInactiveAccountModal(true);
            setIsSubmitting(false);
            setLoginStepMessage('');
        } else if (result) {
            // Step 2: Connection successful
            setLoginStepMessage('تم الاتصال بنجاح');
            setVerifiedUserName((result as Omit<User, 'permissions'>).full_name); // Trigger animation and welcome message
            await sleep(1500);

            // Step 3: Connecting to system
            setLoginStepMessage('جاري توصيل النظام...');
            await sleep(1500);

            // Step 4: Connected
            setLoginStepMessage('تم التوصيل');
            await sleep(1000);
            
            // Step 5: Login successful
            setLoginStepMessage('دخول ناجح');
            await sleep(1000);

            await performLogin(result);
        } else {
            showNotification('اسم المستخدم أو كلمة المرور غير صحيحة.', 'error', 3000);
            setPassword('');
            setIsSubmitting(false);
            setLoginStepMessage('');
        }
    };

    const handleWebAuthnLogin = async () => {
        setIsWebAuthnSubmitting(true);
        setNotification(null);
        setWebAuthnPrompt({ isOpen: true, status: 'scanning' });

        if (!navigator.credentials || !navigator.credentials.get) {
            showNotification('جهازك لا يدعم تسجيل الدخول بالبصمة أو الوجه.', 'error', 4000);
            setIsWebAuthnSubmitting(false);
            setWebAuthnPrompt({ isOpen: false, status: 'failed' });
            return;
        }

        try {
            const { data: credentials, error: fetchError } = await supabase
                .from('webauthn_credentials')
                .select('*');
            
            if (fetchError) throw fetchError;
            if (!credentials || credentials.length === 0) {
                 setWebAuthnPrompt({ isOpen: false, status: 'failed' });
                 showNotification('لم يتم ربط أي بصمة. يرجى تسجيل الدخول وإعدادها من الإعدادات.', 'info', 4000);
                 setIsWebAuthnSubmitting(false);
                return;
            }

            const allowCredentials = credentials.map((cred: WebAuthnCredential) => ({
                type: 'public-key' as PublicKeyCredentialType,
                id: base64UrlToArrayBuffer(cred.credential_id),
            }));
            
            const challenge = crypto.getRandomValues(new Uint8Array(32));

            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge,
                    allowCredentials,
                    userVerification: 'preferred',
                    rpId: window.location.hostname,
                },
            }) as PublicKeyCredential;

            if (!assertion) {
                throw new Error('فشل التحقق من الهوية.');
            }

            setWebAuthnPrompt(prev => ({ ...prev, status: 'success' }));

            const assertedCredentialId = arrayBufferToBase64Url(assertion.rawId);
            const matchingCredential = credentials.find(c => c.credential_id === assertedCredentialId);

            if (!matchingCredential) {
                throw new Error('لم يتم العثور على البصمة المسجلة.');
            }

            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*, role:roles(*)')
                .eq('user_id', matchingCredential.user_id)
                .single();
            
            if (userError || !user) throw new Error('لم يتم العثور على حساب المستخدم المرتبط.');
            
            if (!user.is_active) {
                setShowInactiveAccountModal(true);
                setIsWebAuthnSubmitting(false);
                setWebAuthnPrompt({ isOpen: false, status: 'failed' });
                return;
            }
            
            await sleep(1500);
            await performLogin(user);
            addToast('مرحبًا بك 👋', 'تم تسجيل دخولك بالبصمة بنجاح.', 'success');
            setWebAuthnPrompt({ isOpen: false, status: 'scanning' });

        } catch (error: any) {
            console.error("WebAuthn login error:", error);
            setWebAuthnPrompt(prev => ({ ...prev, status: 'failed' }));
            
            await sleep(2000);
            setWebAuthnPrompt({ isOpen: false, status: 'scanning' });

            let message = 'حدث خطأ أثناء تسجيل الدخول بالبصمة.';
            if (error.name === 'NotAllowedError') {
                message = 'تم إلغاء عملية التحقق.';
            }
            showNotification(message, 'error', 4000);
        } finally {
            setIsWebAuthnSubmitting(false);
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
                    src={logos.loginLogoUrl}
                    alt="شعار الشركة الصحية القابضة"
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
                        
                        <div>
                            {verifiedUserName && (
                                <div className="text-center mb-4 animate-fade-in">
                                    <p className="font-semibold text-lg text-gray-800 dark:text-white">مرحباً : {verifiedUserName}</p>
                                </div>
                            )}
                             <div className="flex flex-col sm:flex-row items-stretch gap-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isWebAuthnSubmitting}
                                    className="btn btn-primary w-full flex-1 relative overflow-hidden"
                                    style={{ minHeight: '44px', borderRadius: '0.5rem' }}
                                >
                                    <span
                                        className="absolute top-0 right-0 h-full bg-primary-dark transition-all ease-in-out"
                                        style={{ 
                                            width: verifiedUserName ? '100%' : '0%',
                                            transitionDuration: '5500ms'
                                        }}
                                    ></span>
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {isSubmitting ? loginStepMessage : 'تسجيل الدخول'}
                                        {!isSubmitting && <ArrowRightOnRectangleIcon className="h-5 w-5" />}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleWebAuthnLogin}
                                    disabled={isWebAuthnSubmitting || isSubmitting}
                                    className="btn btn-secondary flex-shrink-0 gap-2"
                                    title="تسجيل الدخول بالبصمة"
                                    aria-label="تسجيل الدخول بالبصمة"
                                    style={{ borderRadius: '0.5rem' }}
                                >
                                    <FingerprintIcon className="h-6 w-6"/>
                                    <span>دخول بالبصمة</span>
                                </button>
                            </div>
                        </div>
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
            <WebAuthnPromptModal 
                isOpen={webAuthnPrompt.isOpen}
                status={webAuthnPrompt.status}
                onClose={() => setWebAuthnPrompt({ isOpen: false, status: 'scanning' })}
            />
        </div>
    );
};

export default LoginScreen;