
import React, { useState } from 'react';
import UserManagementView from './UserManagementView';
import RoleManagementView from './RoleManagementView';
import { UserIcon, ShieldCheckIcon } from '../icons/Icons';

type ActiveTab = 'users' | 'roles';

const UserRoleManagementView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('users');

    const tabs = [
        { id: 'users', name: 'المستخدمون', icon: UserIcon },
        { id: 'roles', name: 'الأدوار والصلاحيات', icon: ShieldCheckIcon },
    ];

    return (
        <div className="animate-fade-in">
            <div className="border-b border-gray-200 mb-6 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ActiveTab)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                            aria-current={activeTab === tab.id ? 'page' : undefined}
                        >
                            <tab.icon className="h-5 w-5" />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            <div key={activeTab} className="animate-fade-in">
                {activeTab === 'users' && <UserManagementView />}
                {activeTab === 'roles' && <RoleManagementView />}
            </div>
        </div>
    );
};

export default UserRoleManagementView;
