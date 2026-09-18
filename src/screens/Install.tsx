import { useNavigate } from 'react-router-dom'
import { Pressable } from '../components/Pressable'

export function Install() {
  const navigate = useNavigate()
  return (
    <div className="screen" style={{ background: 'linear-gradient(180deg,#0288d1,#01579b)', padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Pressable className="btn-wood" style={{ padding: '8px 14px' }} onPress={() => navigate('/')}>← Home</Pressable>
        <h2 style={{ margin: 0, color: '#fff' }}>Install</h2>
        <div style={{ width: 72 }} />
      </div>
      <div className="card" style={{ color: '#3e2723', lineHeight: 1.5 }}>
        <h3 style={{ marginTop: 0 }}>Install as an app (PWA)</h3>
        <p><strong>Android Chrome:</strong> Menu → Install app / Add to Home screen. Then open Orbkeep fullscreen from your launcher.</p>
        <p><strong>iOS Safari:</strong> Share → Add to Home Screen. Open from the home screen icon for standalone mode.</p>
        <h3>Android APK (Capacitor)</h3>
        <p>A real sideloadable APK needs a computer with Android Studio:</p>
        <pre style={{
          background: '#3e2723', color: '#ffe0b2', padding: 12, borderRadius: 10,
          fontSize: 11, overflow: 'auto', whiteSpace: 'pre-wrap',
        }}>{`npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init Orbkeep com.orbkeep.game --web-dir dist
npm run build
npx cap add android
npx cap copy android
npx cap open android
# Then Build → Build APK in Android Studio`}</pre>
        <p style={{ fontSize: 13 }}>Progress saves on-device via localStorage. See README.md for full steps. capacitor.config.ts is already scaffolded.</p>
      </div>
    </div>
  )
}
