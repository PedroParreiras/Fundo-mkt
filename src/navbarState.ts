/**
 * Estado aberta/minimizada da navbar — CÓPIA REPLICADA (fonte: o hub).
 *
 * Vive no localStorage e não no componente porque CADA PÁGINA monta a sua barra:
 * com estado só em memória, ela voltava aberta a cada navegação e quem minimizava
 * via a barra reaparecer no clique seguinte. A chave é a mesma em toda a
 * plataforma (mesma origem), então minimizar aqui vale no hub e nos outros
 * sub-apps — a barra é uma só para quem usa.
 */
const CHAVE = 'hrm_navbar_aberta';

export function lerNavbarAberta(): boolean {
    try {
        const salvo = localStorage.getItem(CHAVE);
        /* Sem escolha salva: no telefone a barra é gaveta e nasce FECHADA —
           aberta, a coluna de links ocupava a primeira tela inteira. */
        if (salvo === null) return window.innerWidth > 900;
        return salvo !== 'fechada';
    } catch {
        return true;
    }
}

export function gravarNavbarAberta(aberta: boolean) {
    try {
        localStorage.setItem(CHAVE, aberta ? 'aberta' : 'fechada');
    } catch { /* aba anônima: a barra só perde a memória */ }
}
