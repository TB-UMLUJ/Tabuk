import React, { useState, useEffect } from 'react';

interface GaugeProps {
    value: number;
    maxValue?: number;
}

const EmployeeCountGauge: React.FC<GaugeProps> = ({ value, maxValue = 250 }) => {
    const [animatedValue, setAnimatedValue] = useState(0);

    useEffect(() => {
        let animationFrameId: number;
        const startValue = 0; // Always start from 0
        const endValue = value;
        const duration = 1500; // 1.5 seconds animation
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsedTime = timestamp - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Ease-out cubic function for a smooth finish
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentValue = startValue + (endValue - startValue) * easedProgress;

            setAnimatedValue(currentValue);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [value]);

    const minAngle = -90;
    const maxAngle = 90;
    const angleRange = maxAngle - minAngle;
    
    // Angle stops for colors
    const greenEndAngle = minAngle + angleRange * 0.5; // 0 degrees
    const yellowEndAngle = minAngle + angleRange * 0.8; // 54 degrees

    const valueToAngle = (val: number) => {
        const percentage = Math.min(Math.max(val, 0), maxValue) / maxValue;
        return minAngle + percentage * angleRange;
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        const d = [ "M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y ].join(" ");
        return d;
    };

    const indicatorAngle = valueToAngle(value);
    const indicatorPath = describeArc(100, 100, 75, minAngle, indicatorAngle);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center">
            
            <p className="text-lg font-bold text-gray-800 dark:text-white">إجمالي عدد الموظفين</p>
            
            <svg viewBox="0 0 200 125" className="w-full max-w-sm mx-auto">
                {/* Background track */}
                <path d={describeArc(100, 100, 75, minAngle, maxAngle)} fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="12" strokeLinecap="round" />
                
                {/* Mask to reveal the colored track based on animated value */}
                <mask id="gauge-mask">
                    <path d={indicatorPath} fill="none" stroke="white" strokeWidth="14" strokeLinecap="round" />
                </mask>

                {/* Group of colored segments, which will be masked */}
                <g mask="url(#gauge-mask)">
                    <path d={describeArc(100, 100, 75, minAngle, greenEndAngle)} fill="none" stroke="#10B981" strokeWidth="12" strokeLinecap="round" />
                    <path d={describeArc(100, 100, 75, greenEndAngle, yellowEndAngle)} fill="none" stroke="#FBBF24" strokeWidth="12" strokeLinecap="round" />
                    <path d={describeArc(100, 100, 75, yellowEndAngle, maxAngle)} fill="none" stroke="#F87171" strokeWidth="12" strokeLinecap="round" />
                </g>
                
                {/* Text in the middle */}
                <text x="100" y="80" textAnchor="middle" className="text-4xl sm:text-5xl font-bold fill-gray-900 dark:fill-white">
                    {Math.round(animatedValue)}
                </text>
                <text x="100" y="102" textAnchor="middle" className={`text-xl font-semibold fill-primary`}>
                    موظف
                </text>

                 {/* Min/Max Labels */}
                <text x="20" y="118" textAnchor="middle" className="text-sm font-medium fill-gray-500 dark:fill-gray-400">0</text>
                <text x="180" y="118" textAnchor="middle" className="text-sm font-medium fill-gray-500 dark:fill-gray-400">{maxValue}</text>
            </svg>
        </div>
    );
};

export default EmployeeCountGauge;