# Fundo MKT — nota para agentes

App do fundo de marketing (arrecadação × investimento por loja/franqueado).
**Tem backend**: schema `fundo_mkt` no `sales_db` + `/api/fundo-mkt/*` no Flask
(`auth/routes/fundo_mkt.py` + `auth/services/fundo_mkt_service.py`). Nada aqui é
mock — o único dado semeado à mão são as contribuições da carteira.

## Telas (rotas na navbar)

| Rota | Página | O quê |
|---|---|---|
| `/fundo` | `pages/Loja` | vitrine das ações por categoria + carteira + resgate |
| `/cronograma` | `pages/Cronograma` | campanhas do ano; a recomendação abre o mesmo resgate |
| `/pedidos` | `pages/Pedidos` | **os próprios** pedidos, com a esteira de 4 etapas |
| `/gerenciar` | `pages/Gerenciar` | **gestor**: Produtos + Carteiras + todos os pedidos |

## Esteira do pedido

`solicitacao → conferencia → solicitado → disponivel`. Definida no backend
(`fundo_mkt_service.ETAPAS`) e espelhada em `fundo/meta.ts`. O servidor só
aceita mover **uma etapa por vez** (pra frente ou pra trás): pular etapa
esconderia do franqueado o que aconteceu com o pedido dele. Cada mudança grava
uma linha em `fundo_mkt.pedido_eventos` — é dela que sai a data de cada passo no
`StatusTrack`.

## Regras que não são óbvias no código

- **O pedido guarda snapshot** de nome/emoji/preço/modo da ação. O gestor edita
  o catálogo e o pedido antigo não pode mudar de valor.
- **Baixa de ação é lógica** (`ativo=false`). Não existe remoção: o pedido
  referencia a ação. Reativar é só voltar o campo.
- **`slug` é a chave estável** da ação. O cronograma (`fundo/schedule.ts`)
  referencia ação por slug, não por id — o catálogo é editável.
- **Saldo é validado no servidor** antes de gravar o pedido. O aviso no
  checkout é conveniência; quem recusa é a API.
- **Lojas do resgate** vêm de 3 camadas (`lojas_do_usuario`): `store_franqueado`
  → `store_access` do JWT → todas, se o chamador é gestor e não caiu nas duas.
  Por isso o checkout ganha busca quando passa de 8 lojas.
- **O banco nasce VAZIO.** Nem catálogo nem carteira têm seed: o gestor
  cadastra as ações em *Gerenciar › Produtos* e credita o saldo em
  *Gerenciar › Carteiras*.
- **Lançar saldo é UPSERT** por (usuário, competência, `origem='manual'`):
  relançar a mesma competência **substitui** o valor, não soma — era fácil
  dobrar o saldo sem isso. O 1% real vira worker gravando com
  `origem='faturamento'`; os dois convivem na mesma tabela.
- **Remover lançamento não reverte resgate.** O saldo pode ficar negativo se o
  valor removido já tinha sido gasto.
- **O cronograma casa por slug.** Como o slug é derivado do NOME no servidor,
  as recomendações de `fundo/schedule.ts` (`t1`, `r3`, `b2`…) não resolvem
  contra um catálogo cadastrado do zero — o mês mostra "nenhuma ação ligada a
  esta campanha". Ligar de novo = editar os slugs em `schedule.ts` ou tornar a
  recomendação gerenciável.

## Acesso

Gate real no backend: `role admin|manager` OU `auth.users.can_access_fundo_mkt`.
Escrita do catálogo e avanço de etapa são **só do gestor**. `components/AccessGate`
e o link "Gerenciar" na navbar repetem a checagem, mas isso é UI — o `user` do
localStorage é forjável.

## Regras deste repo

- **O design é o MESMO da vitrine do marketplace.** `src/styles/fundo.css` não
  tem paleta própria: consome os tokens `--mkt-*` do bloco "MARKETPLACE THEME
  LAYER" em `src/index.css` (cópia sincronizada de `marketplace/src/index.css`
  — editou lá, sincronize aqui). Claro/escuro alternam com o `hrm_theme`.
- Tudo escopado sob `.fundo-app`: os nomes são genéricos (`.btn`, `.chip`,
  `.modal-overlay`, `.empty`) e colidiriam com o design system do HRM. O
  arquivo também neutraliza o `button:hover{transform}` global do `index.css`.
- **Ouro puro (#edb125) nunca como TEXTO em superfície clara** (~2:1 sobre
  branco). Texto acentuado usa `var(--text-accent)` (`#9c7210` no claro); o
  ouro fica só em SUPERFÍCIE (botão, borda, pílula ativa).
- Thumb das ações: `fundo/tile.ts` (`tileGradient`) — mesma regra do tile sem
  foto da vitrine.
- HTTP sempre por `src/lib/api.ts`; sessão/papel por `src/lib/session.ts`.
  Nunca `fetch` solto, nunca ler `localStorage.user` fora do session.ts.
- Build: `npm run build` → `dist/` com base `/system/fundo-mkt/`.
  `npm run preview` NÃO funciona (o `base` do config só vale em `build`); use
  `npm run dev`.
- Commit + push imediato (o deploy faz `git reset --hard origin`).

## Pendências

- Worker do 1% (contribuição automática) — hoje o saldo é lançado à mão.
- Ligar o cronograma ao catálogo novo (ver a nota sobre slug acima).
- Notificar o franqueado quando o pedido muda de etapa.
- Liberar a flag `can_access_fundo_mkt` para os franqueados (hoje só o time
  interno entra).
