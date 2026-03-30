import { Star } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

// Interactive star rating for forms
export default function StarRating({ value = 0, onChange, size = 20, readonly = false }) {
    const [hovered, setHovered] = useState(0)

    const display = hovered || value

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onChange?.(star)}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    className={clsx(
                        'transition-transform duration-100',
                        !readonly && 'hover:scale-110 cursor-pointer',
                        readonly && 'cursor-default'
                    )}
                >
                    <Star
                        size={size}
                        className={clsx(
                            'transition-colors duration-100',
                            star <= display
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-dark-700'
                        )}
                    />
                </button>
            ))}
            {!readonly && value > 0 && (
                <span className="text-dark-400 text-sm ml-1">{value}/5</span>
            )}
        </div>
    )
}
