import clsx from 'clsx'

export default function LoadingSpinner({ size = 'md', text = '', className = '' }) {
    const sizes = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-3',
        xl: 'w-16 h-16 border-4',
    }

    return (
        <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
            <div
                className={clsx(
                    sizes[size],
                    'rounded-full border-dark-700 border-t-brand-500 animate-spin'
                )}
            />
            {text && <p className="text-dark-400 text-sm animate-pulse">{text}</p>}
        </div>
    )
}

export function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="xl" text="Loading..." />
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="card animate-pulse">
            <div className="h-48 bg-dark-800 rounded-t-xl" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-dark-800 rounded w-3/4" />
                <div className="h-3 bg-dark-800 rounded w-1/2" />
                <div className="h-3 bg-dark-800 rounded w-full" />
                <div className="h-3 bg-dark-800 rounded w-2/3" />
            </div>
        </div>
    )
}

export function GridSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    )
}
