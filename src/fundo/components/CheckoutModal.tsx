import { useMemo, useState } from 'react'
import { brl, modoLabel, previsaoLabel } from '../format'
import { CATEGORIA_DOCUMENTO, TIPOS_DOCUMENTO } from '../meta'
import type { Acao, LojaOpcao, TipoDocumento } from '../types'
import { AcaoThumb } from './AcaoThumb'
import { FileField } from './FileField'
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
  onConfirm: (payload: {
    lojas: { nome: string; store_unique_id?: string; quantidade: number }[]
    valor?: number
    documento_tipo?: TipoDocumento
    documento?: string
  }) => void
}

/** Acima disso o checkbox vira lista com busca — o gestor enxerga centenas de
 *  lojas e rolar tudo não é usável. */
const LIMIAR_BUSCA = 8

export function CheckoutModal({
  acao, saldo, lojas, erro, enviando, onClose, onConfirm,
}: CheckoutModalProps) {
  const [sel, setSel] = useState<Record<string, number>>({})
  const [busca, setBusca] = useState('')
  // Categoria documento: o franqueado informa o valor e anexa boleto/NF.
  const [valorDoc, setValorDoc] = useState('')
  const [tipoDoc, setTipoDoc] = useState<TipoDocumento>('nota_fiscal')
  const [arquivo, setArquivo] = useState<{ dataUrl: string; nome: string } | null>(null)

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase()
    const base = q ? lojas.filter((l) => `${l.nome} ${l.cidade}`.toLowerCase().includes(q)) : lojas
    // Loja marcada nunca some do filtro — senão o usuário perde a seleção de vista.
    const marcadas = lojas.filter((l) => sel[l.id] && !base.includes(l))
    return [...marcadas, ...base].slice(0, 40)
  }, [lojas, busca, sel])

  const ehDocumento = acao?.categoria === CATEGORIA_DOCUMENTO

  const totais = useMemo(() => {
    const lojasSel = Object.keys(sel).length
    if (ehDocumento) {
      // Uma loja, quantidade 1: o gasto é do documento, não de N unidades.
      return { unidades: 1, preco: Number(valorDoc.replace(',', '.')) || 0, lojas: lojasSel }
    }
    const unidades = Object.values(sel).reduce((a, b) => a + b, 0)
    return { unidades, preco: unidades * (acao?.preco ?? 0), lojas: lojasSel }
  }, [sel, acao, ehDocumento, valorDoc])

  const alterna = (id: string) =>
    // Documento vale para UMA loja: marcar outra troca, não acumula.
    setSel(({ [id]: atual, ...resto }) =>
      atual ? resto : ehDocumento ? { [id]: 1 } : { ...resto, [id]: 1 })
  const qtd = (id: string, q: number) => setSel((s) => (s[id] ? { ...s, [id]: q } : s))

  if (!acao) return null

  const lojasEscolhidas = Object.keys(sel).length > 0
  const docOk = !ehDocumento || (!!arquivo && totais.preco > 0)
  const cabe = totais.preco <= saldo && totais.preco > 0 && lojasEscolhidas && docOk

  const confirmar = () =>
    onConfirm({
      lojas: Object.entries(sel).map(([id, quantidade]) => ({
        nome: lojas.find((l) => l.id === id)?.nome ?? id,
        store_unique_id: id,
        quantidade,
      })),
      ...(ehDocumento
        ? { valor: totais.preco, documento_tipo: tipoDoc, documento: arquivo?.dataUrl }
        : {}),
    })

  return (
    <Modal open
      title={ehDocumento ? 'Enviar documento' : 'Resgatar ação'}
      subtitle={ehDocumento ? 'Informe o valor e anexe o boleto ou a nota fiscal'
        : 'Escolha as lojas e a quantidade'}
      variant="co" onClose={onClose}>
      <div className="co-item">
        <AcaoThumb acao={acao} className="co-thumb" />
        <div>
          <div className="co-nm">{acao.nome}</div>
          <div className="co-unit">
            {ehDocumento
              ? 'O valor sai do documento · debitado da carteira após aprovação'
              : `${brl(acao.preco)} / unidade · debitado da carteira`}
          </div>
        </div>
      </div>

      {ehDocumento && (
        <div className="co-stores co-doc">
          <div className="ger-grid">
            <label className="fld">
              <span>Tipo do documento</span>
              <select value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value as TipoDocumento)}>
                {TIPOS_DOCUMENTO.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>
            <label className="fld">
              <span>Valor (R$)</span>
              <input type="number" min="0.01" step="0.01" value={valorDoc}
                onChange={(e) => setValorDoc(e.target.value)} placeholder="1.250,00" />
            </label>
          </div>
          <FileField
            label="Arquivo"
            accept="application/pdf,image/png,image/jpeg,image/gif,image/webp"
            hint="PDF ou imagem até 8 MB. O time confere antes de aprovar."
            atual={arquivo?.nome}
            onPick={(dataUrl, nome) => setArquivo({ dataUrl, nome })}
            onClear={() => setArquivo(null)}
          />
        </div>
      )}

      <div className="co-sec-t">{ehDocumento ? 'De qual loja é esse gasto?' : 'Para quais lojas?'}</div>
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
              {!ehDocumento && (
                <Stepper value={sel[l.id] ?? 1} disabled={!on} onChange={(q) => qtd(l.id, q)} />
              )}
            </div>
          )
        })}
      </div>

      <div className="co-summary">
        <div className="co-row">
          <span className="mut">
            {ehDocumento
              ? `${TIPOS_DOCUMENTO.find((t) => t.id === tipoDoc)?.label} · ${totais.lojas} loja(s)`
              : `${totais.unidades} unidade(s) · ${totais.lojas} loja(s)`}
          </span>
          <span>{brl(totais.preco)}</span>
        </div>
        <div className="co-row">
          <span className="mut">Saldo após o resgate</span>
          <span>{brl(Math.max(0, saldo - totais.preco))}</span>
        </div>
        <div className="co-row total"><span>Total</span><span>{brl(totais.preco)}</span></div>
      </div>

      <div className="co-eta">
        {ehDocumento
          ? <>🧾 <div><b>Aprovação:</b> o pedido entra em Solicitação e o time confere o documento
              antes de seguir. Se for recusado, o valor volta pra sua carteira.</div></>
          : <>🚚 <div><b>{modoLabel(acao.modo)}:</b> {previsaoLabel(acao.modo, acao.prazo_dias)}</div></>}
      </div>

      {erro && <div className="co-warn">{erro}</div>}
      {!erro && lojasEscolhidas && totais.preco > saldo && (
        <div className="co-warn">
          Saldo insuficiente ({brl(saldo)} disponível). Ajuste {ehDocumento ? 'o valor' : 'as lojas ou a quantidade'}.
        </div>
      )}
      {!erro && !lojasEscolhidas && <div className="co-warn">Selecione ao menos uma loja.</div>}
      {!erro && ehDocumento && lojasEscolhidas && totais.preco <= 0 && (
        <div className="co-warn">Informe o valor do documento.</div>
      )}
      {!erro && ehDocumento && lojasEscolhidas && totais.preco > 0 && !arquivo && (
        <div className="co-warn">Anexe o boleto ou a nota fiscal.</div>
      )}

      <div className="co-foot">
        <button className="btn btn-accent btn-block btn-lg" disabled={!cabe || enviando} onClick={confirmar}>
          {enviando ? 'Enviando…'
            : `${ehDocumento ? 'Enviar para aprovação' : 'Confirmar resgate'} · ${brl(totais.preco)}`}
        </button>
      </div>
    </Modal>
  )
}
