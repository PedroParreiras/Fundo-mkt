import { useEffect, useRef, useState } from 'react'
import { brl, brlCompacto } from '../../fundo/format'

/** Uma série = um papel fixo na página (a cor segue o papel, não a posição). */
export interface Serie {
  id: string
  label: string
  /** Token CSS da cor (ex.: 'var(--fin-credito)'), definido em financeiro.css. */
  cor: string
  valores: number[]
}

interface Props {
  titulo: string
  categorias: string[]
  series: Serie[]
  /** empilhado = partes de um total; agrupado = medidas lado a lado. */
  modo: 'empilhado' | 'agrupado'
}

const ALTURA = 240
const M = { topo: 22, base: 28, esq: 64, dir: 8 }
const BARRA_MAX = 24   // coluna nunca enche a faixa: a sobra é respiro
const GAP = 2          // vão na cor da superfície entre marcas que se tocam
const RAIO = 4         // ponta arredondada só no lado do dado

/** Largura real do container — o SVG desenha em pixel, sem esticar texto. */
function useLargura() {
  const ref = useRef<HTMLDivElement>(null)
  const [largura, setLargura] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = () => setLargura(el.clientWidth)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, largura }
}

/** Topo "redondo" do eixo e 4 divisões limpas (1, 2, 2,5 ou 5 × 10ⁿ). */
function escala(maximo: number): number[] {
  if (maximo <= 0) return [0, 1]
  const bruto = maximo / 4
  const pot = 10 ** Math.floor(Math.log10(bruto))
  const passo = [1, 2, 2.5, 5, 10].map((f) => f * pot).find((p) => p >= bruto) ?? bruto
  return Array.from({ length: Math.ceil(maximo / passo) + 1 }, (_, i) => i * passo)
}

/** Coluna com a ponta de dado arredondada e a base reta. */
function coluna(x: number, y: number, w: number, h: number, ponta: boolean): string {
  const r = ponta ? Math.min(RAIO, h, w / 2) : 0
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`
}

interface Retangulo { serie: Serie; x: number; y: number; w: number; h: number; ponta: boolean }

/** Geometria de UMA categoria: segmentos empilhados ou colunas lado a lado. */
function marcas(series: Serie[], i: number, cx: number, faixa: number, yDe: (v: number) => number,
  modo: Props['modo']): Retangulo[] {
  const base = yDe(0)
  if (modo === 'empilhado') {
    const w = Math.min(BARRA_MAX, faixa * 0.6)
    let topo = base
    const visiveis = series.filter((s) => s.valores[i] > 0)
    return visiveis.map((s, k) => {
      const h = base - yDe(s.valores[i])
      const r = { serie: s, x: cx - w / 2, y: topo - h, w, h: Math.max(0, h - (k ? GAP : 0)), ponta: k === visiveis.length - 1 }
      topo -= h
      return r
    })
  }
  const w = Math.min(BARRA_MAX, (faixa * 0.7 - GAP * (series.length - 1)) / series.length)
  const x0 = cx - (w * series.length + GAP * (series.length - 1)) / 2
  return series.map((s, k) => ({
    serie: s, x: x0 + k * (w + GAP), y: yDe(s.valores[i]), w, h: base - yDe(s.valores[i]), ponta: true,
  }))
}

/** A dica abre AO LADO da coluna (nunca em cima dela), para o lado com mais espaço. */
function posicaoDica(x: number, faixa: number, largura: number) {
  const folga = Math.min(faixa / 2, 40)
  return x < largura / 2 ? { left: x + folga } : { left: x - folga, transform: 'translateX(-100%)' }
}

export function GraficoColunas({ titulo, categorias, series, modo }: Props) {
  const { ref, largura } = useLargura()
  const [foco, setFoco] = useState<number | null>(null)

  const totais = categorias.map((_, i) => series.reduce((s, x) => s + x.valores[i], 0))
  const pico = modo === 'empilhado' ? Math.max(0, ...totais) : Math.max(0, ...series.flatMap((s) => s.valores))
  const ticks = escala(pico)
  const topoEixo = ticks[ticks.length - 1]
  const innerW = Math.max(0, largura - M.esq - M.dir)
  const innerH = ALTURA - M.topo - M.base
  const faixa = categorias.length ? innerW / categorias.length : 0
  const yDe = (v: number) => M.topo + innerH - (v / topoEixo) * innerH
  const xDe = (i: number) => M.esq + faixa * i + faixa / 2

  return (
    <figure className="fin-chart">
      <figcaption className="fin-chart-title">{titulo}</figcaption>
      <ul className="fin-legend">
        {series.map((s) => (
          <li key={s.id}><span className="fin-swatch" style={{ background: s.cor }} />{s.label}</li>
        ))}
      </ul>
      <div className="fin-chart-area" ref={ref}>
        {largura > 0 && (
          <svg width={largura} height={ALTURA} role="img" aria-label={titulo}>
            {ticks.map((t) => (
              <g key={t}>
                <line className="fin-grid" x1={M.esq} x2={largura - M.dir} y1={yDe(t)} y2={yDe(t)} />
                <text className="fin-tick" x={M.esq - 8} y={yDe(t)} dy="0.32em" textAnchor="end">{brlCompacto(t)}</text>
              </g>
            ))}
            {categorias.map((c, i) => (
              <g key={c} className={foco === i ? 'fin-col on' : 'fin-col'}>
                {marcas(series, i, xDe(i), faixa, yDe, modo).map((r) => (
                  <path key={r.serie.id} d={coluna(r.x, r.y, r.w, r.h, r.ponta)} style={{ fill: r.serie.cor }} />
                ))}
                {modo === 'empilhado' && totais[i] > 0 && (
                  <text className="fin-cap" x={xDe(i)} y={yDe(totais[i]) - 6} textAnchor="middle">{brlCompacto(totais[i])}</text>
                )}
                <text className="fin-tick" x={xDe(i)} y={ALTURA - 8} textAnchor="middle">{c}</text>
                <rect className="fin-hit" x={xDe(i) - faixa / 2} y={M.topo} width={faixa} height={innerH}
                  tabIndex={0} aria-label={`${c}: ${series.map((s) => `${s.label} ${brl(s.valores[i])}`).join(', ')}`}
                  onPointerEnter={() => setFoco(i)} onPointerLeave={() => setFoco(null)}
                  onFocus={() => setFoco(i)} onBlur={() => setFoco(null)} />
              </g>
            ))}
          </svg>
        )}
        {foco !== null && (
          <div className="fin-tip" style={posicaoDica(xDe(foco), faixa, largura)}>
            <div className="fin-tip-head">{categorias[foco]}</div>
            {series.map((s) => (
              <div key={s.id} className="fin-tip-row">
                <span className="fin-tip-key" style={{ background: s.cor }} />
                <b>{brl(s.valores[foco])}</b><span>{s.label}</span>
              </div>
            ))}
            {modo === 'empilhado' && <div className="fin-tip-total">Total <b>{brl(totais[foco])}</b></div>}
          </div>
        )}
      </div>
    </figure>
  )
}
