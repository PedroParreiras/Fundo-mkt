# Fundo MKT — nota para agentes

App do fundo de marketing (arrecadação × investimento por loja/franqueado).
**Tem backend**: schema `fundo_mkt` no `sales_db` + `/api/fundo-mkt/*` no Flask
(`auth/routes/fundo_mkt.py` + `auth/services/fundo_mkt_service.py`). Nada aqui é
mock — o único dado semeado à mão são as contribuições da carteira.

## Região: MG · GO · ES (19/09/2026)

O fundo é dividido por **operação**, igual ao marketplace. A régua é a MESMA
para os dois apps — `auth/services/regioes.py` no backend e `src/lib/region.ts`
aqui (cópia espelhada de `marketplace/src/lib/region.ts`; editou uma,
sincronize as outras):

- A região do usuário sai das flags `auth.users.can_access_marketplace_<uf>`,
  com precedência **ES > GO > MG**. O nome das colunas nasceu no marketplace,
  mas hoje elas dizem de qual operação o usuário é — por isso o `AdminPage` do
  HRM chama a seção de "Região da operação" e **não zera mais** as flags quando
  o acesso ao Marketplace é revogado (isso apagava a região do franqueado aqui).
- **Gestor** troca no toggle `[ MG | GO | ES ]` da **doca** `.mkt-area-dock` —
  flutua colada embaixo da navbar, à esquerda, e continua visível com a barra
  minimizada (idêntica à do marketplace: mesmo CSS em `src/index.css`, mesmas
  classes `area-tabs`/`area-tab`; o aperto para telas estreitas está em
  `src/fundo-mkt-fx.css`, espelho de `marketplace/src/mobile.css`). Estado em
  `fundo/RegiaoContext` + `regiaoStore`, guardado em `localStorage.fundo_region`.
  **Franqueado** não tem toggle: o backend ignora `?region=` de quem não é
  gestor e resolve pelas flags.
- `lib/api.ts` carimba `region=` em TODA chamada JSON (`comRegiao`), pra não
  existir chamada "sem região" por esquecimento. As LEITURAS de tela passam a
  região explícita (`api.acoes(true, regiao)`) — é o que faz o React refazer a
  busca quando o gestor troca de operação.
- **O que é regional:** catálogo (`fundo_mkt.acoes.region`), pedidos
  (`fundo_mkt.pedidos.region`, snapshot — mover a ação de região depois não
  reescreve histórico) e a lista de carteiras. Resgatar ação de outra região é
  recusado no servidor ("Ação não encontrada ou desativada"), não só escondido
  na vitrine.
- **O que é GLOBAL: o cronograma.** `fundo_mkt.campanhas` não tem região — mês,
  tema e descrição valem para as três operações. O que se filtra é a lista de
  ações recomendadas da campanha. ES hoje só enxerga isso: ainda não tem
  catálogo nem carteira (nasce vazio, o gestor cadastra).
  **Pegadinha que o desenho cria:** salvar a campanha substitui a lista de
  ações — e o gestor de GO só ENXERGA as de GO. Por isso
  `_sincronizar_acoes` apaga apenas os vínculos DA REGIÃO ativa e ignora id de
  ação de outra (vínculo que o editor não viu não entra nem sai). Sem isso,
  abrir a campanha em GO e salvar apagava em silêncio as recomendações de MG.
- Contribuição NÃO tem região: ela é do usuário, e o usuário já tem uma.
  Duplicar ali só criaria divergência.
- Migrations: `sql/migration_fundo_mkt_region_2026_09_19.sql` (colunas `region`,
  default MG = tudo que existia) e `sql/migration_regiao_es_2026_09_19.sql`
  (flag `can_access_marketplace_es`).

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
descrição e as ações recomendadas. **Campanha é GLOBAL** (sem região); só as
ações recomendadas são filtradas pela operação de quem lê — ver a seção
"Região" no topo. Substituiu o `schedule.ts` chumbado — o
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

A flag é concedida no HRM em **Administração → usuário → Acesso aos apps →
FUNDO** (`AdminPage.tsx`), e é ela que também faz o nó FUNDO aparecer no hub
(`HonestySystemPage.tsx`). Para admin/manager o toggle vem travado ligado: o
papel já abre o app, revogar a coluna não fecharia nada.

**Gerenciar é só de admin/manager** — catálogo, campanhas, carteiras e avanço
de etapa. No backend isso é `_gestor_ou_403`; no front, `isGestor()` esconde a
aba e a rota. O gate de UI é conveniência: o `user` do localStorage é forjável,
quem barra de verdade é o backend em todo endpoint.

## O telefone: `src/styles/mobile.css` (22/09/2026)

Todo o recorte de telefone mora NESTE arquivo (mesma convenção do
`marketplace/src/mobile.css`) e é carregado no fim de `App.tsx`, depois de
`styles/fundo.css` — que continua sendo o desenho grande. Quem mexe no layout
mexe nos dois: `fundo.css` para o desktop, `mobile.css` para o aperto.

Três cortes, e o motivo de cada um:

- **≤ 760px — a tabela do Gerenciar vira lista de cartões.** `.ger-table` tem
  `min-width: 760px`: no telefone dava para ver a coluna "Ação" e mais nada —
  Preço, Status e os botões Editar/Desativar ficavam atrás de uma rolagem
  horizontal DENTRO de um quadro que já rolava na vertical. Cada linha vira um
  cartão "rótulo → valor". Depende de marcação: a tabela leva
  `ger-table--cards` e **cada `<td>` leva `data-label`** (o rótulo sai de
  `content: attr(data-label)`). Sem o `data-label` a célula aparece sem nome.
  Célula de texto longo (descrição, ações recomendadas) leva também `td-block`:
  rótulo em cima, valor embaixo, os dois à esquerda — alinhada à direita, uma
  frase de três linhas ficava com as três pontas soltas. O `<td>` das ações
  (`acoes-col`) e o primeiro (título do cartão) não levam rótulo.
- **≤ 640px — telefone.** Vitrine em DUAS colunas (coluna fixa, não `minmax`:
  com `minmax`, quanto maior o telefone menor o card), etiqueta de status do
  pedido em linha própria, abas do Gerenciar em grade 2×2, cronograma em coluna
  com o preço à direita, alvos de toque de 40-44px e **fonte 16px em tudo que
  recebe digitação** (abaixo disso o Safari do iOS dá zoom no foco e não volta).
- **≤ 380px** — só o aperto final.
- **`@media (hover: none) and (pointer: coarse)`** — fora dos cortes de largura
  porque quem decide é o PONTEIRO: no toque não existe "sair do hover", e o card
  levantado ficava preso para cima depois do tap.

**Modal vira folha de baixo (bottom sheet).** No telefone o resgate sobe da
borda de baixo, com o cabeçalho grudado no topo e o rodapé do botão grudado
embaixo; o que rola é só o miolo. Antes o "Confirmar resgate" ficava depois de
duas telas de rolagem. **Este é o único lugar com `!important`**, e é
obrigatório: `index.css` tem, no mesmo corte de telefone, um
`.modal { width: calc(100vw - .75rem); margin: .5rem auto; max-height: calc(100vh - 1rem); border-radius: 12px }`
TODO com `!important` — escrito para o `.modal` genérico do HRM, que não sabe
que o fundo usa o mesmo nome de classe (ver a colisão de nomes logo abaixo).

**O que NÃO se resolve aqui:** a navbar aberta ocupa ~470px dos 844 de um
telefone, porque ela nasce aberta (`navbarState.ts`, chave
`hrm_navbar_aberta`) e no ≤900px vira uma lista de linha inteira. Isso é
comportamento de PLATAFORMA, replicado em todos os sub-apps — mudar só aqui
dessincroniza. Quem minimiza uma vez fica minimizado em todo lugar.

## Regras deste repo

- **O design é o MESMO da vitrine do marketplace.** `src/styles/fundo.css` não
  tem paleta própria: consome os tokens `--mkt-*` do bloco "MARKETPLACE THEME
  LAYER" em `src/index.css` (cópia sincronizada de `marketplace/src/index.css`
  — editou lá, sincronize aqui). Claro/escuro alternam com o `hrm_theme`.
- **Mexeu no layout? confira nos dois tamanhos.** O recorte de telefone está em
  `src/styles/mobile.css` (ver a seção acima) e não é opcional: o franqueado
  abre este app no celular.
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
- ES: catálogo e carteiras vazios (só o cronograma aparece, porque é global).
- Notificar o franqueado quando o pedido muda de etapa (principalmente na
  recusa, que hoje ele só vê se abrir a tela).
- Notificar o franqueado quando o pedido muda de etapa.

## Navbar overlay: o espaço do topo é do NavbarSpacer (15/09/2026)

A navbar do HRM é um **overlay**: `position: fixed` com `translateY(-100%)`
enquanto está fechada. Quando ela desce, cobre o topo da página — e cada tela
tentava compensar com um `padding-top` chutado (8rem, 110px, 4.5rem…). Chute
sempre erra: em tela estreita a navbar quebra em 2 ou 3 linhas.

Agora quem paga o espaço é a navbar, via `src/components/NavbarSpacer.tsx`, renderizado por ela logo
depois do `</nav>`. Ele mede a altura REAL do `<nav>` (ResizeObserver + resize,
e soma o `top` quando há barra acima, ex.: impersonação) e publica em `:root`:

- `--navbar-h` — altura ocupada pela navbar aberta (`0` quando fechada)
- `--navbar-space` — idem + 56px de folga do logo/toggle → é a altura de
  `.navbar-spacer` (`height: var(--navbar-space, 128px)`, com transição na mesma
  curva do slide)

Regras:
- Página **não** leva `padding-top` para desviar da navbar. Os `7rem/8rem` de `.container`/`.dashboard-container` em `src/index.css` foram para `2rem`.
- Precisa de offset em CSS (cabeçalho sticky, drawer, modal)? Use
  `var(--navbar-h)`, nunca um valor fixo.
- O espaçador tem de ficar **em fluxo antes do conteúdo** — é irmão do `<nav>`
  no fragment que a navbar retorna. Se alguém renderizar a navbar dentro de um
  container com `overflow` ou fora da ordem, o empurrão se perde.

## Telefone (mobile) — guarda genérica + ajustes do app (2026-09-22)
- `styles/mobile-guard.css` é **cópia replicada** do hub (`honesty/src/styles/mobile-guard.css`,
  a fonte). Não editar aqui: edite no hub e recopie para todos os sub-apps. Ele só age em
  ≤768/≤640px: tabela rola dentro do pai (`:has(> table)`), abas rolam na horizontal, grid/flex
  inline de desktop encolhem, inputs 16px (sem zoom no iOS), modais cabem na tela.
- Ajustes que dependem das classes deste app ficam no CSS do próprio app (nunca no guard).
- Grades usam `minmax(min(100%, Npx), 1fr)` — idêntico no desktop, não estoura 390px. Ao criar
  grade nova, siga o padrão (ou `minmax(0, 1fr)` em trilha única).
- `navbarState`: sem escolha salva, a navbar nasce **fechada** em ≤900px.
- Verificação: auditoria Playwright a 390px (`scrollWidth` + elemento que passa da borda) em
  todas as rotas; 0 rotas com overflow de página após o passe.


## Sininho = `<bh-sino>` da plataforma (25/09/2026)
O `NotificationBell` deste repo agora só renderiza o web component `<bh-sino>`
(`honesty/public/bh-sino.js` + `bh-sino.css`, carregado pelo nginx em todo sub-app
via `sub_filter`). Poll (60 s, pausado com a aba escondida), painel, folha inferior no
celular e visual (marinho/dourado, segue `data-theme`) vivem lá, iguais em todos os apps —
não reintroduzir implementação local. Em `vite dev` (sem nginx) o sino não aparece.
