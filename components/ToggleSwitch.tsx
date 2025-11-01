import React from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: () => void;
    ariaLabel: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, ariaLabel }) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
            }`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    checked ? '-translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    );
};

export default ToggleSwitch;
