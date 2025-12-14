import React, { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });

    const showToast = useCallback((title, message, isSuccess = true) => {
        setToast({
            show: true,
            title,
            message,
            type: isSuccess ? 'success' : 'error'
        });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3000);
    }, []);

    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast.show && (
                <div className={`toast show ${toast.type}`} style={{ display: 'block' }}>
                    <button className="toast-close" onClick={hideToast}>×</button>
                    <div className={`toast-header ${toast.type}`}>{toast.title}</div>
                    <div className="toast-body">{toast.message}</div>
                </div>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
