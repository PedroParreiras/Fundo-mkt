/**
 * Aba MENU — CÓPIA REPLICADA de honesty/src/components/layout/navbar/MenuToggle.tsx.
 * Mexeu no hub, sincroniza aqui.
 *
 * Encosta na borda de baixo da navbar e minimiza/expande a barra. Era o logo da
 * marca flutuando num gradiente elíptico: bonito e mudo — ninguém descobre que um
 * logo esconde o menu. Agora está escrito, e a seta aponta para o que o clique FAZ:
 * ▲ minimiza (barra aberta), ▼ expande (barra fechada).
 */
interface Props {
    aberta: boolean;
    onAlternar: () => void;
    /** Faixa "Visualizando como" ocupa o topo e empurra tudo. */
    impersonando?: boolean;
}

export default function MenuToggle({ aberta, onAlternar, impersonando }: Props) {
    return (
        <div className={`navbar-toggle-dock ${aberta ? 'aberta' : ''} ${impersonando ? 'com-banner' : ''}`}>
            <button type="button" className="navbar-toggle" onClick={onAlternar}
                    aria-expanded={aberta}
                    aria-label={aberta ? 'Minimizar o menu' : 'Expandir o menu'}>
                <span className="navbar-toggle__texto">Menu</span>
                <svg className="navbar-toggle__seta" width="12" height="8" viewBox="0 0 12 8"
                     fill="currentColor" aria-hidden="true">
                    {aberta ? <path d="M6 0l6 8H0z" /> : <path d="M6 8L0 0h12z" />}
                </svg>
            </button>
        </div>
    );
}
