import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Employee, Transaction, OfficeContact, Task, User } from '../types';
import EmployeeCountGauge from './EmployeeCountGauge';
import { 
    UserGroupIcon, 
    BuildingOfficeIcon, 
    CheckCircleIcon,
    BellIcon,
    ExclamationTriangleIcon,
    StarIcon,
    ArrowTrendingUpIcon,
    DocumentArrowDownIcon,
    UsersIcon,
    ClockIcon,
    InformationCircleIcon,
    PhoneIcon,
    ShieldCheckIcon,
    UserIcon,
} from '../icons/Icons';
import { supabase } from '../lib/supabaseClient'; // To get office contacts count
import { useToast } from '../contexts/ToastContext';
import AnimatedStatCard from './AnimatedStatCard';

declare const XLSX: any;


interface StatisticsViewProps {
    currentUser: User | null;
    employees: Employee[];
    transactions: Transaction[];
    officeContacts: OfficeContact[];
    tasks: Task[];
}

// --- Helper Functions ---
const groupAndAggregate = (data: any[], key: string, limit?: number) => {
    const counts = new Map<string, number>();
    data.forEach(item => {
        const value = item[key] || 'غير محدد';
        counts.set(value, (counts.get(value) || 0) + 1);
    });

    const sorted = Array.from(counts.entries())
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);

    if (limit) {
        return sorted.slice(0, limit);
    }
    return sorted;
};

// --- Sub-Components ---
const HighlightCard: React.FC<{ text: string; icon: React.ReactNode; colorClass: string }> = ({ text, icon, colorClass }) => (
    <div className={`p-4 rounded-xl flex items-center gap-3 ${colorClass}`}>
        <div className="flex-shrink-0">{icon}</div>
        <p className="font-semibold text-sm">{text}</p>
    </div>
);

const BarChartCard: React.FC<{ title: string, data: { label: string, value: number }[] }> = ({ title, data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 h-full">
            <h3 className="font-bold text-lg text-gray-800 mb-4 dark:text-white">{title}</h3>
            {data.length > 0 ? (
                <div className="space-y-4">
                    {data.map((item, index) => (
                        <div key={index}>
                            <div className="flex justify-between items-center mb-1 text-xs">
                                <span className="font-medium text-gray-700 dark:text-gray-300 truncate" title={item.label}>{item.label}</span>
                                <span className="font-bold text-gray-800 dark:text-white">{item.value}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                    className="bg-primary h-2.5 rounded-full"
                                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <p className="text-center text-gray-500 dark:text-gray-400 py-8">لا توجد بيانات لعرضها</p>
            )}
        </div>
    );
};


const DonutChartCard: React.FC<{ title: string, data: {label: string, value: number}[], noScroll?: boolean }> = ({ title, data, noScroll = false }) => {
    const COLORS = ['#008755', '#9B945F', '#F0B323', '#DC582A', '#009ACE', '#753BBD', '#980051'];
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 h-full">
            <h3 className="font-bold text-lg text-gray-800 mb-4 dark:text-white">{title}</h3>
            {data.length > 0 ? (
                <div className="w-full">
                    <ul className={`space-y-2 pr-2 ${noScroll ? '' : 'max-h-72 overflow-y-auto'}`}>
                        {data.map((entry, index) => (
                            <li key={index} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}/>
                                    <span className="text-gray-600 dark:text-gray-300 font-medium truncate" title={entry.label}>{entry.label}</span>
                                </div>
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <span className="font-semibold text-gray-800 dark:text-white">{entry.value}</span>
                                    <span className="text-gray-500 dark:text-gray-400 w-10 text-right">{total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}%</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">لا توجد بيانات لعرضها</p>
            )}
        </div>
    );
};

const LineChartCard: React.FC<{ title: string, data: { label: string, value: number }[] }> = ({ title, data }) => {
    const maxValue = Math.max(...data.map(item => item.value), 10); // Ensure a minimum height
    const points = data.map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - (item.value / maxValue) * 90; // Use 90% of height to avoid touching top
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 h-full">
            <h3 className="font-bold text-lg text-gray-800 mb-4 dark:text-white">{title}</h3>
            {data.length > 1 ? (
                 <div className="h-48 relative">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="lineChartGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#008755" stopOpacity="0.4"/>
                                <stop offset="100%" stopColor="#008755" stopOpacity="0"/>
                            </linearGradient>
                        </defs>
                        <polyline fill="url(#lineChartGradient)" stroke="#008755" strokeWidth="2" points={`0,100 ${points} 100,100`} />
                        <polyline fill="none" stroke="#008755" strokeWidth="3" points={points} />
                         {data.map((item, index) => {
                            const x = (index / (data.length - 1)) * 100;
                            const y = 100 - (item.value / maxValue) * 90;
                            return <circle key={index} cx={x} cy={y} r="2" fill="white" stroke="#008755" strokeWidth="1.5" />;
                        })}
                    </svg>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {data.map(item => <span key={item.label}>{item.label}</span>)}
                    </div>
                </div>
            ) : (
                 <p className="text-center text-gray-500 dark:text-gray-400 py-8">بيانات غير كافية لرسم المخطط</p>
            )}
        </div>
    );
};

interface UsageListItemProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    iconBgColor: string;
}

const UsageListItem: React.FC<UsageListItemProps> = ({ icon, title, value, iconBgColor }) => (
    <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${iconBgColor}`}>
            {icon}
        </div>
        <div>
            <p className="font-semibold text-gray-800 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        </div>
    </div>
);


const StatisticsView: React.FC<StatisticsViewProps> = ({ currentUser, employees, transactions, officeContacts, tasks }) => {
    const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsReportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const stats = useMemo(() => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const transactionsToday = transactions.filter(t => t.date === todayStr).length;
        const transactionsYesterday = transactions.filter(t => t.date === yesterdayStr).length;
        const dailyChange = transactionsYesterday > 0 ? ((transactionsToday - transactionsYesterday) / transactionsYesterday) * 100 : (transactionsToday > 0 ? 100 : 0);
        
        const remainingTasks = tasks.filter(t => !t.is_completed).length;
        const completedTasks = tasks.filter(t => t.is_completed).length;

        return {
            totalEmployees: employees.length,
            totalFacilities: 14,
            ongoingTransactions: transactions.filter(t => ['new', 'inProgress', 'followedUp'].includes(t.status)).length,
            completedTransactions: transactions.filter(t => t.status === 'completed').length,
            overdueTransactions: transactions.filter(t => t.status === 'new' && new Date(t.date) < twoDaysAgo).length,
            dailyActivityChange: dailyChange,
            remainingTasks,
            completedTasks
        };
    }, [employees, transactions, tasks]);

    const chartData = useMemo(() => {
        const employeesByCenter = groupAndAggregate(employees, 'center');
        const employeesByDepartment = groupAndAggregate(employees, 'department', 7);
        const employeesByJobTitle = groupAndAggregate(employees, 'job_title', 7);
        const employeesByGender = groupAndAggregate(employees, 'gender');
        const employeesByNationality = groupAndAggregate(employees, 'nationality', 7);
        
        const transactionsLast7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('ar-SA', { weekday: 'short' });
            return { date: dateStr, label: dayName, value: 0 };
        }).reverse();
        
        transactions.forEach(t => {
            const transactionDate = t.date;
            const dayData = transactionsLast7Days.find(d => d.date === transactionDate);
            if (dayData) {
                dayData.value += 1;
            }
        });

        return { employeesByCenter, employeesByDepartment, employeesByJobTitle, employeesByGender, employeesByNationality, transactionsLast7Days };
    }, [employees, transactions]);

    const handleExport = () => {
         const dataToExport = [
            {"المؤشر": "إجمالي الموظفين", "القيمة": stats.totalEmployees},
            {"المؤشر": "إجمالي المراكز الصحية", "القيمة": stats.totalFacilities},
            {"المؤشر": "المعاملات الجارية", "القيمة": stats.ongoingTransactions},
            {"المؤشر": "المعاملات المكتملة", "القيمة": stats.completedTransactions},
            ...chartData.employeesByDepartment.map(d => ({ "المؤشر": `عدد الموظفين في قطاع ${d.label}`, "القيمة": d.value})),
            ...chartData.employeesByCenter.map(d => ({ "المؤشر": `عدد الموظفين في مركز ${d.label}`, "القيمة": d.value})),
            ...chartData.employeesByJobTitle.map(d => ({ "المؤشر": `عدد الموظفين بمسمى وظيفي ${d.label}`, "القيمة": d.value})),
            ...chartData.employeesByGender.map(d => ({ "المؤشر": `عدد الموظفين من جنس ${d.label}`, "القيمة": d.value})),
            ...chartData.employeesByNationality.map(d => ({ "المؤشر": `عدد الموظفين من جنسية ${d.label}`, "القيمة": d.value})),
        ];
        
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ملخص الإحصائيات');
        XLSX.writeFile(workbook, 'statistics_summary.xlsx');
        setIsReportMenuOpen(false);
    };

    return (
        <div className="mt-6 animate-fade-in pb-24 md:pb-6 relative">
             <div className="bg-primary p-4 rounded-xl flex items-center justify-between mb-6">
                <div>
                    <p className="font-bold text-white text-xl">
                        صباح الخير، {currentUser?.full_name || 'عمر'}
                    </p>
                    <p className="text-sm text-gray-200 mt-1">
                        إليك ملخصًا سريعًا لليوم.
                    </p>
                </div>
                <div className="w-8 h-8 flex-shrink-0 bg-white/25 rounded-full flex items-center justify-center">
                    <InformationCircleIcon className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* === KPIs, Gauge & Highlights === */}
                <div className="lg:col-span-4">
                    <EmployeeCountGauge value={stats.totalEmployees} />
                </div>
                
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatedStatCard 
                            title="المراكز الصحية" 
                            value={92} 
                            icon={<BuildingOfficeIcon />} 
                            bgClass="from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-900/30"
                            iconColorClass="text-blue-400"
                        />
                        <AnimatedStatCard 
                            title="تحويلات المكاتب" 
                            value={3} 
                            icon={<PhoneIcon />}
                            bgClass="from-indigo-100 to-indigo-50 dark:from-indigo-900/50 dark:to-indigo-900/30"
                            iconColorClass="text-indigo-400"
                        />
                        <AnimatedStatCard 
                            title="معاملات جارية" 
                            value={10} 
                            icon={<ClockIcon />}
                            bgClass="from-amber-100 to-amber-50 dark:from-amber-900/50 dark:to-amber-900/30"
                            iconColorClass="text-amber-400"
                        />
                        <AnimatedStatCard 
                            title="معاملات مكتملة" 
                            value={2} 
                            icon={<CheckCircleIcon />}
                            bgClass="from-green-100 to-green-50 dark:from-green-900/50 dark:to-green-900/30"
                            iconColorClass="text-green-400"
                        />
                        <AnimatedStatCard 
                            title="المهام المتبقية" 
                            value={10} 
                            icon={<BellIcon />}
                            bgClass="from-teal-100 to-teal-50 dark:from-teal-900/50 dark:to-teal-900/30"
                            iconColorClass="text-teal-400"
                        />
                        <AnimatedStatCard 
                            title="المهام المكتملة" 
                            value={stats.completedTasks} 
                            icon={<ShieldCheckIcon />}
                            bgClass="from-sky-100 to-sky-50 dark:from-sky-900/50 dark:to-sky-900/30"
                            iconColorClass="text-sky-400"
                        />
                    </div>
                     {/* Smart Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                         <HighlightCard 
                            text={`نشاط اليوم ${stats.dailyActivityChange >= 0 ? 'مرتفع' : 'منخفض'} بنسبة ${Math.abs(stats.dailyActivityChange).toFixed(0)}% مقارنة بالأمس.`}
                            icon={<ArrowTrendingUpIcon className={`w-7 h-7 ${stats.dailyActivityChange >= 0 ? 'text-green-700' : 'text-red-700 rotate-90'}`}/>}
                            colorClass={`bg-gradient-to-br ${stats.dailyActivityChange >= 0 ? 'from-green-50 to-green-100 text-green-800 dark:from-green-900/40 dark:to-green-900/20 dark:text-green-200' : 'from-red-50 to-red-100 text-red-800 dark:from-red-900/40 dark:to-red-900/20 dark:text-red-200'}`}
                         />
                         <HighlightCard 
                            text={stats.overdueTransactions > 0 ? `هناك ${stats.overdueTransactions} معاملات لم تُراجع منذ أكثر من يومين.` : 'لا توجد معاملات متأخرة.'}
                            icon={<ExclamationTriangleIcon className="w-7 h-7 text-yellow-700"/>}
                            colorClass="bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-800 dark:from-yellow-900/40 dark:to-yellow-900/20 dark:text-yellow-200"
                         />
                          <HighlightCard 
                            text="تم تسجيل 10 مستخدمين جدد هذا الأسبوع."
                            icon={<StarIcon className="w-7 h-7 text-blue-700"/>}
                            colorClass="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 dark:from-blue-900/40 dark:to-blue-900/20 dark:text-blue-200"
                         />
                    </div>
                </div>
                
                {/* === ROW 4: Employee Charts === */}
                <div className="lg:col-span-7">
                    <BarChartCard 
                        title="التوزيع حسب القطاع" 
                        data={chartData.employeesByDepartment} 
                    />
                </div>
                <div className="lg:col-span-5">
                     <DonutChartCard title="التوزيع حسب الجنس" data={chartData.employeesByGender} noScroll />
                </div>
                
                {/* === ROW 5: More Employee Charts === */}
                <div className="lg:col-span-12">
                     <BarChartCard 
                        title="التوزيع حسب المسمى الوظيفي (أعلى 7)" 
                        data={chartData.employeesByJobTitle} 
                    />
                </div>
                
                <div className="lg:col-span-12">
                    <DonutChartCard title="التوزيع حسب المراكز" data={chartData.employeesByCenter} />
                </div>

                <div className="lg:col-span-12">
                    <BarChartCard 
                        title="التوزيع حسب الجنسية (أعلى 7)" 
                        data={chartData.employeesByNationality} 
                    />
                </div>


                {/* === ROW 6: Operational Charts === */}
                <div className="lg:col-span-7">
                    <LineChartCard title="نشاط المعاملات (آخر 7 أيام)" data={chartData.transactionsLast7Days} />
                </div>
                <div className="lg:col-span-5">
                     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 h-full">
                        <h3 className="font-bold text-lg text-gray-800 mb-6 dark:text-white">تحليل استخدام المنصة <span className="text-sm font-normal text-gray-400">(بيانات تجريبية)</span></h3>
                        <div className="space-y-6">
                            <UsageListItem
                                icon={<UserIcon className="w-6 h-6 text-indigo-500" />}
                                title="أكثر المستخدمين نشاطًا"
                                value="عبدالله الفايدي"
                                iconBgColor="bg-indigo-100 dark:bg-indigo-500/20"
                            />
                            <UsageListItem
                                icon={<BuildingOfficeIcon className="w-6 h-6 text-primary" />}
                                title="أكثر الأقسام استخدامًا"
                                value="إدارة المعاملات"
                                iconBgColor="bg-primary/10 dark:bg-primary/20"
                            />
                            <UsageListItem
                                icon={<ClockIcon className="w-6 h-6 text-amber-500" />}
                                title="الأوقات الأكثر نشاطًا"
                                value="11:00 صباحًا"
                                iconBgColor="bg-amber-100/70 dark:bg-amber-500/20"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Export Button at the bottom */}
            <div className="mt-12 flex justify-center">
                 <div className="relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setIsReportMenuOpen(prev => !prev)}
                        className="flex items-center gap-2 bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-dark font-semibold py-2.5 px-6 rounded-lg hover:bg-accent/20 dark:hover:bg-accent/30 transition-all duration-200 transform hover:-translate-y-0.5"
                        title="تحميل تقرير الإحصائيات"
                    >
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        <span>تصدير تقرير</span>
                    </button>
                    {isReportMenuOpen && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 z-50 p-2 animate-fade-in">
                            <ul className="space-y-1">
                                <li>
                                    <button onClick={handleExport} className="w-full flex items-center gap-3 text-right p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <DocumentArrowDownIcon className="w-5 h-5 text-green-600" />
                                        <span className="font-semibold">تصدير Excel</span>
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => { addToast('تصدير PDF غير متوفر حالياً', '', 'info'); setIsReportMenuOpen(false); }} className="w-full flex items-center gap-3 text-right p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <DocumentArrowDownIcon className="w-5 h-5 text-red-600" />
                                        <span className="font-semibold">تصدير PDF (قريباً)</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatisticsView;