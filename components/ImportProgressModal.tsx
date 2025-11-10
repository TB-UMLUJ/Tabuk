import React from 'react';
import ReactDOM from 'react-dom';

interface ImportProgressModalProps {
    isOpen: boolean;
    fileName: string;
    fileSize: number; // in bytes
    progress: number; // 0-100
}

const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const FileIcon: React.FC = () => (
    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">XLSX</span>
    </div>
);

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
    const segments = 50;
    return (
        <div className="mt-2.5 mb-1.5 h-2 w-full flex items-center gap-px">
            {Array.from({ length: segments }).map((_, i) => {
                const segmentProgress = (i + 1) / segments * 100;
                const isActive = progress >= segmentProgress;
                return (
                    <div
                        key={i}
                        className={`h-full flex-1 rounded-sm transition-colors duration-200 ${isActive ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                    />
                );
            })}
        </div>
    );
};

const ImportProgressModal: React.FC<ImportProgressModalProps> = ({ isOpen, fileName, fileSize, progress }) => {
    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[60] flex justify-center items-center p-4"
            role="dialog"
            aria-modal="true"
            aria-live="polite"
        >
            <div className="fixed inset-0 bg-black/60 animate-backdrop-in" />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md m-4 p-6 dark:bg-gray-800 animate-modal-in-scale">
                <div className="flex items-start gap-4">
                    <FileIcon />
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                            <p className="font-bold text-gray-800 dark:text-white truncate" title={fileName}>
                                {fileName || 'Importing...'}
                            </p>
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        
                        <ProgressBar progress={progress} />

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            .xlsx / {formatBytes(fileSize)}
                        </p>
                    </div>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default ImportProgressModal;
