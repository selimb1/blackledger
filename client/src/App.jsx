import { Routes, Route, Navigate } from 'react-router-dom';
import { Comprobantes } from './pages/Comprobantes';
import { Conciliacion } from './pages/Conciliacion';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/comprobantes" replace />} />
      <Route path="/comprobantes" element={<Comprobantes />} />
      <Route path="/conciliacion" element={<Conciliacion />} />
    </Routes>
  );
}
