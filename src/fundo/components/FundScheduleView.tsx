import { findItem } from '../catalog'
import { brl } from '../format'
import { FUND_SCHEDULE } from '../schedule'

/** Cronograma anual: cada mês tem tema, descrição e ações recomendadas. */
export function FundScheduleView({ onSelectItem }: { onSelectItem: (id: string) => void }) {
  const currentMonth = new Date().getMonth() + 1

  return (
    <>
      <div className="fund-note">
        🗓️
        <div>
          <b>Planejamento do ano:</b> cada campanha já vem com as ações recomendadas pra ela.
          Clique numa ação pra resgatar direto da sua carteira.
        </div>
      </div>

      {FUND_SCHEDULE.map((qt) => (
        <div className="q-group" key={qt.q}>
          <div className="q-head">{qt.q}</div>
          {qt.months.map((mo) => (
            <div className={`month-card ${mo.n === currentMonth ? 'current' : ''}`} key={mo.m}>
              <div className="mc-when">
                {mo.m}
                <span className="mc-theme">{mo.theme}</span>
                {mo.n === currentMonth && <span className="mc-badge-now">mês atual</span>}
              </div>
              <div className="mc-desc">{mo.desc}</div>
              <div className="mc-rec-label">Ações recomendadas pra essa campanha</div>
              <div className="mc-recs">
                {mo.items.map((id) => {
                  const it = findItem(id)
                  return (
                    <button className="rec" key={id} onClick={() => onSelectItem(id)}>
                      <span className="rec-emoji">{it.emoji}</span>
                      {it.name}
                      <span className="rec-price">{brl(it.price)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
