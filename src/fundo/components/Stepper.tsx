interface StepperProps {
  value: number
  disabled?: boolean
  onChange: (value: number) => void
}

/** Contador −/+ do protótipo. Mínimo 1, igual ao original. */
export function Stepper({ value, disabled = false, onChange }: StepperProps) {
  const clamp = (v: number) => Math.max(1, v)
  return (
    <div className="stepper">
      <button onClick={() => onChange(clamp(value - 1))} aria-label="Diminuir">−</button>
      <input
        type="number"
        min={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(clamp(parseInt(e.target.value, 10) || 1))}
      />
      <button onClick={() => onChange(clamp(value + 1))} aria-label="Aumentar">+</button>
    </div>
  )
}
