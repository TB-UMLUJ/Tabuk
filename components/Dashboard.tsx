
import React, { useMemo, useState, useEffect } from 'react';
import { Employee } from '../types';
import { UserGroupIcon, BuildingOfficeIcon, Cog6ToothIcon } from '../icons/Icons';
import DashboardSettingsModal from './DashboardSettingsModal';

interface DashboardProps {
  employees: Employee[];
}

// Simple SVG Bar Chart Component
const BarChart: React.FC<{ data: { label: string; value: number }[]; color: string }> = ({ data, color }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    if (maxValue === 0) return <div className="text-center text-gray-500 dark:text-gray-400">لا توجد بيانات</div>;

    return (
        <div className="space-y-2">
            {data.slice(0, 7).map(item => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                    <span className="w-24 sm:w-28 text-xs sm:text-sm text-gray-600 truncate text-right dark:text-gray-400">{item.label}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-5 dark:bg-gray-700">
                        <div
                            className="h-5 rounded-full text-white text-xs flex items-center justify-end pr-2"
                            style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: color }}
                        >
                            {item.value}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

interface ChartVisibility {
    departmentDistribution: boolean;
    jobTitleDistribution: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ employees }) => {
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [visibleCharts, setVisibleCharts] = useState<ChartVisibility>(() => {
        try {
            const saved = localStorage.getItem('dashboardCharts');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    departmentDistribution: parsed.departmentDistribution !== false,
                    jobTitleDistribution: parsed.jobTitleDistribution !== false,
                };
            }
        } catch (e) {
            console.error("Failed to parse dashboard settings from localStorage", e);
        }
        return {
            departmentDistribution: true,
            jobTitleDistribution: true,
        };
    });

    useEffect(() => {
        localStorage.setItem('dashboardCharts', JSON.stringify(visibleCharts));
    }, [visibleCharts]);

    const handleToggleChart = (chartKey: keyof ChartVisibility) => {
        setVisibleCharts(prev => ({
            ...prev,
            [chartKey]: !prev[chartKey],
        }));
    };

    const stats = useMemo(() => {
        const total = employees.length;
        const departments = [...new Set(employees.map(e => e.department))].length;
        
        const employeesByDepartment = [...employees.reduce((map, e) => 
            map.set(e.department, (map.get(e.department) || 0) + 1), new Map<string, number>())
        ].map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value);
        
        const employeesByJobTitle = [...employees.reduce((map, e) => 
            map.set(e.job_title, (map.get(e.job_title) || 0) + 1), new Map<string, number>())
        ].map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value);

        return { total, departments, employeesByDepartment, employeesByJobTitle };
    }, [employees]);

    const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center gap-4 dark:bg-gray-800 dark:border-gray-700">
            <div className="bg-primary-light p-4 rounded-full dark:bg-primary/20">{icon}</div>
            <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
                <p className="text-gray-500 font-medium dark:text-gray-400">{title}</p>
            </div>
        </div>
    );
    
    const ChartCard: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
         <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="font-bold text-lg text-gray-800 mb-4 dark:text-white">{title}</h3>
            {children}
        </div>
    );

    return (
        <div className="mt-6 animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">نظرة عامة</h2>
                <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="p-2.5 rounded-lg text-gray-500 hover:bg-primary/10 hover:text-primary transition-all duration-200 transform hover:-translate-y-0.5 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    title="تخصيص لوحة المعلومات"
                    aria-label="تخصيص لوحة المعلومات"
                >
                    <Cog6ToothIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
                    <StatCard title="إجمالي الموظفين" value={stats.total} icon={<UserGroupIcon className="w-8 h-8 text-primary dark:text-primary-light"/>} />
                </div>
                <div className="lg:col-span-2">
                    <StatCard title="القطاعات" value={stats.departments} icon={<BuildingOfficeIcon className="w-8 h-8 text-primary dark:text-primary-light"/>} />
                </div>
                
                {visibleCharts.departmentDistribution && (
                    <div className="lg:col-span-2">
                        <ChartCard title="توزيع الموظفين حسب القطاع">
                            <BarChart data={stats.employeesByDepartment} color="#00A76F" />
                        </ChartCard>
                    </div>
                )}
                
                {visibleCharts.jobTitleDistribution && (
                    <div className="lg:col-span-2">
                        <ChartCard title="توزيع الموظفين حسب المسمى الوظيفي">
                            <BarChart data={stats.employeesByJobTitle} color="#00B8D9" />
                        </ChartCard>
                    </div>
                )}
            </div>
            <DashboardSettingsModal 
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                visibleCharts={visibleCharts}
                onToggleChart={handleToggleChart}
            />
        </div>
    );
};

export default Dashboard;
