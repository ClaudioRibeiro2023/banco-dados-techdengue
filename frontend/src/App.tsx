import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { MonitorPage } from '@/pages/monitor'
import { QualityPage } from '@/pages/quality'
import { DataTablePage } from '@/pages/data-table'

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<MonitorPage />} />
          <Route path="/quality" element={<QualityPage />} />
          <Route path="/data-table" element={<DataTablePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
