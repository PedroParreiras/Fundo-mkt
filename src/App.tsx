import { Navigate, Route, Routes } from 'react-router-dom'
import { AccessGate } from './components/AccessGate'
import { Layout } from './components/Layout'
import { FundoProvider } from './fundo/FundoContext'
import { isGestor } from './lib/session'
import { Cronograma } from './pages/Cronograma'
import { Gerenciar } from './pages/Gerenciar'
import { Loja } from './pages/Loja'
import { Pedidos } from './pages/Pedidos'
import './styles/fundo.css'

export default function App() {
  return (
    <AccessGate>
      <FundoProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/fundo" element={<Loja />} />
            <Route path="/cronograma" element={<Cronograma />} />
            <Route path="/pedidos" element={<Pedidos />} />
            {/* O backend recusa as chamadas de quem não é gestor; a rota some
                para não oferecer uma tela que ia falhar em 403. */}
            {isGestor() && <Route path="/gerenciar" element={<Gerenciar />} />}
            <Route path="*" element={<Navigate to="/fundo" replace />} />
          </Route>
        </Routes>
      </FundoProvider>
    </AccessGate>
  )
}
