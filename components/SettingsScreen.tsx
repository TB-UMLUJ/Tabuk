import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../lib/supabaseClient';
import { Policy } from '../types';
import { 
    CloseIcon, 
    ChevronLeftIcon, 
    ArrowRightOnRectangleIcon, 
    KeyIcon, 
    InformationCircleIcon, 
    UsersRolesIcon,
    ListBulletIcon,
    ShieldCheckIcon,
    ClipboardDocumentListIcon,
    EmailIcon,
    GlobeAltIcon,
    ExclamationCircleIcon,
    BookOpenIcon,
    ArrowDownTrayIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    BellIcon,
    FingerprintIcon,
} from '../icons/Icons';
import AboutModal from './AboutModal';
import { useAuth } from '../contexts/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import UserRoleManagementView from './UserRoleManagementView';
import ActivityLogView from './ActivityLogView';
import { useToast } from '../contexts/ToastContext';
import AddPolicyModal from './AddPolicyModal';
import ConfirmationModal from './ConfirmationModal';
import { logActivity } from '../lib/activityLogger';
import WebAuthnManagementView from './WebAuthnManagementView';

interface SettingsScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

type SettingsView = 'main' | 'userRoleManagement' | 'activityLog' | 'privacyPolicy' | 'termsOfUse' | 'contactUs' | 'disclaimer' | 'compliance' | 'governance' | 'webauthn';


// --- New Policy Detail Modal Component ---
interface PolicyDetailModalProps {
    isOpen: boolean;
    policy: Policy | null;
    onClose: () => void;
    onEdit: (policy: Policy) => void;
    onDelete: (policy: Policy) => void;
}

const PolicyDetailModal: React.FC<PolicyDetailModalProps> = ({ isOpen, policy, onClose, onEdit, onDelete }) => {
    const [isClosing, setIsClosing] = useState(false);
    const { hasPermission } = useAuth();

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    }, [onClose]);

    const handleEdit = useCallback(() => {
        if (policy) onEdit(policy);
    }, [policy, onEdit]);

    const handleDelete = () => {
        if (policy) onDelete(policy);
    };

    const InfoRow: React.FC<{ label: string; value?: string; children?: React.ReactNode }> = ({ label, value, children }) => {
        if (!value && !children) return null;
        return (
            <div className="py-3">
                <p className="text-sm text-gray-500 font-medium dark:text-gray-400">{label}</p>
                {value && <p className="text-base font-semibold text-gray-800 dark:text-white break-words whitespace-pre-wrap">{value}</p>}
                {children}
            </div>
        );
    };

    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!policy || !modalRoot) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`} onClick={handleClose} aria-hidden="true" />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}>
                 <div className="p-6 md:p-8">
                    <button onClick={handleClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-800 transition-all duration-300 z-10 p-2 bg-gray-100/50 rounded-full dark:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white hover:bg-gray-200/80 transform hover:rotate-90">
                       <CloseIcon className="w-6 h-6" />
                    </button>

                    <div className="flex items-start gap-4 mb-4">
                        <div className="bg-primary-light p-3 rounded-lg text-primary dark:bg-primary/20 dark:text-primary-light mt-1">
                            <BookOpenIcon className="w-8 h-8"/>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl md:text-2xl font-bold text-primary dark:text-white">{policy.title}</h2>
                             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                تاريخ الإنشاء: {new Date(policy.created_at).toLocaleDateString('ar-SA')}
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-2 grid grid-cols-1 gap-x-6 dark:border-gray-700">
                        <InfoRow label="الوصف" value={policy.description || 'لا يوجد وصف.'} />
                        <InfoRow label="المرفق">
                            {policy.file_url ? (
                                <a
                                    href={policy.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={policy.display_file_name || policy.title}
                                    className="inline-flex items-center gap-2 text-primary dark:text-primary-light font-bold hover:underline"
                                >
                                    <ArrowDownTrayIcon className="w-5 h-5"/>
                                    <span>تحميل: {policy.display_file_name || 'الملف'}</span>
                                </a>
                            ) : <span className="text-base font-semibold text-gray-400 dark:text-gray-500">لا يوجد</span>}
                        </InfoRow>
                    </div>

                    {hasPermission('manage_policies') && (
                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end gap-2">
                            <button onClick={handleEdit} className="text-center bg-gray-100 text-gray-700 p-2.5 rounded-lg hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600" aria-label="تعديل" title="تعديل">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={handleDelete} className="text-center bg-danger/10 text-danger p-2.5 rounded-lg hover:bg-danger/20 transition-all duration-200 transform hover:scale-105 dark:bg-danger/20 dark:text-red-400 dark:hover:bg-danger/30" aria-label="حذف" title="حذف">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        modalRoot
    );
};


// --- Static Content Components ---

const DisclaimerContent: React.FC = () => (
    <div className="animate-fade-in">
        <div className="text-center mb-8">
            <ExclamationCircleIcon className="w-12 h-12 mx-auto text-amber-600 dark:text-amber-400" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">إخلاء المسؤولية</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">إشعار هام بخصوص استخدام البيانات</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                <p className="font-semibold text-lg">
                    البيانات والمعلومات المعروضة في هذا التطبيق، وخاصة التحليلات والإحصائيات الطبية، هي لأغراض إرشادية ومعلوماتية فقط.
                </p>
                <p>
                    لا ينبغي اعتبار هذه البيانات استشارة طبية مباشرة أو بديلاً عن رأي الطبيب المختص. القرارات الطبية يجب أن تتم دائمًا بالتشاور مع مقدم رعاية صحية مؤهل.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    المعلومات قد لا تكون محدثة بشكل لحظي. إدارة التطبيق تخلي مسؤوليتها عن أي قرارات تتخذ بناءً على هذه البيانات دون استشارة مهنية.
                </p>
            </div>
        </div>
    </div>
);

const ComplianceContent: React.FC = () => (
    <div className="animate-fade-in">
        <div className="text-center mb-8">
            <ShieldCheckIcon className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">الامتثال والمعايير</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">التزامنا بالجودة والمعايير التنظيمية</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <ul className="space-y-5">
                <li className="flex items-start gap-4">
                    <ShieldCheckIcon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">معايير وزارة الصحة</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            تم تطوير هذا التطبيق وتشغيله بما يتوافق مع اللوائح والمعايير الصادرة عن وزارة الصحة في المملكة العربية السعودية، مع التركيز على أمن المعلومات وخصوصية بيانات المرضى والموظفين.
                        </p>
                    </div>
                </li>
                 <li className="flex items-start gap-4">
                    <ShieldCheckIcon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">معايير ISO للجودة</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            نتبع أفضل الممارسات المتوافقة مع معايير الجودة العالمية (مثل ISO 9001) لضمان تقديم خدمة موثوقة وعالية الأداء.
                        </p>
                    </div>
                </li>
                 <li className="flex items-start gap-4">
                    <ShieldCheckIcon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">أمن البيانات</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            نلتزم بأعلى معايير أمن البيانات لحماية جميع المعلومات المخزنة في النظام من الوصول غير المصرح به.
                        </p>
                    </div>
                </li>
            </ul>
        </div>
    </div>
);

const GovernanceCenterContent: React.FC = () => {
    const { addToast } = useToast();
    const { currentUser, hasPermission } = useAuth();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [policyToEdit, setPolicyToEdit] = useState<Policy | null>(null);
    const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

    const fetchPolicies = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('policies').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setPolicies(data || []);
        } catch (error: any) {
            addToast('خطأ', 'فشل في تحميل السياسات.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies]);

    const handleConfirmDelete = async () => {
        if (!policyToDelete) return;
        try {
            if (policyToDelete.file_name) {
                const { error: storageError } = await supabase.storage.from('policies').remove([policyToDelete.file_name]);
                if (storageError) {
                    console.error('Storage deletion failed:', storageError);
                    addToast('تحذير', 'فشل حذف الملف من المخزن، لكن سيتم حذف السجل.', 'warning');
                }
            }
            
            const { error: dbError } = await supabase.from('policies').delete().eq('id', policyToDelete.id);
            if (dbError) throw dbError;

            await logActivity(currentUser, 'DELETE_POLICY', { policyId: policyToDelete.id, policyTitle: policyToDelete.title });
            addToast('تم حذف السياسة بنجاح', '', 'deleted');
            fetchPolicies(); // Refetch policies after deletion
        } catch (error: any) {
            addToast('خطأ', `فشل حذف السياسة: ${error.message}`, 'error');
        } finally {
            setPolicyToDelete(null);
        }
    };
    
    const PolicyCard: React.FC<{ policy: Policy; onSelect: () => void; }> = ({ policy, onSelect }) => (
         <button 
            onClick={onSelect} 
            className="w-full text-right bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-start gap-4 hover:border-primary dark:hover:border-primary-light transition-colors"
        >
            <BookOpenIcon className="w-8 h-8 text-primary dark:text-primary-light flex-shrink-0 mt-1"/>
            <div>
                <h4 className="font-bold text-gray-800 dark:text-white">{policy.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{policy.description}</p>
            </div>
        </button>
    );

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-8">
                <BookOpenIcon className="w-12 h-12 mx-auto text-primary dark:text-primary-light" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">مركز الحوكمة والسياسات</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">مكتبة السياسات واللوائح الداخلية الرسمية.</p>
            </div>

            {hasPermission('manage_policies') && (
                <div className="mb-6 text-center">
                    <button
                        onClick={() => { setPolicyToEdit(null); setIsAddEditModalOpen(true); }}
                        className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        <PlusIcon className="w-5 h-5"/>
                        <span>إضافة سياسة جديدة</span>
                    </button>
                </div>
            )}

            {loading ? (
                 <div className="flex justify-center items-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div></div>
            ) : policies.length > 0 ? (
                <div className="space-y-4">
                    {policies.map(policy => (
                        <PolicyCard 
                            key={policy.id}
                            policy={policy}
                            onSelect={() => setSelectedPolicy(policy)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 px-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">لا توجد سياسات متاحة حاليًا.</p>
                </div>
            )}
            
            <AddPolicyModal 
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                onSaveSuccess={fetchPolicies}
                policyToEdit={policyToEdit}
            />
            
            <ConfirmationModal
                isOpen={!!policyToDelete}
                onClose={() => setPolicyToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message={`هل أنت متأكد من رغبتك في حذف السياسة "${policyToDelete?.title}"؟ سيتم حذف الملف بشكل دائم.`}
            />

            <PolicyDetailModal 
                isOpen={!!selectedPolicy}
                policy={selectedPolicy}
                onClose={() => setSelectedPolicy(null)}
                onEdit={(policy) => {
                    setSelectedPolicy(null);
                    setTimeout(() => {
                        setPolicyToEdit(policy);
                        setIsAddEditModalOpen(true);
                    }, 150);
                }}
                onDelete={(policy) => {
                    setSelectedPolicy(null); // Close detail modal first
                    setPolicyToDelete(policy);
                }}
            />
        </div>
    );
};


const PrivacyPolicyContent: React.FC = () => (
    <div className="animate-fade-in">
        <div className="text-center mb-8">
            <ShieldCheckIcon className="w-12 h-12 mx-auto text-primary dark:text-primary-light" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">سياسة الخصوصية</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y-2 md:divide-y-0 md:divide-x-2 divide-gray-100 dark:divide-gray-700/50 divide-x-reverse">
                {/* Arabic Content */}
                <div className="text-right pt-6 md:pt-0 md:pl-8">
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-4 border-r-4 border-primary pr-3">
                        العربية
                    </h3>
                    <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                        <p>نحن نحرص على حماية خصوصيتك. يتم جمع بيانات المستخدم فقط لتحسين تجربة الاستخدام وضمان جودة الخدمة.</p>
                        <p>لن يتم مشاركة أي بيانات شخصية مع أي جهة خارجية دون موافقة مسبقة من المستخدم، باستثناء ما يتطلبه القانون أو تحسين الأداء الفني.</p>
                        <p>يحق للمستخدم طلب حذف بياناته في أي وقت عبر التواصل مع فريق الدعم.</p>
                    </div>
                </div>

                {/* English Content */}
                <div className="text-left pt-6 md:pt-0 md:pr-8">
                     <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-4 border-l-4 border-primary pl-3">
                        English
                    </h3>
                    <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                        <p>We value your privacy. User data is collected solely to enhance the user experience and ensure service quality.</p>
                        <p>No personal information will be shared with third parties without prior consent, except as required by law or for technical improvements.</p>
                        <p>Users have the right to request deletion of their data at any time by contacting our support team.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


const TermsOfUseContent: React.FC = () => (
     <div className="animate-fade-in">
        <div className="text-center mb-8">
            <ClipboardDocumentListIcon className="w-12 h-12 mx-auto text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">شروط الاستخدام</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y-2 md:divide-y-0 md:divide-x-2 divide-gray-100 dark:divide-gray-700/50 divide-x-reverse">
                {/* Arabic Content */}
                <div className="text-right pt-6 md:pt-0 md:pl-8">
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-4 border-r-4 border-indigo-500 pr-3">
                        العربية
                    </h3>
                    <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                        <p>باستخدام هذا التطبيق، فإنك توافق على الالتزام بجميع القوانين والأنظمة المعمول بها.</p>
                        <p>يُحظر إساءة استخدام الخدمات أو محاولة الوصول إلى البيانات بطريقة غير مصرح بها.</p>
                        <p>يحتفظ فريق التطوير بحق تعديل أو تحديث الشروط في أي وقت دون إشعار مسبق.</p>
                    </div>
                </div>

                {/* English Content */}
                <div className="text-left pt-6 md:pt-0 md:pr-8">
                     <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-4 border-l-4 border-indigo-500 pl-3">
                        English
                    </h3>
                    <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                        <p>By using this application, you agree to comply with all applicable laws and regulations.</p>
                        <p>Misuse of the service or any attempt to access unauthorized data is strictly prohibited.</p>
                        <p>The development team reserves the right to modify or update these terms at any time without prior notice.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ContactUsContent: React.FC = () => (
    <div className="animate-fade-in">
        <div className="text-center mb-8">
            <EmailIcon className="w-12 h-12 mx-auto text-teal-600 dark:text-teal-400" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">اتصل بنا</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 divide-y-2 md:divide-y-0 md:divide-x-2 divide-gray-100 dark:divide-gray-700/50 divide-x-reverse">
                {/* Arabic Content */}
                <div className="text-right pt-6 md:pt-0 md:pl-8">
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-4 border-r-4 border-teal-500 pr-3">
                        العربية
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">نرحب بجميع ملاحظاتكم واستفساراتكم.</p>
                    <div className="space-y-4">
                        <a href="mailto:support@yourapp.com" className="flex items-center justify-end gap-3 group">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">support@yourapp.com</span>
                            <EmailIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary-light transition-colors" />
                        </a>
                        <a href="https://www.yourapp.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-end gap-3 group">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">www.yourapp.com</span>
                            <GlobeAltIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary-light transition-colors" />
                        </a>
                    </div>
                </div>

                {/* English Content */}
                <div className="text-left pt-6 md:pt-0 md:pr-8">
                     <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-4 border-l-4 border-teal-500 pl-3">
                        English
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">We welcome all your feedback and inquiries.</p>
                     <div className="space-y-4">
                        <a href="mailto:support@yourapp.com" className="flex items-center gap-3 group">
                            <EmailIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary-light transition-colors" />
                            <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">support@yourapp.com</span>
                        </a>
                        <a href="https://www.yourapp.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                            <GlobeAltIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary-light transition-colors" />
                            <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">www.yourapp.com</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


// --- Main Component ---

const SettingsCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    colorClass?: string;
}> = ({ icon, title, description, onClick, colorClass = 'text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20' }) => {
    return (
        <button
            onClick={onClick}
            className="w-full text-right p-3 sm:p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary-light hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 sm:gap-5"
        >
            <div className={`p-3 sm:p-4 rounded-lg ${colorClass}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{description}</p>
            </div>
            <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        </button>
    );
};


const SettingsScreen: React.FC<SettingsScreenProps> = ({ isOpen, onClose }) => {
    const { logout, hasPermission } = useAuth();
    const [isClosing, setIsClosing] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [currentView, setCurrentView] = useState<SettingsView>('main');
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setCurrentView('main');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    }, [onClose]);

    const handleRequestNotificationPermission = () => {
        if (!("Notification" in window)) {
            addToast('غير مدعوم', 'متصفحك لا يدعم الإشعارات.', 'error');
            return;
        }

        if (Notification.permission === "granted") {
            addToast('مفعلة بالفعل', 'الإشعارات مفعلة بالفعل لهذا الموقع.', 'info');
        } else if (Notification.permission === "denied") {
            addToast('محظورة', 'تم حظر الإشعارات. يرجى تفعيلها من إعدادات المتصفح.', 'warning');
        } else {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    addToast('تم التفعيل', 'تم تفعيل الإشعارات بنجاح!', 'success');
                    new Notification("أهلاً بك!", { body: "ستتلقى الآن آخر التحديثات." });
                } else {
                    addToast('تم الرفض', 'لم يتم منح إذن الإشعارات.', 'info');
                }
            });
        }
    };

    if (!isOpen) {
        return null;
    }

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const mainSettingsContent = (
         <div className="space-y-8">
            {/* Account Section */}
            <div>
                <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-3">الحساب</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <SettingsCard
                        icon={<KeyIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                        title="تغيير كلمة المرور"
                        description="تحديث كلمة المرور لزيادة أمان حسابك."
                        onClick={() => setShowChangePasswordModal(true)}
                    />
                    <SettingsCard
                        icon={<FingerprintIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                        title="الدخول بالبصمة / الوجه"
                        description="إدارة الأجهزة الموثوقة للدخول السريع."
                        onClick={() => setCurrentView('webauthn')}
                        colorClass="text-teal-600 dark:text-teal-400 bg-teal-100/70 dark:bg-teal-500/20"
                    />
                    <SettingsCard
                        icon={<ArrowRightOnRectangleIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                        title="تسجيل الخروج"
                        description="إنهاء الجلسة الحالية والخروج من حسابك."
                        onClick={logout}
                        colorClass="text-danger dark:text-red-400 bg-danger/10 dark:bg-danger/20"
                    />
                </div>
            </div>

            {/* Notifications Section */}
            <div>
                <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-3">الإشعارات</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                     <SettingsCard
                        icon={<BellIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                        title="تفعيل الإشعارات"
                        description="احصل على تنبيهات للمهام والمعاملات الجديدة."
                        onClick={handleRequestNotificationPermission}
                        colorClass="text-orange-600 dark:text-orange-400 bg-orange-100/70 dark:bg-orange-500/20"
                    />
                </div>
            </div>

            {/* Administration Section */}
            {(hasPermission('manage_users') || hasPermission('view_activity_log')) && (
                <div>
                    <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-3">الإدارة</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {hasPermission('manage_users') && (
                            <SettingsCard
                                icon={<UsersRolesIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                                title="إدارة المستخدمين والأدوار"
                                description="إضافة وتعديل المستخدمين وتحديد صلاحياتهم."
                                onClick={() => setCurrentView('userRoleManagement')}
                            />
                        )}
                        {hasPermission('view_activity_log') && (
                            <SettingsCard
                                icon={<ListBulletIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                                title="سجل النشاطات"
                                description="عرض سجل بجميع الإجراءات التي تمت في النظام."
                                onClick={() => setCurrentView('activityLog')}
                                colorClass="text-yellow-600 dark:text-yellow-400 bg-yellow-100/70 dark:bg-yellow-500/20"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Legal & Policies Section */}
            <div>
                <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-3">السياسات والجوانب القانونية</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                     <SettingsCard
                        icon={<BookOpenIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                        title="مركز الحوكمة والسياسات"
                        description="تصفح وتحميل السياسات واللوائح الداخلية."
                        onClick={() => setCurrentView('governance')}
                        colorClass="text-violet-600 dark:text-violet-400 bg-violet-100/70 dark:bg-violet-500/20"
                    />
                    <SettingsCard
                        icon={<ShieldCheckIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                        title="سياسة الخصوصية"
                        description="كيف نتعامل مع بياناتك وخصوصيتك."
                        onClick={() => setCurrentView('privacyPolicy')}
                        colorClass="text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-500/20"
                    />
                    <SettingsCard
                        icon={<ClipboardDocumentListIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                        title="شروط الاستخدام"
                        description="القواعد والإرشادات لاستخدام التطبيق."
                        onClick={() => setCurrentView('termsOfUse')}
                        colorClass="text-indigo-600 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-500/20"
                    />
                     <SettingsCard
                        icon={<ExclamationCircleIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                        title="إخلاء المسؤولية"
                        description="إشعار قانوني بخصوص البيانات التحليلية."
                        onClick={() => setCurrentView('disclaimer')}
                        colorClass="text-amber-600 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-500/20"
                    />
                    <SettingsCard
                        icon={<ShieldCheckIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                        title="الامتثال والمعايير"
                        description="بيان التوافق مع معايير وزارة الصحة."
                        onClick={() => setCurrentView('compliance')}
                        colorClass="text-sky-600 dark:text-sky-400 bg-sky-100/70 dark:bg-sky-500/20"
                    />
                </div>
            </div>
            
            {/* App & Support Section */}
            <div>
                <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-3">حول التطبيق والدعم</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <SettingsCard
                        icon={<InformationCircleIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                        title="حول التطبيق"
                        description="معلومات الإصدار، الميزات الجديدة، وتفاصيل التطبيق."
                        onClick={() => setShowAboutModal(true)}
                    />
                    <SettingsCard
                        icon={<EmailIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                        title="اتصل بنا"
                        description="للمساعدة، الدعم، أو تقديم الملاحظات."
                        onClick={() => setCurrentView('contactUs')}
                        colorClass="text-teal-600 dark:text-teal-400 bg-teal-100/70 dark:bg-teal-500/20"
                    />
                </div>
            </div>
        </div>
    );
    
    const viewTitles: Record<SettingsView, string> = {
        main: 'الإعدادات',
        userRoleManagement: 'إدارة المستخدمين والأدوار',
        activityLog: 'سجل النشاطات',
        privacyPolicy: 'سياسة الخصوصية',
        termsOfUse: 'شروط الاستخدام',
        contactUs: 'اتصل بنا',
        disclaimer: 'إخلاء المسؤولية',
        compliance: 'الامتثال والمعايير',
        governance: 'مركز الحوكمة والسياسات',
        webauthn: 'الدخول بالبصمة / الوجه',
    };

    return ReactDOM.createPortal(
        <div 
            className={`fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 overflow-y-auto ${isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'}`}
            role="dialog"
            aria-modal="true"
        >
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
                <div className="container mx-auto px-4 py-3 md:px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         {currentView !== 'main' && (
                            <button
                                onClick={() => setCurrentView('main')}
                                className="p-2.5 rounded-lg text-gray-500 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                aria-label="رجوع"
                            >
                                <ChevronLeftIcon className="h-6 w-6" />
                            </button>
                        )}
                        <h2 className="text-xl font-bold text-primary dark:text-white">
                            {viewTitles[currentView]}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2.5 rounded-lg text-gray-500 hover:bg-primary/10 hover:text-primary transition-all duration-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        aria-label="إغلاق"
                    >
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-6 pb-24 md:pb-6">
                {currentView === 'main' && mainSettingsContent}
                {currentView === 'userRoleManagement' && <UserRoleManagementView />}
                {currentView === 'activityLog' && <ActivityLogView />}
                {currentView === 'privacyPolicy' && <PrivacyPolicyContent />}
                {currentView === 'termsOfUse' && <TermsOfUseContent />}
                {currentView === 'contactUs' && <ContactUsContent />}
                {currentView === 'disclaimer' && <DisclaimerContent />}
                {currentView === 'compliance' && <ComplianceContent />}
                {currentView === 'governance' && <GovernanceCenterContent />}
                {currentView === 'webauthn' && <WebAuthnManagementView />}
            </main>

            <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
            <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} />
        </div>,
        modalRoot
    );
};

export default SettingsScreen;