import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    const overlayRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [onClose])

    if (!isOpen) return null

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
    }

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === overlayRef.current && onClose()}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm animate-fade-in" />

            {/* Content */}
            <div className={clsx(
                'relative w-full glass-dark rounded-2xl shadow-card-hover animate-slide-up z-10',
                sizes[size]
            )}>
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between p-5 border-b border-dark-700">
                        <h2 className="text-white font-bold text-lg">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
                <div className={clsx(!title && 'pt-5')} >
                    {children}
                </div>
            </div>
        </div>
    )
}
