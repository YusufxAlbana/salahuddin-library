import { createContext, useContext, useState, useCallback } from 'react'
import '../App.css'

// Create contexts
const ToastContext = createContext(null)
const ModalContext = createContext(null)

// Toast types
const TOAST_TYPES = {
    success: {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        ),
        color: '#10b981',
        bg: '#d1fae5'
    },
    error: {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
        ),
        color: '#ef4444',
        bg: '#fee2e2'
    },
    warning: {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        ),
        color: '#d4af37',
        bg: '#fef3c7'
    },
    info: {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        ),
        color: '#3b82f6',
        bg: '#dbeafe'
    }
}

// Toast Component
function Toast({ id, message, type = 'info', onClose }) {
    const toastStyle = TOAST_TYPES[type] || TOAST_TYPES.info

    return (
        <div
            className="custom-toast"
            style={{
                background: toastStyle.bg,
                borderLeft: `4px solid ${toastStyle.color}`,
                color: '#1f2937'
            }}
        >
            <span className="toast-icon" style={{ color: toastStyle.color }}>
                {toastStyle.icon}
            </span>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={() => onClose(id)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    )
}

// Toast Container
function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={removeToast}
                />
            ))}
        </div>
    )
}

// Confirmation Modal Component
function ConfirmModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, type = 'warning' }) {
    if (!isOpen) return null

    const modalStyle = TOAST_TYPES[type] || TOAST_TYPES.warning

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-icon" style={{ color: modalStyle.color, background: modalStyle.bg }}>
                    {modalStyle.icon}
                </div>
                <h3 className="modal-title">{title || 'Konfirmasi'}</h3>
                <p className="modal-message">{message}</p>
                <div className="modal-buttons">
                    <button className="btn-modal btn-cancel" onClick={onCancel}>
                        {cancelText || 'Batal'}
                    </button>
                    <button
                        className="btn-modal btn-confirm"
                        onClick={onConfirm}
                        style={{ background: modalStyle.color }}
                    >
                        {confirmText || 'Ya, Lanjutkan'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Toast Provider
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { id, message, type }])

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, duration)
        }

        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    // Shorthand methods
    const toast = {
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
        warning: (msg, duration) => addToast(msg, 'warning', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
        remove: removeToast
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

// Modal Provider
export function ModalProvider({ children }) {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        cancelText: '',
        type: 'warning',
        onConfirm: () => { },
        onCancel: () => { }
    })

    const showConfirm = useCallback((options) => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                title: options.title || 'Konfirmasi',
                message: options.message || 'Apakah Anda yakin?',
                confirmText: options.confirmText || 'Ya',
                cancelText: options.cancelText || 'Batal',
                type: options.type || 'warning',
                onConfirm: () => {
                    setModalState(prev => ({ ...prev, isOpen: false }))
                    resolve(true)
                },
                onCancel: () => {
                    setModalState(prev => ({ ...prev, isOpen: false }))
                    resolve(false)
                }
            })
        })
    }, [])

    const hideModal = useCallback(() => {
        setModalState(prev => ({ ...prev, isOpen: false }))
    }, [])

    return (
        <ModalContext.Provider value={{ showConfirm, hideModal }}>
            {children}
            <ConfirmModal {...modalState} />
        </ModalContext.Provider>
    )
}

// Combined Provider
export function NotificationProvider({ children }) {
    return (
        <ToastProvider>
            <ModalProvider>
                {children}
            </ModalProvider>
        </ToastProvider>
    )
}

// Hooks
export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}

export function useModal() {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error('useModal must be used within ModalProvider')
    }
    return context
}

// Export both hooks together
export function useNotification() {
    const toast = useToast()
    const modal = useModal()
    return { toast, ...modal }
}

export default NotificationProvider
