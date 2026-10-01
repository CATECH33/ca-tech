import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function openLoic() {
  if (typeof window !== 'undefined' && window.axeptioSDK) {
    // Axeptio widget trigger if available
  }
  const el = document.getElementById('contact')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
