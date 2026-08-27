import type { ReactNode } from 'react'

/** Cabeçalho padrão das páginas do fundo. */
export function PageHead({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="page-head">
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="page-title">{title}</h1>
      {desc && <p className="page-desc">{desc}</p>}
    </div>
  )
}

/** Casca de página: fundo, largura e respiro — igual em todas as telas. */
export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="fundo-app">
      <main className="wrap">
        <section className="screen">{children}</section>
      </main>
    </div>
  )
}

export function EstadoVazio({ icone, titulo, texto, acao }: {
  icone: string; titulo: string; texto: string; acao?: ReactNode
}) {
  return (
    <div className="empty">
      <div className="ei">{icone}</div>
      <div className="et">{titulo}</div>
      <div className="ed">{texto}</div>
      {acao}
    </div>
  )
}

export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return <div className="fund-loading">{texto}</div>
}

export function ErroBox({ mensagem }: { mensagem: string }) {
  return <div className="fund-error">⚠️ {mensagem}</div>
}

