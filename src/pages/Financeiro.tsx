import { useState } from 'react'
import { Toast } from '../fundo/components/Toast'
import { useToast } from '../fundo/useToast'
import { UsuariosTab } from './financeiro/UsuariosTab'
import { ValoresTab } from './financeiro/ValoresTab'
import { Page, PageHead } from './shared'

type Aba = 'usuarios' | 'valores'

const ABAS: { id: Aba; label: string }[] = [
  { id: 'usuarios', label: '👥 Usuários' },
  { id: 'valores', label: '📈 Valores' },
]

/** Área do gestor: liga a cobrança do fundo (Financeiro) à carteira do app.
 *  O backend recusa as chamadas para quem não é admin/manager. */
export function Financeiro() {
  const [aba, setAba] = useState<Aba>('usuarios')
  const { message, toast } = useToast()

  return (
    <Page>
      <PageHead eyebrow="Fundo de Marketing" title="Financeiro"
        desc="Quem pagou o fundo, quem está conectado ao HRM e para onde vai o dinheiro: 85% vira crédito do franqueado, 15% é taxa de administração." />

      <div className="fund-subnav">
        {ABAS.map((a) => (
          <button key={a.id} className={`fsub ${aba === a.id ? 'active' : ''}`} onClick={() => setAba(a.id)}>
            {a.label}
          </button>
        ))}
      </div>

      {aba === 'usuarios' && <UsuariosTab onToast={toast} />}
      {aba === 'valores' && <ValoresTab />}

      <Toast message={message} />
    </Page>
  )
}
