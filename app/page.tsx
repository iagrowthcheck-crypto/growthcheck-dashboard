'use client'
import { useState } from 'react'

export default function Home() {
  const [negocio, setNegocio] = useState('')
  const [datos, setDatos] = useState<any>(null)
  const [cargando, setCargando] = useState(false)

  const analizar = async () => {
    if (!negocio) return
    setCargando(true)
    const res = await fetch(`https://growthcheck-api-production.up.railway.app/analisis/${negocio}`)
    const data = await res.json()
    setDatos(data)
    setCargando(false)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-emerald-400">Growth Check</h1>
          <p className="text-gray-400 mt-1">Monitoreo de reputación digital en tiempo real</p>
        </div>
        <div className="flex gap-3 mb-10">
          <input
            type="text"
            placeholder="Nombre del negocio (ej: Pollo Campero)"
            value={negocio}
            onChange={(e) => setNegocio(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={analizar}
            disabled={cargando}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold px-6 py-3 rounded-lg transition"
          >
            {cargando ? 'Analizando...' : 'Analizar'}
          </button>
        </div>
        {datos && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{datos.negocio.nombre}</h2>
                  <p className="text-gray-400 text-sm mt-1">{datos.negocio.direccion}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-400">{datos.negocio.rating} ⭐</div>
                  <div className="text-gray-400 text-sm">{datos.negocio.total_reseñas} reseñas</div>
                </div>
              </div>
            </div>
            {datos.analisis.alerta_critica && (
              <div className="bg-red-950 border border-red-500 rounded-xl p-4 flex gap-3">
                <span className="text-red-400 text-xl">⚠️</span>
                <div>
                  <p className="text-red-400 font-semibold">Alerta crítica detectada</p>
                  <p className="text-red-300 text-sm mt-1">{datos.analisis.resumen}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 text-center">
                <div className="text-2xl font-bold text-emerald-400">{datos.analisis.porcentaje_positivo}%</div>
                <div className="text-gray-400 text-sm mt-1">Positivo</div>
              </div>
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 text-center">
                <div className="text-2xl font-bold text-red-400">{datos.analisis.porcentaje_negativo}%</div>
                <div className="text-gray-400 text-sm mt-1">Negativo</div>
              </div>
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 text-center">
                <div className="text-2xl font-bold text-yellow-400 capitalize">{datos.analisis.sentimiento_general}</div>
                <div className="text-gray-400 text-sm mt-1">Sentimiento</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <h3 className="font-semibold text-red-400 mb-3">⚠ Problemas detectados</h3>
                <ul className="space-y-2">
                  {datos.analisis.principales_problemas.map((p, i) => (
                    <li key={i} className="text-gray-300 text-sm flex gap-2">
                      <span className="text-red-500 mt-0.5">•</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <h3 className="font-semibold text-emerald-400 mb-3">✓ Fortalezas</h3>
                <ul className="space-y-2">
                  {datos.analisis.principales_fortalezas.map((f, i) => (
                    <li key={i} className="text-gray-300 text-sm flex gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-emerald-950 rounded-xl p-5 border border-emerald-800">
              <h3 className="font-semibold text-emerald-400 mb-2">💡 Recomendación esta semana</h3>
              <p className="text-emerald-100 text-sm">{datos.analisis.recomendacion}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}