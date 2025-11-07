import React from 'react';

// A single shimmering card placeholder for grid views
const CardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse flex items-start gap-4">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-20 w-20 flex-shrink-0"></div>
            <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    </div>
);

// A placeholder for list-like items (e.g., office directory)
const ListSkeleton: React.FC = () => (
     <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse flex items-center gap-4">
             <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-12 w-12 flex-shrink-0"></div>
             <div className="flex-1 space-y-3 py-1">
                 <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                 <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/5"></div>
             </div>
             <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
    </div>
)

interface SkeletonLoaderProps {
    activeTab: 'directory' | 'orgChart' | 'officeDirectory' | 'tasks' | 'transactions' | 'statistics';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ activeTab }) => {
    const getSkeletonComponent = () => {
         switch (activeTab) {
            case 'directory':
            case 'transactions':
            case 'tasks':
                return CardSkeleton;
            case 'officeDirectory':
                return ListSkeleton;
            default:
                // For OrgChart and Statistics, a simpler loader is fine as they don't have a repeating grid.
                return () => (
                    <div className="lg:col-span-4 flex flex-col justify-center items-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                         <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div>
                         <p className="mt-4 font-semibold text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
                    </div>
                );
        }
    };
    
    const SkeletonComponent = getSkeletonComponent();
    const repeatCount = ['directory', 'tasks', 'transactions', 'officeDirectory'].includes(activeTab) ? 8 : 1;
    const gridColsClass = activeTab === 'officeDirectory' 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';


    return (
        <div className="mt-6">
            <div className={`grid ${gridColsClass} gap-4`}>
                {Array.from({ length: repeatCount }).map((_, i) => (
                    <SkeletonComponent key={i} />
                ))}
            </div>
        </div>
    );
};

export default SkeletonLoader;
