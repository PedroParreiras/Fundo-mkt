import type { FundCategory, FundItem, FundStore } from './types'

export const FUND_CATS: FundCategory[] = [
  { id: 'tracao', name: 'Tração', short: 'TR', color: '#2563EB', tag: 'Materiais e mídia no seu PDV' },
  { id: 'recorrencia', name: 'Recorrência', short: 'RC', color: '#137A45', tag: 'Trazer o cliente de volta à loja' },
  { id: 'branding', name: 'Branding Local', short: 'BL', color: '#A86A12', tag: 'Marca forte na sua região' },
]

// mode: 'Entrega' (material físico) · 'Ativação' (digital, entra no ar) · 'Evento' (planejamento)
export const FUND_ITEMS: FundItem[] = [
  { id: 't1', cat: 'tracao', name: 'Kit de comunicação mensal', desc: 'Adesivos, cartazes, faixas e etiquetas — a campanha do mês pronta pra instalar.', price: 180, emoji: '🪧', tint: '#E6EDFB', mode: 'Entrega', lead: 6 },
  { id: 't2', cat: 'tracao', name: 'Cartaz A3 + faixa de gôndola', desc: 'Pacote de peças impressas para o ponto de venda.', price: 90, emoji: '🖼️', tint: '#FAEFD7', mode: 'Entrega', lead: 6 },
  { id: 't3', cat: 'tracao', name: 'Adesivo de geladeira personalizado', desc: 'Comunicação aplicada na porta do freezer.', price: 120, emoji: '🧊', tint: '#E3F3EA', mode: 'Entrega', lead: 6 },
  { id: 't4', cat: 'tracao', name: 'TV para a loja', desc: 'Tela + player para rodar as campanhas em vídeo no PDV.', price: 1290, emoji: '📺', tint: '#E6EDFB', mode: 'Entrega', lead: 9 },
  { id: 't5', cat: 'tracao', name: 'Tablet de autoatendimento', desc: 'Tablet para vitrine ou consulta de ofertas na loja.', price: 890, emoji: '📱', tint: '#EDE7FB', mode: 'Entrega', lead: 9 },
  { id: 't6', cat: 'tracao', name: 'Kit de wobblers e etiquetas de promo', desc: 'Sinalização de oferta para as gôndolas.', price: 60, emoji: '🏷️', tint: '#FAEFD7', mode: 'Entrega', lead: 5 },
  { id: 'r1', cat: 'recorrencia', name: 'Anúncios geolocalizados (30 dias)', desc: 'Mídia para quem mora e trabalha ao lado da sua loja.', price: 400, emoji: '📍', tint: '#E6EDFB', mode: 'Ativação', lead: 2 },
  { id: 'r2', cat: 'recorrencia', name: 'Ferramenta de relacionamento (CRM) — 1 mês', desc: 'Mantém contato com quem já comprou e traz de volta.', price: 150, emoji: '💬', tint: '#E3F3EA', mode: 'Ativação', lead: 2 },
  { id: 'r3', cat: 'recorrencia', name: 'Disparo de WhatsApp para a base', desc: 'Pacote de mensagens para reativar clientes.', price: 90, emoji: '📲', tint: '#E3F3EA', mode: 'Ativação', lead: 2 },
  { id: 'r4', cat: 'recorrencia', name: 'Mídia na TV do elevador — 1 mês', desc: 'Anúncio nas telas das áreas comuns do condomínio.', price: 350, emoji: '🛗', tint: '#FAEFD7', mode: 'Ativação', lead: 3 },
  { id: 'b1', cat: 'branding', name: 'Patrocinar a festa junina do condomínio', desc: 'Marca Be Honest presente na festa do condomínio da sua loja.', price: 800, emoji: '🎉', tint: '#FBE9E7', mode: 'Evento', lead: 5 },
  { id: 'b2', cat: 'branding', name: 'Kit de ativação em evento do condomínio', desc: 'Tenda, brindes e material para uma ação presencial.', price: 450, emoji: '🎪', tint: '#FAEFD7', mode: 'Evento', lead: 5 },
  { id: 'b3', cat: 'branding', name: 'Patrocínio de evento ou corrida do bairro', desc: 'Marca em evento esportivo ou cultural da região.', price: 1200, emoji: '🏃', tint: '#E6EDFB', mode: 'Evento', lead: 7 },
  { id: 'b4', cat: 'branding', name: 'Material co-branded com construtora', desc: 'Peça conjunta para empreendimento novo na sua região.', price: 600, emoji: '🏗️', tint: '#E3F3EA', mode: 'Entrega', lead: 7 },
]

export const FUND_STORES: FundStore[] = [
  { id: 'l1', name: 'Cond. Alphaville', city: 'Nova Lima' },
  { id: 'l2', name: 'Cond. Vila da Serra', city: 'Nova Lima' },
  { id: 'l3', name: 'Ed. Buritis Class', city: 'Belo Horizonte' },
]

export const findCat = (id: string) => FUND_CATS.find((c) => c.id === id)!
export const findItem = (id: string) => FUND_ITEMS.find((i) => i.id === id)!
export const findStore = (id: string) => FUND_STORES.find((s) => s.id === id)!
