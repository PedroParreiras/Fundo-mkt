import { useState } from 'react'
import { Toast } from '../fundo/components/Toast'
import { useFundo } from '../fundo/fundoStore'
import { useToast } from '../fundo/useToast'
import { ProdutosTab } from './gerenciar/ProdutosTab'
import { PedidosTab } from './gerenciar/PedidosTab'
import { Page, PageHead } from './shared'

type Aba = 'produtos' | 'pedidos'

const ABAS: { id: Aba; label: string }[] = [
  { id: 'produtos', label: '🗂️ Produtos' },
  { id: 'pedidos', label: '📦 Pedidos' },
]

/** Área do gestor: mantém o catálogo e move os pedidos na esteira.
 *  O backend recusa as duas coisas para quem não é admin/manager. */
export function Gerenciar() {
  const [aba, setAba] = useState<Aba>('produtos')
  const { refresh } = useFundo()
  const { message, toast } = useToast()

  return (
    <Page>
      <PageHead eyebrow="Fundo de Marketing" title="Gerenciar"
        desc="Catálogo de ações que o franqueado pode resgatar e acompanhamento de todos os pedidos." />

      <div className="fund-subnav">
        {ABAS.map((a) => (
          <button key={a.id} className={`fsub ${aba === a.id ? 'active' : ''}`} onClick={() => setAba(a.id)}>
            {a.label}
          </button>
        ))}
      </div>

      {aba === 'produtos'
        ? <ProdutosTab onChanged={refresh} />
        : <PedidosTab onToast={toast} />}

      <Toast message={message} />
    </Page>
  )
}
