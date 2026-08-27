/**
 * Fundo do thumb das ações — mesma regra da vitrine do marketplace
 * (`marketplace/src/components/ProductCard.tsx: tileGradient`): gradiente HSL
 * escuro derivado de um seed, com o conteúdo em branco por cima.
 *
 * O protótipo usava pastéis fixos por item; eles só funcionavam no tema claro.
 * Aqui a superfície é escura nos dois temas, como o tile de produto sem foto.
 */

/** Seed estável a partir do id da ação (djb2 simplificado). */
function seedOf(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100000
  return h
}

export function tileGradient(id: string): string {
  const h = (seedOf(id) * 47) % 360
  return `linear-gradient(135deg, hsl(${h} 55% 30%) 0%, hsl(${(h + 40) % 360} 60% 18%) 100%)`
}
