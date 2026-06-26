import { cn } from '@/lib/utils'
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

export function Table({ className, children, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export function Thead({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('border-b border-gray-100', className)} {...props}>{children}</thead>
}

export function Tbody({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-gray-50', className)} {...props}>{children}</tbody>
}

export function Tr({ className, children, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn('hover:bg-gray-50/60 transition-colors group', className)} {...props}>
      {children}
    </tr>
  )
}

export function Th({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap', className)} {...props}>
      {children}
    </th>
  )
}

export function Td({ className, children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-4 py-3 text-gray-700 whitespace-nowrap', className)} {...props}>
      {children}
    </td>
  )
}

interface EmptyRowProps { cols: number; message?: string }
export function EmptyRow({ cols, message = 'Aucune donnée' }: EmptyRowProps) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-12 text-center text-sm text-gray-400">
        {message}
      </td>
    </tr>
  )
}
