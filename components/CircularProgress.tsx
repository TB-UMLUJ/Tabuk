import React from 'react';

interface CircularProgressProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    showPercentageText?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, size = 120, strokeWidth = 10, showPercentageText = true }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    let colorClass = 'text-danger';
    if (percentage >= 99) { // Use >= 99 to handle potential floating point inaccuracies
        colorClass = 'text-primary';
    } else if (percentage > 40) {
        colorClass = 'text-yellow-500';
    }

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
                <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={`transition-[stroke-dashoffset] duration-500 ease-out ${colorClass}`}
                    style={{ strokeDashoffset: offset }}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            {showPercentageText && (
                <span 
                    className={`absolute font-bold ${colorClass}`}
                    style={{ fontSize: `${size < 50 ? size / 3.5 : size / 5}px` }}
                >
                    {`${Math.round(percentage)}%`}
                </span>
            )}
        </div>
    );
};

export default CircularProgress;
