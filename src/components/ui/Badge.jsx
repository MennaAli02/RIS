const COLORS = {
  gray: 'bg-gray-100 text-gray-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
}

export default function Badge({ text, color = 'gray' }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${COLORS[color] || COLORS.gray}`}>
      {text}
    </span>
  )
}
