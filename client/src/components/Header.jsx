import { FileText } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gray-900 text-white px-6 py-4 flex items-center gap-3 border-b border-gray-700">
      <div className="bg-green-500 p-1.5 rounded">
        <FileText size={18} className="text-gray-900" />
      </div>
      <div>
        <h1 className="text-base font-semibold tracking-tight">BlackLedger</h1>
        <p className="text-xs text-gray-400">Comprobantes → Holistor IVA Registración</p>
      </div>
    </header>
  );
}
