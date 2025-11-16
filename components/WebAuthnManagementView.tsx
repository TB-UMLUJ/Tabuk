
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { WebAuthnCredential } from '../types';
import { FingerprintIcon, PlusIcon, TrashIcon, CheckCircleIcon } from '../icons/Icons';
import { arrayBufferToBase64Url } from '../lib/webauthnHelpers';
import ConfirmationModal from './ConfirmationModal';

const WebAuthnManagementView: React.FC = () => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const [credentials, setCredentials] = useState<WebAuthnCredential[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [credentialToDelete, setCredentialToDelete] = useState<WebAuthnCredential | null>(null);

    const fetchCredentials = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('webauthn_credentials')
                .select('*')
                .eq('user_id', currentUser.user_id);
            if (error) throw error;
            setCredentials(data || []);
        } catch (error: any) {
            addToast('خطأ', 'فشل في تحميل الأجهزة المسجلة.', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentUser, addToast]);

    useEffect(() => {
        fetchCredentials();
    }, [fetchCredentials]);

    const handleRegisterDevice = async () => {
        if (!currentUser) return;
        setIsRegistering(true);

        if (!navigator.credentials || !navigator.credentials.create) {
            addToast('غير مدعوم', 'جهازك لا يدعم تسجيل الدخول بالبصمة أو الوجه.', 'error');
            setIsRegistering(false);
            return;
        }

        try {
            const challenge = crypto.getRandomValues(new Uint8Array(32));

            const newCredential = await navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: { 
                        name: 'تجمع تبوك الصحي',
                        id: window.location.hostname 
                    },
                    user: {
                        id: Uint8Array.from(String(currentUser.user_id), c => c.charCodeAt(0)),
                        name: currentUser.username,
                        displayName: currentUser.full_name,
                    },
                    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required',
                    },
                    timeout: 60000,
                    attestation: 'none',
                },
            }) as PublicKeyCredential;

            if (!newCredential) {
                throw new Error('فشلت عملية إنشاء بصمة الدخول.');
            }
            
            const response = newCredential.response as AuthenticatorAttestationResponse;

            const credentialData = {
                user_id: currentUser.user_id,
                credential_id: arrayBufferToBase64Url(newCredential.rawId),
                public_key: arrayBufferToBase64Url(response.getPublicKey!()),
                transports: response.getTransports(),
            };
            
            const { error } = await supabase.from('webauthn_credentials').insert(credentialData);
            if (error) throw error;
            
            addToast('✅ تم تفعيل تسجيل الدخول بالبصمة بنجاح على هذا الجهاز.', '', 'success');
            fetchCredentials();

        } catch (error: any) {
            console.error('WebAuthn registration error:', error);
            let message = 'حدث خطأ أثناء تفعيل البصمة.';
            if (error.name === 'NotAllowedError') {
                message = 'تم إلغاء عملية التسجيل.';
            }
            addToast('خطأ', message, 'error');
        } finally {
            setIsRegistering(false);
        }
    };
    
    const handleConfirmDelete = async () => {
        if (!credentialToDelete) return;
        try {
            const { error } = await supabase
                .from('webauthn_credentials')
                .delete()
                .eq('id', credentialToDelete.id);
            if (error) throw error;
            addToast('تم إلغاء الربط بنجاح', '', 'deleted');
            fetchCredentials();
        } catch (error: any) {
            addToast('خطأ', `فشل إلغاء الربط: ${error.message}`, 'error');
        } finally {
            setCredentialToDelete(null);
        }
    };
    
    return (
        <div className="animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">الأجهزة الموثوقة</h3>
                    <button onClick={handleRegisterDevice} disabled={isRegistering} className="btn btn-primary gap-2 disabled:opacity-70">
                        <PlusIcon className="w-5 h-5"/>
                        {isRegistering ? 'جاري...' : 'ربط هذا الجهاز'}
                    </button>
                </div>

                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400">جاري تحميل الأجهزة...</p>
                ) : credentials.length > 0 ? (
                    <ul className="space-y-3">
                        {credentials.map(cred => (
                            <li key={cred.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                <div className="flex items-center gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-200">هذا الجهاز</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            مُسجل بتاريخ: {new Date(cred.created_at).toLocaleDateString('ar-SA', { calendar: 'gregory' })}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setCredentialToDelete(cred)} className="p-2 rounded-md text-danger hover:bg-danger/10" title="إلغاء الربط">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600">
                        <FingerprintIcon className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="mt-2 font-semibold text-gray-600 dark:text-gray-300">لا توجد أجهزة مربوطة</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">اضغط على "ربط هذا الجهاز" لتفعيل الدخول السريع.</p>
                    </div>
                )}
            </div>
            
            <ConfirmationModal
                isOpen={!!credentialToDelete}
                onClose={() => setCredentialToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="تأكيد إلغاء الربط"
                message="هل أنت متأكد من رغبتك في إلغاء ربط هذا الجهاز؟ ستحتاج إلى تسجيل الدخول بكلمة المرور في المرة القادمة."
                confirmText="إلغاء الربط"
            />
        </div>
    );
};

export default WebAuthnManagementView;
