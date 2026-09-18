import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './screens/Home'
import { MapSelect } from './screens/MapSelect'
import { Play } from './screens/Play'
import { Knowledge } from './screens/Knowledge'
import { Medals } from './screens/Medals'
import { Settings } from './screens/Settings'
import { Install } from './screens/Install'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/maps" element={<MapSelect />} />
        <Route path="/play" element={<Play />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/medals" element={<Medals />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/install" element={<Install />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
