import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminOnly } from './components/AdminOnly'
import { Layout } from './components/Layout'
import { FundoMarketing } from './pages/FundoMarketing'
import './styles/fundo.css'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/fundo" element={<AdminOnly><FundoMarketing /></AdminOnly>} />
        <Route path="*" element={<Navigate to="/fundo" replace />} />
      </Route>
    </Routes>
  )
}
