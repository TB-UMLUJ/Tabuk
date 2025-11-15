import React, { useState, useEffect } from 'react';

interface AnimatedStatCardProps {
    title: string;
    value: number;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    bgClass: string;
    iconColorClass: string;
}

const AnimatedStatCard: React.FC<AnimatedStatCardProps> = ({ title, value, icon, bgClass, iconColorClass }) => {
    const [animatedValue, setAnimatedValue] = useState(0);

    useEffect(() => {
        let animationFrameId: number;
        const startValue = 0;
        const endValue = value;
        const duration = 1500;
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsedTime = timestamp - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart
            const currentValue = startValue + (endValue - startValue) * easedProgress;

            setAnimatedValue(currentValue);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setAnimatedValue(endValue);
            }
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [value]);

    return (
        <div className={`relative p-4 rounded-2xl shadow-sm overflow-hidden h-32 bg-gradient-to-bl ${bgClass} backdrop-blur-sm bg-opacity-70 dark:bg-opacity-50`}>
            {/* Faint background circle */}
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/20 dark:bg-white/5 rounded-full" />
            
            {/* Icon on the left */}
            <div className={`absolute -left-4 top-1/2 -translate-y-1/2 opacity-30 dark:opacity-20 ${iconColorClass}`}>
                 {React.cloneElement(icon, { 
                     className: 'w-24 h-24'
                 })}
            </div>
            
            {/* Text content on the right */}
            <div className="relative z-10 text-right h-full flex flex-col justify-center pl-16">
                <p className="font-bold text-4xl sm:text-5xl text-gray-800 dark:text-white">{Math.round(animatedValue)}</p>
                <p className="font-semibold text-gray-600 dark:text-gray-300 mt-1 truncate">{title}</p>
            </div>
        </div>
    );
};

export default AnimatedStatCard;
