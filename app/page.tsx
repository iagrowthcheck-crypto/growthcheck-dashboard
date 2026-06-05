'use client'
import { useState } from 'react'

const API = 'https://growthcheck-api-production.up.railway.app'

export default function Home() {
  const [negocio, setNegocio] = useState('')
  const [url, setUrl] = useState('')
  const [datos, setDatos] = useState<any>(null)
  const [infra, setInfra] = useState<any>(null)
  const [cargando, setCargando] = useState(false)
  const [tab, setTab] = useState('reputacion')
  const [fecha, setFecha] = useState('')

  const analizar = async () => {
    if (!negocio) return
    setCargando(true)
    try {
      const [repRes, dominioRes, sslRes, velRes] = await Promise.all([
        fetch(`${API}/analisis/${negocio}`),
        fetch(`${API}/dominio/${negocio}`),
        fetch(`${API}/ssl/${negocio}`),
        url ? fetch(`${API}/velocidad?url=${url}`) : Promise.resolve(null)
      ])
      const rep = await repRes.json()
      const dominio = await dominioRes.json()
      const ssl = await sslRes.json()
      const vel = velRes ? await velRes.json() : null
      setDatos({ ...rep, fecha_analisis: new Date().toISOString() })
      setInfra({ dominio, ssl, velocidad: vel, fecha_analisis: new Date().toISOString() })
    } catch (e) {
      console.error(e)
    }
    setCargando(false)
  }

  const filtrarPorFecha = (item: any) => {
    if (!fecha || !item?.fecha_analisis) return true
    return item.fecha_analisis.startsWith(fecha)
  }

  const neg = datos?.negocio || datos
  const anal = datos?.analisis || datos

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-400">Growth Check</h1>
          <p className="text-gray-400 mt-1">Monitoreo de reputación digital en tiempo real</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <input
            type="text"
            placeholder="Nombre del negocio"
            value={negocio}
            onChange={(e) => setNegocio(e.target.value)}
            className="md:col-span-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            placeholder="URL del sitio (ej: https://negocio.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="md:col-span-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={analizar}
            disabled={cargando}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold px-6 py-3 rounded-lg transition"
          >
            {cargando ? 'Analizando...' : 'Analizar'}
          </button>
        </div>

        {(datos || infra) && (
          <>
            <div className="flex gap-2 mb-6 flex-wrap items-center">
              <button onClick={() => setTab('reputacion')} className={`px-4 py-2 rounded-full text-sm font-medium transition ${tab === 'reputacion' ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Reputación</button>
              <button onClick={() => setTab('infraestructura')} className={`px-4 py-2 rounded-full text-sm font-medium transition ${tab === 'infraestructura' ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Infraestructura</button>
              <div className="ml-auto">
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {tab === 'reputacion' && datos && filtrarPorFecha(datos) && (
              <div className="space-y-5">
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold">{neg?.nombre}</h2>
                      <p className="text-gray-400 text-sm mt-1">{neg?.direccion}</p>
                      <p className="text-gray-500 text-xs mt-1">Analizado: {new Date(datos.fecha_analisis).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-emerald-400">{neg?.rating} ⭐</div>
                      <div className="text-gray-400 text-sm">{neg?.total_resenas} reseñas</div>
                    </div>
                  </div>
                </div>

                {anal?.alerta_critica && (
                  <div className="bg-red-950 border border-red-500 rounded-xl p-4 flex gap-3">
                    <span className="text-red-400 text-xl">⚠️</span>
                    <div>
                      <p className="text-red-400 font-semibold">Alerta crítica detectada</p>
                      <p className="text-red-300 text-sm mt-1">{anal.resumen}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 text-center">
                    <div className="text-2xl font-bold text-emerald-400">{anal?.porcentaje_positivo}%</div>
                    <div className="text-gray-400 text-sm mt-1">Positivo</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 text-center">
                    <div className="text-2xl font-bold text-red-400">{anal?.porcentaje_negativo}%</div>
                    <div className="text-gray-400 text-sm mt-1">Negativo</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 text-center">
                    <div className="text-2xl font-bold text-yellow-400 capitalize">{anal?.sentimiento_general}</div>
                    <div className="text-gray-400 text-sm mt-1">Sentimiento</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                    <h3 className="font-semibold text-red-400 mb-3">⚠ Problemas detectados</h3>
                    <ul className="space-y-2">
                      {anal?.principales_problemas?.map((p: any, i: number) => (
                        <li key={i} className="text-gray-300 text-sm flex gap-2">
                          <span className="text-red-500 mt-0.5">•</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                    <h3 className="font-semibold text-emerald-400 mb-3">✓ Fortalezas</h3>
                    <ul className="space-y-2">
                      {anal?.principales_fortalezas?.map((f: any, i: number) => (
                        <li key={i} className="text-gray-300 text-sm flex gap-2">
                          <span className="text-emerald-500 mt-0.5">•</span>{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-emerald-950 rounded-xl p-5 border border-emerald-800">
                  <h3 className="font-semibold text-emerald-400 mb-2">💡 Recomendación esta semana</h3>
                  <p className="text-emerald-100 text-sm">{anal?.recomendacion}</p>
                </div>
              </div>
            )}

            {tab === 'infraestructura' && infra && filtrarPorFecha(infra) && (
              <div className="space-y-5">
                <p className="text-gray-500 text-xs">Analizado: {new Date(infra.fecha_analisis).toLocaleString()}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`rounded-xl p-5 border ${infra.dominio?.alerta ? 'bg-red-950 border-red-500' : 'bg-gray-900 border-gray-800'}`}>
                    <h3 className="font-semibold text-gray-300 mb-3">🌐 Dominio</h3>
                    <p className="text-sm text-gray-400">Expira: {infra.dominio?.expiracion}</p>
                    {infra.dominio?.dias_restantes && <p className="text-sm text-gray-400">Días restantes: {infra.dominio.dias_restantes}</p>}
                    {infra.dominio?.alerta && <p className="text-red-400 text-sm font-semibold mt-2">⚠ Vence pronto</p>}
                    {infra.dominio?.error && <p className="text-yellow-400 text-sm">{infra.dominio.error}</p>}
                  </div>
                  <div className={`rounded-xl p-5 border ${infra.ssl?.alerta ? 'bg-red-950 border-red-500' : 'bg-gray-900 border-gray-800'}`}>
                    <h3 className="font-semibold text-gray-300 mb-3">🔒 SSL</h3>
                    <p className={`text-sm font-semibold ${infra.ssl?.ssl_valido ? 'text-emerald-400' : 'text-red-400'}`}>
                      {infra.ssl?.ssl_valido ? '✓ Válido' : '✗ No válido'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Expira: {infra.ssl?.expiracion}</p>
                    <p className="text-sm text-gray-400">Días restantes: {infra.ssl?.dias_restantes}</p>
                    {infra.ssl?.alerta && <p className="text-red-400 text-sm font-semibold mt-2">⚠ Vence pronto</p>}
                  </div>
                  <div className={`rounded-xl p-5 border ${infra.velocidad?.alerta ? 'bg-red-950 border-red-500' : 'bg-gray-900 border-gray-800'}`}>
                    <h3 className="font-semibold text-gray-300 mb-3">⚡ Velocidad</h3>
                    {infra.velocidad ? (
                      <>
                        <div className="text-2xl font-bold text-emerald-400">{infra.velocidad.performance_score}/100</div>
                        <p className="text-sm text-gray-400 mt-1">FCP: {infra.velocidad.first_contentful_paint}</p>
                        <p className="text-sm text-gray-400">LCP: {infra.velocidad.largest_contentful_paint}</p>
                        {infra.velocidad.alerta && <p className="text-red-400 text-sm font-semibold mt-2">⚠ Sitio lento</p>}
                      </>
                    ) : (
                      <p className="text-gray-500 text-sm">Ingresa la URL para analizar velocidad</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}