/**
 * =============================================================================
 * USAGE TRACKER — sub-app (sem React, sem router)
 * =============================================================================
 * CÓPIA SINCRONIZADA. O mesmo arquivo vive em TODOS os sub-apps
 * (`src/lib/usageTracker.ts`; nos apps em JS, a versão gerada `.js`). Editou um,
 * re-sincronize os outros — ver `auth/AGENT_README.md`, seção "Usage ▸ coleta".
 * A versão `.js` é GERADA da `.ts`:
 *     npx esbuild usageTracker.ts --loader=ts --format=esm --target=es2020
 *
 * O que manda para `POST /api/usage/track` (o mesmo contrato do hub):
 *   page_view  — entrou na página            (duration_ms nulo)
 *   page_leave — saiu       (duration_ms = tempo VISÍVEL, sem o tempo de aba oculta)
 *   click      — clique em elemento acionável
 *   input      — digitação (só a CONTAGEM de caracteres; nunca o valor)
 *   submit     — envio de formulário
 *
 * Três coisas que a versão anterior errava e que aqui são regra:
 *
 * 1. **O caminho é o da barra de endereço** (`window.location.pathname`), que já
 *    carrega `/system/<slug>/`. A versão antiga prefixava `/[growth]` quando não
 *    reconhecia o path, e esses eventos caíam na raiz da árvore de uso como um
 *    app inventado, fora do seu repositório.
 * 2. **Rota com hash conta como caminho** (`/system/ext/#ruptura` →
 *    `/system/ext/ruptura`): app com roteamento por hash (Extrabom) reportava
 *    UMA página só, e o relatório dizia que ninguém usava as telas dele.
 * 3. **Tempo por página existe.** Sem `page_leave` o app aparecia com 0 min no
 *    relatório, e a comparação entre sub-apps ficava sem sentido.
 *
 * Nunca quebra o app: sem token não enfileira nada, e toda falha de rede é
 * engolida em silêncio.
 * =============================================================================
 */

interface UsageEvent {
    page_path: string;
    element_tag: string;
    element_text: string;
    element_id: string;
    event_type: 'page_view' | 'page_leave' | 'click' | 'input' | 'submit';
    duration_ms?: number | null;
    metadata?: Record<string, unknown> | null;
}

const TRACKABLE_SELECTORS = [
    'button', 'a', 'input[type="submit"]', 'input[type="button"]',
    '[role="button"]', '[data-track]', '.nav-tab-btn', '.btn', 'select', 'summary',
];

const FLUSH_INTERVAL_MS = 5000;
const MAX_BUFFER_SIZE = 50;
const TYPING_DEBOUNCE_MS = 1200;

const API_URL = (window as unknown as { __USAGE_TRACKER_API_URL?: string }).__USAGE_TRACKER_API_URL
    || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');

let _initialized = false;

function isTrackable(el: Element | null): boolean {
    if (!el || !el.matches) return false;
    return TRACKABLE_SELECTORS.some(sel => {
        try { return el.matches(sel); } catch { return false; }
    });
}

/** Sobe a árvore até achar o elemento acionável mais próximo (máx. 5 níveis). */
function findTrackableAncestor(el: Element | null): Element | null {
    let current: Element | null = el;
    for (let depth = 0; current && depth < 5; depth++) {
        if (isTrackable(current)) return current;
        current = current.parentElement;
    }
    return null;
}

function getLabel(el: Element): string {
    const label = el.getAttribute('aria-label')
        || el.getAttribute('data-track')
        || el.getAttribute('title')
        || (el as HTMLElement).innerText
        || '';
    return label.replace(/\s+/g, ' ').trim().slice(0, 100);
}

/** O caminho que vai para o banco: pathname + a rota de hash, sem query. */
function pagePath(): string {
    const base = window.location.pathname.replace(/\/+$/, '') || '/';
    const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
    if (!hash) return base;
    return `${base}/${hash}`.replace(/\/{2,}/g, '/');
}

function getToken(): string | null {
    try {
        const ls = localStorage.getItem('auth_token');
        if (ls) return ls;
    } catch { /* storage bloqueado */ }
    const m = document.cookie.match(/(?:^|;\s*)hrm_jwt=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
}

export function initUsageTracker(): void {
    if (_initialized) return;
    _initialized = true;

    const buffer: UsageEvent[] = [];
    let currentPath = pagePath();
    // Relógio da página: só conta enquanto a aba está visível.
    let visibleSince = document.visibilityState === 'visible' ? Date.now() : 0;
    let accumulated = 0;
    const typingTimers: Record<string, ReturnType<typeof setTimeout>> = {};
    const typingChars: Record<string, number> = {};

    function push(event: UsageEvent): void {
        buffer.push(event);
        if (buffer.length >= MAX_BUFFER_SIZE) flush();
    }

    function flush(keepalive = false): void {
        if (buffer.length === 0) return;
        const token = getToken();
        if (!token) { buffer.length = 0; return; }
        const events = buffer.splice(0, buffer.length);
        try {
            fetch(`${API_URL}/api/usage/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ events }),
                keepalive,
            }).catch(() => { /* silencioso: telemetria nunca quebra a tela */ });
        } catch { /* idem */ }
    }

    function visibleMs(): number {
        const agora = visibleSince ? Date.now() - visibleSince : 0;
        return Math.max(0, accumulated + agora);
    }

    function pageView(path: string): void {
        push({ page_path: path, element_tag: '', element_text: '', element_id: '', event_type: 'page_view' });
    }

    /** Fecha o trecho visível da página e manda o tempo.

        O relógio zera AQUI, não em quem chama: ao fechar a aba o Chrome dispara
        `visibilitychange` e `pagehide`, e as duas chamadas mandavam o MESMO
        tempo (medido: 11798 ms e 11799 ms na mesma página), dobrando o tempo de
        todo sub-app. Zerando aqui, a segunda chamada calcula 0 e não manda nada. */
    function pageLeave(path: string): void {
        const ms = visibleMs();
        accumulated = 0;
        visibleSince = document.visibilityState === 'visible' ? Date.now() : 0;
        if (ms > 0) {
            push({
                page_path: path, element_tag: '', element_text: '', element_id: '',
                event_type: 'page_leave', duration_ms: ms,
            });
        }
    }

    /** Troca de rota: fecha o tempo da anterior e abre o da nova. */
    function rotate(): void {
        const novo = pagePath();
        if (novo === currentPath) return;
        pageLeave(currentPath);   // já zera o relógio
        currentPath = novo;
        pageView(novo);
    }

    pageView(currentPath);

    // Rota: history patchado (React Router e afins) + voltar/avançar + hash.
    const wrap = (metodo: 'pushState' | 'replaceState') => {
        const original = history[metodo];
        history[metodo] = function (this: History, ...args: Parameters<History['pushState']>) {
            const r = original.apply(this, args);
            setTimeout(rotate, 0);
            return r;
        };
    };
    wrap('pushState');
    wrap('replaceState');
    window.addEventListener('popstate', () => setTimeout(rotate, 0));
    window.addEventListener('hashchange', () => setTimeout(rotate, 0));

    document.addEventListener('click', (e) => {
        const alvo = e.target as Element | null;
        const el = isTrackable(alvo) ? alvo : findTrackableAncestor(alvo);
        if (!el) return;
        push({
            page_path: currentPath,
            element_tag: el.tagName.toLowerCase(),
            element_text: getLabel(el),
            element_id: el.id || el.getAttribute('data-track') || '',
            event_type: 'click',
        });
    }, true);

    // Digitação: só a CONTAGEM de caracteres por campo, nunca o conteúdo.
    document.addEventListener('input', (e) => {
        const el = e.target as HTMLInputElement | null;
        if (!el || !el.tagName) return;
        const tag = el.tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && !el.isContentEditable) return;
        if (el.type === 'password') return;
        const id = el.id || el.getAttribute('name') || el.getAttribute('placeholder') || tag;
        typingChars[id] = (typingChars[id] || 0) + 1;
        clearTimeout(typingTimers[id]);
        typingTimers[id] = setTimeout(() => {
            push({
                page_path: currentPath, element_tag: tag, element_text: getLabel(el), element_id: id,
                event_type: 'input', metadata: { chars: typingChars[id] },
            });
            delete typingChars[id];
        }, TYPING_DEBOUNCE_MS);
    }, true);

    document.addEventListener('submit', (e) => {
        const el = e.target as Element | null;
        if (!el) return;
        push({
            page_path: currentPath, element_tag: 'form', element_text: getLabel(el),
            element_id: el.id || '', event_type: 'submit',
        });
    }, true);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            visibleSince = Date.now();
        } else {
            pageLeave(currentPath);   // fecha o trecho; o próximo retorno abre outro
            flush(true);
        }
    });

    setInterval(() => flush(), FLUSH_INTERVAL_MS);
    window.addEventListener('pagehide', () => { pageLeave(currentPath); flush(true); });
}
