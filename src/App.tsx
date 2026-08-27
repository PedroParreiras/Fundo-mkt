import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { FundoMarketing } from './pages/FundoMarketing'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/fundo" element={<FundoMarketing />} />
        <Route path="*" element={<Navigate to="/fundo" replace />} />
      </Route>
    </Routes>
  )
}
