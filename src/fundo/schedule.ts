import type { ScheduleQuarter } from './types'

/** Cronograma anual de campanhas: cada mês já traz as ações recomendadas. */
export const FUND_SCHEDULE: ScheduleQuarter[] = [
  {
    q: '3º Trimestre · 2026',
    months: [
      { m: 'Julho', n: 7, theme: 'Férias & Volta às aulas',
        desc: 'Fim das férias e volta às aulas: reforce lanches e itens de lancheira com comunicação nova no PDV e um lembrete no WhatsApp.',
        items: ['t1', 't2', 'r3'] },
      { m: 'Agosto', n: 8, theme: 'Dia dos Pais',
        desc: 'Campanha de Dia dos Pais: vídeo comemorativo rodando na TV e no tablet da loja, material gráfico no PDV e comunicação direta com o cliente por app e WhatsApp.',
        items: ['t4', 't5', 't1', 't2', 'r2', 'r3'] },
      { m: 'Setembro', n: 9, theme: 'Semana do Cliente',
        desc: 'A maior data do varejo pra fidelizar: ofertas especiais sinalizadas no PDV e mídia geolocalizada pra trazer o morador de volta à loja.',
        items: ['t1', 't6', 'r1', 'r3'] },
    ],
  },
  {
    q: '4º Trimestre · 2026',
    months: [
      { m: 'Outubro', n: 10, theme: 'Dia das Crianças',
        desc: 'Foco em doces, snacks e bebidas: material no PDV e vídeo nas telas, com aviso pra base pelo app.',
        items: ['t2', 't4', 'r2'] },
      { m: 'Novembro', n: 11, theme: 'Black Friday',
        desc: 'A semana de maior fluxo do ano: sinalização forte de oferta no PDV, vídeo nas telas e mídia geolocalizada pra puxar movimento.',
        items: ['t2', 't6', 't4', 'r1', 'r3'] },
      { m: 'Dezembro', n: 12, theme: 'Natal & Fim de Ano',
        desc: 'Ceia, presentes e confraternizações: comunicação de Natal no PDV e nas telas, mais presença da marca nos eventos do condomínio.',
        items: ['t1', 't4', 't5', 'b2', 'r1'] },
    ],
  },
]
