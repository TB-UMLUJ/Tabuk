
import React from 'react';
import { BookOpenIcon, UserGroupIcon, PhoneIcon, BellIcon, DocumentDuplicateIcon, ChartBarIcon, ClipboardDocumentListIcon } from '../icons/Icons';
import { useAuth } from '../contexts/AuthContext';

type TabId = 'directory' | 'orgChart' | 'officeDirectory' | 'tasks' | 'transactions' | 'statistics';

interface BottomNavBarProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
}

const allTabs: { id: TabId; label: string; icon: React.ElementType; requiredPermission?: string }[] = [
    { id: 'statistics', label: 'إحصائيات', icon: ChartBarIcon },
    { id: 'directory', label: 'الدليل', icon: BookOpenIcon },
    { id: 'officeDirectory', label: 'تحويلات', icon: PhoneIcon },
    { id: 'tasks', label: 'المهام', icon: BellIcon },
    { id: 'transactions', label: 'المعاملات', icon: DocumentDuplicateIcon },
    { id: 'orgChart', label: 'الهيكلة', icon: UserGroupIcon },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
    const { hasPermission } = useAuth();
    const visibleTabs = allTabs.filter(tab => !tab.requiredPermission || hasPermission(tab.requiredPermission));
    const activeIndex = visibleTabs.findIndex(tab => tab.id === activeTab);
    const gridColsClass = `grid-cols-${visibleTabs.length}`;

    return (
        <div className="md:hidden fixed bottom-4 inset-x-4 h-14 z-50 pointer-events-none">
            <div className={`relative grid ${gridColsClass} h-full max-w-lg mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/80 dark:bg-gray-800/80 dark:border-gray-700/50 pointer-events-auto`}>
                {/* Sliding Indicator */}
                <div
                    className="absolute top-0 right-0 h-full p-1 transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                    style={{ 
                        width: `calc(100% / ${visibleTabs.length})`,
                        transform: `translateX(-${activeIndex * 100}%)` 
                    }}
                >
                    <div className="w-full h-full bg-primary/10 dark:bg-primary/20 rounded-xl" />
                </div>

                {visibleTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        aria-label={tab.label}
                        className={`relative z-10 flex flex-col items-center justify-center w-full h-full pt-2 pb-1 transition-colors duration-300
                            ${activeTab === tab.id
                                ? 'text-primary dark:text-primary-light'
                                : 'text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light'
                            }`}
                    >
                        <tab.icon className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-bold">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BottomNavBar;
