import React, { useState } from 'react';
import { ChevronDownIcon } from '../icons/Icons';

// --- Data Structure for the Organizational Chart (re-structured for a tree view) ---
interface TreeNodeData {
    name: string;
    englishName: string;
    children?: TreeNodeData[];
}

const treeData: TreeNodeData = {
    name: "مدير المستشفى",
    englishName: "Hospital Director",
    children: [
        {
            name: "التمريض",
            englishName: "Nursing",
            children: [
                {
                    name: "التطوير",
                    englishName: "Development",
                    children: [
                        { name: "الجودة التمريضية", englishName: "Nursing Quality" },
                        { name: "التعليم والتدريب التمريضي", englishName: "Nursing Education and Training" },
                    ],
                },
                {
                    name: "الاكلينيكي",
                    englishName: "Clinical",
                    children: [
                        { name: "الرعاية التمريضية", englishName: "Nursing Care" },
                        { name: "إشراف التمريض", englishName: "Nursing Supervising" },
                    ],
                },
            ],
        },
        { name: "مكافحة العدوى", englishName: "Infection Control" },
        { name: "تجربة المريض وبلاغات 937", englishName: "Patient Experience & 937 Reports" },
        { name: "التخطيط والاستعداد للكوارث", englishName: "Emergency Planning & preparedness" },
        { name: "إدارة الخدمة الشاملة", englishName: "Comprehensive Services" },
        { name: "مدير المكتب", englishName: "Office Manager" },
        {
            name: "التواصل المؤسسي والتغيير",
            englishName: "Communication & Change Management",
            children: [
                { name: "التوعية الصحية", englishName: "Health Awareness" },
                { name: "التطوع الصحي", englishName: "Health Volunteer" },
                { name: "الالتزام", englishName: "Compliance" },
            ]
        },
        { name: "الشؤون القانونية", englishName: "Legal Affairs" },
        { name: "التخطيط والتحول", englishName: "Planning & Transformation" },
        {
            name: "الامداد",
            englishName: "Supply Chain",
            children: [
                { name: "مستودعات", englishName: "Warehouse" },
                { name: "تخطيط الاحتياج", englishName: "Demand & Forecasting Planning" },
                { name: "ضبط الأداء", englishName: "Performance Setting" },
            ],
        },
        {
            name: "الإدارة الطبية",
            englishName: "Medical Administration",
            children: [
                // Column 1
                { name: "العمليات", englishName: "OR" },
                { name: "التخدير", englishName: "Anesthesia" },
                { name: "الإسعاف والطوارئ", englishName: "Emergency" },
                { name: "النساء والولادة", englishName: "Maternal" },
                { name: "الأطفال", englishName: "Pediatric" },
                { name: "الباطنية", englishName: "Internal Medicine" },
                { name: "العناية المركزة للكبار", englishName: "Adult ICU" },
                { name: "العلاج التنفسي", englishName: "Respiratory Affairs" },
                { name: "الجراحة", englishName: "Surgery" },
                { name: "القلب", englishName: "Cardiology" },
                { name: "العناية المركزة أطفال", englishName: "Pediatric ICU" },
                { name: "جراحة اليوم الواحد", englishName: "Day Surgery" },
                { name: "المسالك البولية", englishName: "Urology" },
                { name: "أنف وأذن وحنجرة", englishName: "ENT" },
                { name: "المناظير", englishName: "Endoscopy" },
                { name: "الجلدية", englishName: "Dermatology" },
                { name: "العظام", englishName: "Orthopedic" },
                // Column 2
                { name: "الطاقة الاستيعابية", englishName: "Bed Capacity" },
                { name: "العيادات الخارجية", englishName: "O.P.D" },
                { name: "الخدمة الاجتماعية", englishName: "Social Service" },
                { name: "المختبر وبنك الدم", englishName: "Laboratory & Blood Bank" },
                { name: "الصيدلية", englishName: "Pharmacy" },
                { name: "الأشعة", englishName: "Radiology" },
                { name: "التغذية", englishName: "Nutrition" },
                { name: "الرعاية المنزلية", englishName: "Homecare" },
                { name: "التأهيل الطبي والعلاج الطبيعي", englishName: "Medical Rehabilitation and Physical Therapy" },
                { name: "شؤون المرضى", englishName: "Patient Affairs" },
                { name: "الأسنان", englishName: "Dental" },
                // Column 3
                { name: "الإحالات والتنسيق الطبي", englishName: "Referral & Medical Coordination" },
                { name: "نموذج الرعاية والصحة السكانية", englishName: "Model of Care& PHM" },
                { name: "التعقيم", englishName: "Sterilization" },
                { name: "إدارة شؤون الوفيات", englishName: "Mortality Affairs" },
                { name: "المراكز الصحية والصحة العامة", englishName: "PHCs & Public Health" },
                { name: "النفايات الطبية", englishName: "Medical Waste" },
                { name: "الرصد الوبائي", englishName: "Epidemiology Surveillance" },
            ],
        },
        {
            name: "الجودة والأداء",
            englishName: "Quality & Performance",
            children: [
                { 
                    name: "الجودة وسلامة المرضى", 
                    englishName: "Quality & Patient Safety",
                    children: [ { name: "سلامة المرضى", englishName: "Patient Safety" } ]
                },
                { name: "إدارة المخاطر", englishName: "Risk Management" },
                { name: "السياسات والإجراءات", englishName: "Policy & Procedure" },
                { name: "اللجان", englishName: "Committee" },
                { 
                    name: "الأداء والنتائج", 
                    englishName: "Performance & Result Management",
                    children: [
                        { name: "وازن", englishName: "Wazen" },
                        { name: "الأداء", englishName: "Performance" },
                        { name: "المراجعة السريرية", englishName: "Clinical Audit" },
                    ]
                },
                { 
                    name: "مشاريع التحسين", 
                    englishName: "Improvement Projects",
                    children: [ { name: "الزائر السري", englishName: "Secret Shopper" } ]
                },
                { name: "الاعتماد", englishName: "Accreditation" },
            ]
        },
        {
            name: "الصحة الرقمية",
            englishName: "Digital Health",
            children: [
                { name: "البنية التحتية والدعم الفني", englishName: "Infrastructure & Technical Support" },
                { name: "المعلومات الصحية", englishName: "Health Information Management" },
                { name: "الإحصاء الطبي والبيانات", englishName: "Medical Statistics & Data" },
            ]
        },
        {
            name: "المالية",
            englishName: "Finance",
            children: [
                { name: "تنمية الإيرادات", englishName: "Revenue Cycle" },
                { name: "الشؤون المالية", englishName: "Finance Affairs" },
                { name: "مراقبة المخزون", englishName: "Inventory Control" },
                { name: "الأصول", englishName: "Assets" },
            ]
        },
        {
            name: "التشغيل",
            englishName: "Operation",
            children: [
                { 
                    name: "الصيانة", 
                    englishName: "Maintenance",
                    children: [
                        { name: "الصيانة العامة", englishName: "General Maintenance" },
                        { name: "الصيانة الطبية والتجهيزات", englishName: "Medical Maintenance & Equipment" },
                    ]
                },
                { 
                    name: "الخدمات المساندة", 
                    englishName: "Support Services",
                    children: [
                        { name: "النقل", englishName: "Transportation" },
                        { name: "الإسكان", englishName: "Housing" },
                    ]
                },
                { name: "النفايات الطبية", englishName: "Medical Waste" },
                { name: "الأمن والسلامة", englishName: "Security & Safety" },
            ]
        },
        {
            name: "الموارد البشرية",
            englishName: "Human Recourse",
            children: [
                { name: "عمليات الموارد البشرية", englishName: "HR Operations" },
                { name: "خدمات الموارد البشرية", englishName: "HR Services" },
                { name: "انتظام الدوام", englishName: "Attendance" },
                { name: "التواصل الداخلي", englishName: "Internal Communication" },
                { name: "الرواتب", englishName: "Payroll" },
                { name: "التدريب والشؤون الأكاديمية", englishName: "Training & Academic Affairs" },
            ]
        }
    ]
};

interface TreeNodeProps {
    node: TreeNodeData;
    level?: number;
    isLast?: boolean;
}

const levelStyles = [
    // Level 0: Root (مدير المستشفى)
    {
        container: 'bg-primary rounded-lg shadow-lg text-white my-2',
        text: 'text-xl',
        englishText: 'text-white opacity-80',
        chevron: 'text-white'
    },
    // Level 1: Main Departments (e.g., التمريض)
    {
        container: 'bg-secondary/10 dark:bg-gray-700 border-r-8 border-secondary dark:border-secondary-light rounded-r-lg my-3 shadow',
        text: 'text-gray-800 dark:text-white font-semibold',
        englishText: 'text-secondary-dark dark:text-secondary',
        chevron: 'text-secondary-dark dark:text-secondary'
    },
    // Level 2: Sub-departments (e.g., الجودة التمريضية)
    {
        container: 'bg-primary/5 dark:bg-gray-800 border-r-4 border-primary dark:border-primary-light my-2',
        text: 'text-primary-dark dark:text-primary-light font-medium',
        englishText: 'text-gray-500 dark:text-gray-400',
        chevron: 'text-primary-dark dark:text-primary-light'
    },
    // Level 3 and deeper
    {
        container: 'bg-gray-100 dark:bg-gray-900/50 border-r-2 border-gray-300 dark:border-gray-600 my-1.5',
        text: 'text-gray-700 dark:text-gray-300',
        englishText: 'text-gray-500 dark:text-gray-400',
        chevron: 'text-gray-500 dark:text-gray-400'
    }
];


const TreeNode: React.FC<TreeNodeProps> = ({ node, level = 0, isLast = false }) => {
    const [isOpen, setIsOpen] = useState(level === 0);
    const hasChildren = node.children && node.children.length > 0;

    const style = levelStyles[Math.min(level, levelStyles.length - 1)];

    const toggle = () => {
        if (hasChildren) {
            setIsOpen(!isOpen);
        }
    };
    
    return (
        <div className="relative">
            {/* Connector Lines */}
            {level > 0 && (
                <>
                    {/* Vertical line segment */}
                    <span
                        className={`absolute top-0 right-4 w-px bg-gray-300 dark:bg-gray-600 ${isLast ? 'h-9' : 'h-full'}`}
                    />
                    {/* Horizontal line segment (the "branch") */}
                    <span className="absolute top-9 right-4 w-4 h-px bg-gray-300 dark:bg-gray-600" />
                </>
            )}

            {/* Container for the card and its children, indented from the lines */}
            <div className={level > 0 ? 'pr-8' : ''}>
                {/* The card itself */}
                <div
                    className={`flex items-center ${style.container} ${hasChildren ? 'cursor-pointer' : ''}`}
                    onClick={toggle}
                    role="button"
                    aria-expanded={isOpen}
                >
                    <div className="p-3 flex items-center justify-center">
                         {hasChildren ? (
                            <ChevronDownIcon
                                className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${style.chevron} ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                            />
                        ) : <div className="w-6 h-6 flex-shrink-0" />}
                    </div>

                    <div className="flex-1 py-2 pr-2">
                        <p className={`font-bold ${style.text}`}>{node.name}</p>
                        <p className={`text-sm ${style.englishText}`}>{node.englishName}</p>
                    </div>
                </div>

                {/* Children are rendered recursively */}
                {hasChildren && isOpen && (
                    <div className="mt-2 animate-fade-in">
                        {node.children?.map((child, index) => (
                            <TreeNode
                                key={index}
                                node={child}
                                level={level + 1}
                                isLast={index === node.children!.length - 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const OrganizationalChartView: React.FC<{ employees: any[] }> = ({ employees }) => {
    return (
        <div className="mt-6 animate-fade-in pb-24 md:pb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6 border border-gray-200 dark:border-gray-700">
                <TreeNode node={treeData} level={0} isLast />
            </div>
        </div>
    );
};

export default OrganizationalChartView;