import { useMemo, useState } from 'react'
import { brl, modoLabel, previsaoLabel } from '../format'
import { tileGradient } from '../tile'
import type { Acao, LojaOpcao } from '../types'
import { Modal } from './Modal'
import { Stepper } from './Stepper'

interface CheckoutModalProps {
  /** null = modal fechada. */
  acao: Acao | null
  saldo: number
  lojas: LojaOpcao[]
  /** Erro devolvido pelo backend no resgate (saldo, ação desativada…). */
  erro: string | null
  enviando: boolean
  onClose: () => void
  onConfirm: (lojas: { nome: string; store_unique_id?: string; quantidade: number }[]) => void
}

/** Acima disso o checkbox vira lista com busca — o gestor enxerga centenas de
 *  lojas e rolar tudo não é usável. */
const LIMIAR_BUSCA = 8

export function CheckoutModal({
  acao, saldo, lojas, erro, enviando, onClose, onConfirm,
}: CheckoutModalProps) {
  const [sel, setSel] = useState<Record<string, number>>({})
  const [busca, setBusca] = useState('')

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase()
    const base = q ? lojas.filter((l) => `${l.nome} ${l.cidade}`.toLowerCase().includes(q)) : lojas
    // Loja marcada nunca some do filtro — senão o usuário perde a seleção de vista.
    const marcadas = lojas.filter((l) => sel[l.id] && !base.includes(l))
    return [...marcadas, ...base].slice(0, 40)
  }, [lojas, busca, sel])

  const totais = useMemo(() => {
    const unidades = Object.values(sel).reduce((a, b) => a + b, 0)
    return { unidades, preco: unidades * (acao?.preco ?? 0), lojas: Object.keys(sel).length }
  }, [sel, acao])

  const alterna = (id: string) =>
    setSel(({ [id]: atual, ...resto }) => (atual ? resto : { ...resto, [id]: 1 }))
  const qtd = (id: string, q: number) => setSel((s) => (s[id] ? { ...s, [id]: q } : s))

  if (!acao) return null
  const cabe = totais.preco <= saldo && totais.unidades > 0

  const confirmar = () =>
    onConfirm(Object.entries(sel).map(([id, quantidade]) => ({
      nome: lojas.find((l) => l.id === id)?.nome ?? id,
      store_unique_id: id,
      quantidade,
    })))

  return (
    <Modal open title="Resgatar ação" subtitle="Escolha as lojas e a quantidade"
      variant="co" onClose={onClose}>
      <div className="co-item">
        <div className="co-thumb" style={{ background: tileGradient(acao.slug) }}>{acao.emoji}</div>
        <div>
          <div className="co-nm">{acao.nome}</div>
          <div className="co-unit">{brl(acao.preco)} / unidade · debitado da carteira</div>
        </div>
      </div>

      <div className="co-sec-t">Para quais lojas?</div>
      {lojas.length > LIMIAR_BUSCA && (
        <div className="co-stores">
          <input className="co-search" placeholder="Buscar loja…" value={busca}
            onChange={(e) => setBusca(e.target.value)} />
        </div>
      )}
      <div className="co-stores">
        {lojas.length === 0 && (
          <div className="co-store-ci" style={{ padding: '12px 0' }}>
            Nenhuma loja vinculada ao seu usuário. Fale com o time para liberar as lojas.
          </div>
        )}
        {visiveis.map((l) => {
          const on = !!sel[l.id]
          return (
            <div className={`co-store ${on ? 'on' : ''}`} key={l.id}>
              <button className="co-check" onClick={() => alterna(l.id)} aria-pressed={on}>{on ? '✓' : ''}</button>
              <div className="co-store-info" onClick={() => alterna(l.id)}>
                <div className="co-store-nm">{l.nome}</div>
                <div className="co-store-ci">{l.cidade || l.id}</div>
              </div>
              <Stepper value={sel[l.id] ?? 1} disabled={!on} onChange={(q) => qtd(l.id, q)} />
            </div>
          )
        })}
      </div>

      <div className="co-summary">
        <div className="co-row">
          <span className="mut">{totais.unidades} unidade(s) · {totais.lojas} loja(s)</span>
          <span>{brl(totais.preco)}</span>
        </div>
        <div className="co-row">
          <span className="mut">Saldo após o resgate</span>
          <span>{brl(Math.max(0, saldo - totais.preco))}</span>
        </div>
        <div className="co-row total"><span>Total</span><span>{brl(totais.preco)}</span></div>
      </div>

      <div className="co-eta">
        🚚 <div><b>{modoLabel(acao.modo)}:</b> {previsaoLabel(acao.modo, acao.prazo_dias)}</div>
      </div>

      {erro && <div className="co-warn">{erro}</div>}
      {!erro && !cabe && totais.unidades > 0 && (
        <div className="co-warn">Saldo insuficiente para essa quantidade. Ajuste as lojas ou a quantidade.</div>
      )}
      {!erro && totais.unidades === 0 && <div className="co-warn">Selecione ao menos uma loja.</div>}

      <div className="co-foot">
        <button className="btn btn-accent btn-block btn-lg" disabled={!cabe || enviando} onClick={confirmar}>
          {enviando ? 'Registrando…' : `Confirmar resgate · ${brl(totais.preco)}`}
        </button>
      </div>
    </Modal>
  )
}
