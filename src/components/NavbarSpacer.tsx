/**
 * NavbarSpacer — a navbar do HRM é um OVERLAY: `position: fixed` com
 * `translateY(-100%)` enquanto está fechada. Quando ela desce, cobre o topo da
 * página; cada tela tentava compensar com um padding-top chutado (8rem, 110px,
 * 4.5rem…) e qualquer chute erra, porque em tela estreita a navbar quebra em 2
 * ou 3 linhas.
 *
 * Este espaçador fica em FLUXO logo depois do <nav> e empurra a página pela
 * altura REAL da navbar, medida do próprio elemento. Quem desce a navbar paga o
 * espaço — a página não precisa saber que ela existe.
 *
 * A medida é publicada como variável CSS em :root (nada de state, para não
 * gerar render a cada resize) e o espaçador só a consome, junto de quem precisa
 * do offset em CSS (cabeçalho sticky, drawer, modal):
 *   --navbar-h      → altura ocupada pela navbar aberta (0 quando fechada)
 *   --navbar-space  → idem + a folga do logo/toggle (altura do espaçador)
 */
import { useEffect } from 'react';
import type { RefObject } from 'react';

/* O logo/toggle fica logo abaixo da navbar aberta (e no topo da tela quando
   fechada). Sem esta folga ele tampa a primeira linha da página. */
const TOGGLE_CLEARANCE = 56;

/* Publica a altura da navbar em :root. Sem <nav> medido ainda, o CSS cai no
   fallback de `.navbar-spacer`. */
function publish(nav: HTMLElement | null, open: boolean) {
    /* `top` deixa de ser 0 quando há uma barra acima da navbar (impersonação). */
    const offset = nav ? parseFloat(getComputedStyle(nav).top) || 0 : 0;
    const height = open && nav ? offset + nav.offsetHeight : 0;
    const root = document.documentElement.style;
    root.setProperty('--navbar-h', `${height}px`);
    root.setProperty('--navbar-space', `${height + TOGGLE_CLEARANCE}px`);
}

type Props = {
    /** Ref do <nav className="navbar"> que está sendo compensado. */
    navRef: RefObject<HTMLElement | null>;
    /** Navbar aberta (descida)? Fechada, só a folga do logo é reservada. */
    open: boolean;
};

export default function NavbarSpacer({ navRef, open }: Props) {
    useEffect(() => {
        const nav = navRef.current;
        const apply = () => publish(nav, open);

        apply();
        window.addEventListener('resize', apply);
        /* Observar o <nav> pega o que o resize não pega: item que aparece
           depois (permissão carregada), fonte que troca, menu que quebra. */
        const observer =
            nav && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(apply) : null;
        if (nav && observer) observer.observe(nav);

        return () => {
            window.removeEventListener('resize', apply);
            observer?.disconnect();
        };
    }, [navRef, open]);

    return <div className="navbar-spacer" aria-hidden="true" />;
}
