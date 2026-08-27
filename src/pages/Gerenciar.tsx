import { useState } from 'react'
import { Toast } from '../fundo/components/Toast'
import { useFundo } from '../fundo/fundoStore'
import { useToast } from '../fundo/useToast'
import { CampanhasTab } from './gerenciar/CampanhasTab'
import { CarteirasTab } from './gerenciar/CarteirasTab'
import { PedidosTab } from './gerenciar/PedidosTab'
import { ProdutosTab } from './gerenciar/ProdutosTab'
import { Page, PageHead } from './shared'

type Aba = 'produtos' | 'campanhas' | 'carteiras' | 'pedidos'

const ABAS: { id: Aba; label: string }[] = [
  { id: 'produtos', label: '🗂️ Produtos' },
  { id: 'campanhas', label: '🗓️ Campanhas' },
  { id: 'carteiras', label: '💰 Carteiras' },
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
        desc="Catálogo de ações, campanhas do cronograma, saldo das carteiras e acompanhamento de todos os pedidos." />

      <div className="fund-subnav">
        {ABAS.map((a) => (
          <button key={a.id} className={`fsub ${aba === a.id ? 'active' : ''}`} onClick={() => setAba(a.id)}>
            {a.label}
          </button>
        ))}
      </div>

      {aba === 'produtos' && <ProdutosTab onChanged={refresh} />}
      {aba === 'campanhas' && <CampanhasTab onToast={toast} />}
      {aba === 'carteiras' && <CarteirasTab onToast={toast} />}
      {aba === 'pedidos' && <PedidosTab onToast={toast} />}

      <Toast message={message} />
    </Page>
  )
}
