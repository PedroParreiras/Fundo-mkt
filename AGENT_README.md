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
| `/gerenciar` | `pages/Gerenciar` | **gestor**: Produtos + Campanhas + Carteiras + Pedidos |

## Esteira do pedido

`solicitacao → conferencia → solicitado → disponivel`, mais o terminal
`recusado`. Definida no backend (`fundo_mkt_service.comum.ETAPAS`) e espelhada
em `fundo/meta.ts`. O servidor só aceita mover **uma etapa por vez** (pra frente
ou pra trás): pular etapa esconderia do franqueado o que aconteceu com o pedido.
Cada mudança grava uma linha em `fundo_mkt.pedido_eventos` — é dela que sai a
data de cada passo no `StatusTrack`.

**Recusa** é a exceção: alcançável de qualquer etapa, **exige motivo** (o
franqueado lê), **devolve o valor pra carteira** (o `resgatado` ignora pedido
recusado) e reabrir só volta pra `solicitacao` — as etapas já percorridas não
valem mais.

## As 4 categorias

`tracao`, `recorrencia`, `branding` — preço de tabela × quantidade × lojas.

`documento` é diferente: **não tem preço**. O franqueado informa o valor do
boleto/NF, escolhe UMA loja e anexa o arquivo (PDF ou imagem, 8 MB); o pedido
nasce em Solicitação e o gestor aprova ou recusa na Conferência. O formulário
do gestor esconde o campo de preço nessa categoria, e o card da vitrine mostra
"Valor do documento" em vez de um valor.

## Imagem × emoji

A ação pode ter imagem no lugar do emoji (`fundo_mkt.acoes.imagem_data`, mesmo
padrão do marketplace: bytes no banco + ETag). `components/AcaoThumb` é a fonte
única — vitrine, resgate, Gerenciar e o preview do formulário usam ele.
Upload só depois de salva (precisa do id), por isso a seção não aparece no
formulário de criação. O catálogo NUNCA traz os bytes: só `tem_imagem` e
`imagem_v` (carimbo que entra na URL p/ invalidar o cache do navegador).

## Anexos: quem é público e quem não é

- **Imagem da ação** → `GET /acoes/{id}/imagem` **sem token**, porque `<img>`
  não manda header e imagem de catálogo não é sensível.
- **Documento do pedido** → `GET /pedidos/{id}/documento` **com token e dono**
  (só o dono do pedido ou o gestor). Por isso o front usa `DocumentoLink`, que
  busca com o header e abre um blob — `<a href>` não funcionaria.
- O tipo do arquivo é detectado pela **assinatura**, não pelo content-type que
  o cliente mandou.

## Campanhas (cronograma)

`fundo_mkt.campanhas` + `campanha_acoes`: uma campanha por (ano, mês) com tema,
descrição e as ações recomendadas. Substituiu o `schedule.ts` chumbado — o
gestor monta o calendário sem deploy, e o vínculo é por **id** (não por slug,
que era o que quebrava quando o catálogo era recriado).

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
- **`slug` continua sendo a chave estável da ação**, mas o cronograma NÃO usa
  mais slug: a campanha aponta para o `acao_id`.

## Acesso

Entrar no app: `role admin|manager` OU `auth.users.can_access_fundo_mkt`.

**Gerenciar é só de admin/manager** — catálogo, campanhas, carteiras e avanço
de etapa. No backend isso é `_gestor_ou_403`; no front, `isGestor()` esconde a
aba e a rota. O gate de UI é conveniência: o `user` do localStorage é forjável,
quem barra de verdade é o backend em todo endpoint.

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
- Notificar o franqueado quando o pedido muda de etapa (principalmente na
  recusa, que hoje ele só vê se abrir a tela).
- Notificar o franqueado quando o pedido muda de etapa.
- Liberar a flag `can_access_fundo_mkt` para os franqueados (hoje só o time
  interno entra).
