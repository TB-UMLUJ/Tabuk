
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { tabukHealthClusterLogoMain } from './Logo';

const steps = [
    { id: 1, duration: 1200, text: "التحقق من الهوية..." },
    { id: 2, duration: 1200, text: "تجهيز بيئة العمل..." },
    { id: 3, duration: 1200, text: "جلب أحدث البيانات..." },
    { id: 4, duration: 1200, text: "وضع اللمسات الأخيرة..." },
    { id: 5, duration: 1200, text: "أهلاً بك في منصة تجمع تبوك الصحي!" }
];

const WelcomeScreen: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
    const [progress, setProgress] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const animationFrameId = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const stepTimeouts: ReturnType<typeof setTimeout>[] = [];
        let cumulativeTime = 0;

        steps.forEach((step, index) => {
            stepTimeouts.push(setTimeout(() => {
                setCurrentStepIndex(index);
            }, cumulativeTime));
            cumulativeTime += step.duration;
        });

        // Total duration for the screen is cumulativeTime (6000ms).
        // We make the animation a bit faster to ensure it completes before the component unmounts.
        const totalAnimationDuration = 5800; 

        const animateProgress = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }
            const elapsedTime = timestamp - startTimeRef.current;
            
            if (elapsedTime < totalAnimationDuration) {
                const newProgress = (elapsedTime / totalAnimationDuration) * 100;
                setProgress(newProgress);
                animationFrameId.current = requestAnimationFrame(animateProgress);
            } else {
                setProgress(100); // Ensure it hits 100% and stops the animation.
            }
        };
        
        animationFrameId.current = requestAnimationFrame(animateProgress);

        return () => {
            stepTimeouts.forEach(clearTimeout);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []);

    if (!currentUser) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center animate-fade-in relative">
            <div className="mb-12">
                <img
                    src={tabukHealthClusterLogoMain}
                    alt="شعار تجمع تبوك الصحي"
                    className="w-32 sm:w-36 h-auto"
                />
            </div>
            
            <div className="w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    مرحبا بعودتك، {currentUser.full_name}
                </h2>

                <div className="h-12 flex items-center justify-center mb-4">
                     <p 
                        key={currentStepIndex} 
                        className="text-gray-600 dark:text-gray-400 font-semibold animate-step-text-fade"
                     >
                        {steps[currentStepIndex].text}
                     </p>
                </div>
                
                <div className="relative w-full pt-5">
                    <div 
                        className="absolute top-0 text-xs font-bold text-primary dark:text-primary-light"
                        style={{ 
                            right: `${progress}%`, 
                            transform: 'translateX(50%)',
                            minWidth: '32px', // to fit 100%
                        }}
                    >
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden shadow-inner">
                        <div 
                            className="bg-gradient-to-r from-teal-400 to-primary h-2.5 rounded-full"
                            style={{ 
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                </div>

            </div>
            <p className="absolute bottom-6 text-center text-gray-400 text-xs dark:text-gray-500">
                &copy; {new Date().getFullYear()} تجمع تبوك الصحي. جميع الحقوق محفوظة.
            </p>
        </div>
    );
};

export default WelcomeScreen;
