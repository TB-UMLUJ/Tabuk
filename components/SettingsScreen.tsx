


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
    UsersIcon, 
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
    TrashIcon
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

interface SettingsScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

type SettingsView = 'main' | 'userRoleManagement' | 'activityLog' | 'privacyPolicy' | 'termsOfUse' | 'contactUs' | 'disclaimer' | 'compliance' | 'governance';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [policyToEdit, setPolicyToEdit] = useState<Policy | null>(null);
    const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);

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
            // 1. Delete the file from storage
            if (policyToDelete.file_name) {
                const { error: storageError } = await supabase.storage.from('policies').remove([policyToDelete.file_name]);
                if (storageError) {
                    // Log error but proceed to delete DB record anyway
                    console.error('Storage deletion failed:', storageError);
                    addToast('تحذير', 'فشل حذف الملف من المخزن، لكن سيتم حذف السجل.', 'warning');
                }
            }
            
            // 2. Delete the record from the database
            const { error: dbError } = await supabase.from('policies').delete().eq('id', policyToDelete.id);
            if (dbError) throw dbError;

            logActivity(currentUser, 'DELETE_POLICY', { policyId: policyToDelete.id, policyTitle: policyToDelete.title });
            addToast('تم الحذف', `تم حذف السياسة "${policyToDelete.title}" بنجاح.`, 'deleted');
            setPolicies(prev => prev.filter(p => p.id !== policyToDelete.id));

        } catch (error: any) {
            addToast('خطأ', `فشل حذف السياسة: ${error.message}`, 'error');
        } finally {
            setPolicyToDelete(null);
        }
    };
    
    const PolicyCard: React.FC<{ policy: Policy; onEdit: () => void; onDelete: () => void; }> = ({ policy, onEdit, onDelete }) => (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
                <BookOpenIcon className="w-8 h-8 text-primary dark:text-primary-light flex-shrink-0 mt-1"/>
                <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">{policy.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{policy.description}</p>
                </div>
            </div>
            <div className="w-full sm:w-auto flex-shrink-0 flex items-center gap-2 self-start sm:self-center">
                 {hasPermission('manage_policies') && (
                    <>
                        <button onClick={onEdit} className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors" title="تعديل"><PencilIcon className="w-5 h-5"/></button>
                        <button onClick={onDelete} className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors" title="حذف"><TrashIcon className="w-5 h-5"/></button>
                    </>
                 )}
                <a
                    href={policy.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 bg-primary/10 text-primary-dark dark:bg-primary/20 dark:text-primary-light font-semibold py-2 px-4 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-all"
                >
                    <ArrowDownTrayIcon className="w-5 h-5"/>
                    <span>تحميل</span>
                </a>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-8">
                <BookOpenIcon className="w-12 h-12 mx-auto text-primary dark:text-primary-light" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">مركز الحوكمة والسياسات</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">مكتبة السياسات واللوائح الداخلية الرسمية.</p>
            </div>

            {hasPermission('manage_policies') && (
                <div className="mb-6 text-left">
                    <button
                        onClick={() => { setPolicyToEdit(null); setIsModalOpen(true); }}
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
                            onEdit={() => { setPolicyToEdit(policy); setIsModalOpen(true); }}
                            onDelete={() => setPolicyToDelete(policy)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 px-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">لا توجد سياسات متاحة حاليًا.</p>
                </div>
            )}

            <AddPolicyModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
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
            className="w-full text-right p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary-light hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-5"
        >
            <div className={`p-4 rounded-lg ${colorClass}`}>
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            </div>
            <ChevronLeftIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
        </button>
    );
};


const SettingsScreen: React.FC<SettingsScreenProps> = ({ isOpen, onClose }) => {
    const { logout, hasPermission } = useAuth();
    const [isClosing, setIsClosing] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [currentView, setCurrentView] = useState<SettingsView>('main');

    // Reset view to 'main' when the modal is reopened
    useEffect(() => {
        if (isOpen) {
            setCurrentView('main');
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setIsClosing(false);
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    if (!isOpen && !isClosing) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const mainSettingsContent = (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <SettingsCard
                icon={<KeyIcon className="w-7 h-7" />}
                title="تغيير كلمة المرور"
                description="تحديث كلمة المرور لزيادة أمان حسابك."
                onClick={() => setShowChangePasswordModal(true)}
            />
            {hasPermission('manage_users') && (
                <SettingsCard
                    icon={<UsersIcon className="w-7 h-7" />}
                    title="إدارة المستخدمين والأدوار"
                    description="إضافة وتعديل المستخدمين وتحديد صلاحياتهم."
                    onClick={() => setCurrentView('userRoleManagement')}
                />
            )}
             {hasPermission('view_activity_log') && (
                <SettingsCard
                    icon={<ListBulletIcon className="w-7 h-7" />}
                    title="سجل النشاطات"
                    description="عرض سجل بجميع الإجراءات التي تمت في النظام."
                    onClick={() => setCurrentView('activityLog')}
                    colorClass="text-yellow-600 dark:text-yellow-400 bg-yellow-100/70 dark:bg-yellow-500/20"
                />
            )}
             <SettingsCard
                icon={<ExclamationCircleIcon className="w-7 h-7" />}
                title="إخلاء المسؤولية"
                description="إشعار قانوني بخصوص البيانات التحليلية."
                onClick={() => setCurrentView('disclaimer')}
                colorClass="text-amber-600 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-500/20"
            />
            <SettingsCard
                icon={<ShieldCheckIcon className="w-7 h-7" />}
                title="الامتثال والمعايير"
                description="بيان التوافق مع معايير وزارة الصحة."
                onClick={() => setCurrentView('compliance')}
                colorClass="text-sky-600 dark:text-sky-400 bg-sky-100/70 dark:bg-sky-500/20"
            />
            <SettingsCard
                icon={<BookOpenIcon className="w-7 h-7" />}
                title="مركز الحوكمة والسياسات"
                description="تصفح وتحميل السياسات واللوائح الداخلية."
                onClick={() => setCurrentView('governance')}
                colorClass="text-violet-600 dark:text-violet-400 bg-violet-100/70 dark:bg-violet-500/20"
            />
            <SettingsCard
                icon={<ShieldCheckIcon className="w-7 h-7" />}
                title="سياسة الخصوصية"
                description="كيف نتعامل مع بياناتك وخصوصيتك."
                onClick={() => setCurrentView('privacyPolicy')}
                colorClass="text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-500/20"
            />
            <SettingsCard
                icon={<ClipboardDocumentListIcon className="w-7 h-7" />}
                title="شروط الاستخدام"
                description="القواعد والإرشادات لاستخدام التطبيق."
                onClick={() => setCurrentView('termsOfUse')}
                colorClass="text-indigo-600 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-500/20"
            />
            <SettingsCard
                icon={<EmailIcon className="w-7 h-7" />}
                title="اتصل بنا"
                description="للمساعدة، الدعم، أو تقديم الملاحظات."
                onClick={() => setCurrentView('contactUs')}
                colorClass="text-teal-600 dark:text-teal-400 bg-teal-100/70 dark:bg-teal-500/20"
            />
            <SettingsCard
                icon={<InformationCircleIcon className="w-7 h-7" />}
                title="حول التطبيق"
                description="معلومات الإصدار، الميزات الجديدة، وتفاصيل التطبيق."
                onClick={() => setShowAboutModal(true)}
            />
            <SettingsCard
                icon={<ArrowRightOnRectangleIcon className="w-7 h-7" />}
                title="تسجيل الخروج"
                description="إنهاء الجلسة الحالية والخروج من حسابك."
                onClick={logout}
                colorClass="text-danger dark:text-red-400 bg-danger/10 dark:bg-danger/20"
            />
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
    };

    return ReactDOM.createPortal(
        <div 
            className={`fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 overflow-y-auto ${isOpen ? 'animate-slide-in-left' : 'animate-slide-out-left'}`}
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
            </main>

            <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
            <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} />
        </div>,
        modalRoot
    );
};

export default SettingsScreen;