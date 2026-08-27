import { useRef, useState } from 'react'

interface FileFieldProps {
  label: string
  hint?: string
  accept: string
  /** Nome do arquivo já escolhido (ou já salvo no servidor). */
  atual?: string | null
  /** data-URL base64 — é o que os endpoints de anexo esperam. */
  onPick: (dataUrl: string, nome: string) => void
  onClear?: () => void
}

/** Máx. 8 MB — o mesmo limite que o backend recusa, para o usuário descobrir
 *  antes de subir o arquivo inteiro. */
const LIMITE = 8 * 1024 * 1024

export function FileField({ label, hint, accept, atual, onPick, onClear }: FileFieldProps) {
  const ref = useRef<HTMLInputElement>(null)
  const [erro, setErro] = useState<string | null>(null)

  const escolher = (file?: File) => {
    if (!file) return
    if (file.size > LIMITE) {
      setErro('Arquivo muito grande (máx. 8 MB)')
      return
    }
    setErro(null)
    const reader = new FileReader()
    reader.onload = () => onPick(String(reader.result), file.name)
    reader.onerror = () => setErro('Não consegui ler o arquivo')
    reader.readAsDataURL(file)
  }

  return (
    <div className="fld fld-wide">
      <span>{label}</span>
      <div className="file-row">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => ref.current?.click()}>
          {atual ? 'Trocar arquivo' : 'Escolher arquivo'}
        </button>
        <span className="file-name">{atual || 'Nenhum arquivo escolhido'}</span>
        {atual && onClear && (
          <button type="button" className="link-btn danger" onClick={onClear}>Remover</button>
        )}
      </div>
      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }}
        onChange={(e) => { escolher(e.target.files?.[0]); e.target.value = '' }} />
      {hint && !erro && <span className="file-hint">{hint}</span>}
      {erro && <span className="file-hint erro">{erro}</span>}
    </div>
  )
}
