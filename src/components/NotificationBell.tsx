/**
 * Sininho da navbar. O componente de verdade é o web component <bh-sino> da
 * plataforma (honesty/public/bh-sino.js, injetado pelo nginx em todo sub-app):
 * visual, poll, painel e folha do celular iguais em todos os apps.
 */
import { createElement } from 'react';

const NotificationBell = () => createElement('bh-sino');

export default NotificationBell;
