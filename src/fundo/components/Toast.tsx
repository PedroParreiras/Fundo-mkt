/** Toast fixo no rodapé — mesmo markup do protótipo. */
export function Toast({ message }: { message: string | null }) {
  return (
    <div className={`toast ${message ? 'show' : ''}`}>
      <span className="ti">✓</span>
      {message}
    </div>
  )
}
