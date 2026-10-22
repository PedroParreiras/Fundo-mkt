import { useState } from 'react'
import type { Region } from '../../lib/region'
import { draftDe, type AcaoDraft } from '../acaoDraft'
import { CATEGORIA_DOCUMENTO, CATEGORIAS, MODOS } from '../meta'
import type { Acao, Categoria, Modo } from '../types'
import { AcaoThumb } from './AcaoThumb'
import { FileField } from './FileField'
import { PrecosRegiaoField } from './PrecosRegiaoField'

interface AcaoFormProps {
  inicial?: Acao
  /** Região do toggle — a única marcada quando a ação é nova. */
  regiao: Region
  salvando: boolean
  erro: string | null
  onCancel: () => void
  onSubmit: (d: AcaoDraft) => void
  /** Sobe a imagem da ação. Só existe depois de salva (precisa do id), então
   *  no formulário de criação a seção nem aparece. */
  onImagem?: (dataUrl: string) => void
  onRemoverImagem?: () => void
}

/** Formulário de ação. Não valida regra de negócio: quem valida preço,
 *  categoria e modo é o backend, e a mensagem dele é a que aparece. */
export function AcaoForm({
  inicial, regiao, salvando, erro, onCancel, onSubmit, onImagem, onRemoverImagem,
}: AcaoFormProps) {
  const [d, setD] = useState<AcaoDraft>(() => draftDe(inicial, regiao))
  const set = <K extends keyof AcaoDraft>(k: K, v: AcaoDraft[K]) => setD((p) => ({ ...p, [k]: v }))
  const ehDocumento = d.categoria === CATEGORIA_DOCUMENTO

  return (
    <form className="ger-form" onSubmit={(e) => { e.preventDefault(); onSubmit(d) }}>
      <div className="ger-grid">
        <label className="fld fld-wide">
          <span>Nome da ação</span>
          <input value={d.nome} onChange={(e) => set('nome', e.target.value)}
            placeholder="Kit de comunicação mensal" autoFocus />
        </label>

        <label className="fld">
          <span>Categoria</span>
          <select value={d.categoria} onChange={(e) => set('categoria', e.target.value as Categoria)}>
            {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>

        <label className="fld fld-wide">
          <span>Descrição</span>
          <textarea rows={2} value={d.descricao} onChange={(e) => set('descricao', e.target.value)}
            placeholder="O que o franqueado recebe ao resgatar." />
        </label>

        <label className="fld">
          <span>Modo de entrega</span>
          <select value={d.modo} onChange={(e) => set('modo', e.target.value as Modo)}>
            {MODOS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>

        <label className="fld">
          <span>Prazo (dias)</span>
          <input type="number" min={0} value={d.prazo_dias}
            onChange={(e) => set('prazo_dias', e.target.value)} />
        </label>

        <label className="fld fld-narrow">
          <span>Emoji</span>
          <input value={d.emoji} onChange={(e) => set('emoji', e.target.value)} maxLength={4} />
        </label>

        <PrecosRegiaoField precos={d.precos} semPreco={ehDocumento}
          onChange={(r, v) => set('precos', { ...d.precos, [r]: v })} />

        {inicial && onImagem && (
          <div className="fld fld-wide">
            <span>Imagem do card</span>
            <div className="img-row">
              <AcaoThumb acao={inicial} className="img-preview" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <FileField
                  label=""
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  hint="JPG, PNG, GIF ou WEBP até 20 MB. Com imagem, ela substitui o emoji no card."
                  atual={inicial.tem_imagem ? 'imagem salva' : null}
                  onPick={(dataUrl) => onImagem(dataUrl)}
                  onClear={inicial.tem_imagem ? onRemoverImagem : undefined}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="ger-hint">
        Marque as <b>regiões</b> em que a ação aparece — cada uma tem o seu preço. Desmarcar
        tira de venda ali e guarda o preço para quando voltar.{' '}
        O <b>modo</b> define o texto de prazo que o franqueado vê: Entrega → "entrega prevista",
        Ativação → "no ar em até", Evento → "planejamento em até".
        {ehDocumento && (
          <>
            {' '}Em <b>Boleto ou Nota Fiscal</b> o franqueado informa o valor e anexa o
            documento; o pedido passa pela etapa de <b>Conferência</b> antes de seguir, e o
            gestor pode recusar com um motivo — aí o valor volta pra carteira.
          </>
        )}
      </div>

      {erro && <div className="co-warn" style={{ margin: '10px 0 0' }}>{erro}</div>}

      <div className="ger-form-foot">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={salvando}>
          {salvando ? 'Salvando…' : inicial ? 'Salvar alterações' : 'Criar ação'}
        </button>
      </div>
    </form>
  )
}
