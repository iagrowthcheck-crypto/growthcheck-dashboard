'use client'
import { useState } from 'react'

const API = 'https://web-production-333dd.up.railway.app'

export default function Home() {
  const [negocio, setNegocio] = useState('')
  const [url, setUrl] = useState('')
  const [datos, setDatos] = useState<any>(null)
  const [infra, setInfra] = useState<any>(null)
  const [historial, setHistorial] = useState<any[]>([])
  const [cargando, setCargando] = useState(false)
  const [tab, setTab] = useState('resumen')
  const [fecha, setFecha] = useState('')

  const analizar = async () => {
    if (!negocio) return
    setCargando(true)
    try {
      const [repRes, dominioRes, sslRes, velRes, histRes] = await Promise.all([
        fetch(`${API}/analisis/${negocio}`),
        fetch(`${API}/dominio/${negocio}`),
        fetch(`${API}/ssl/${negocio}`),
        url ? fetch(`${API}/velocidad?url=${url}`) : Promise.resolve(null),
        fetch(`${API}/historial/${negocio}`)
      ])
      const rep = await repRes.json()
      const dominio = await dominioRes.json()
      const ssl = await sslRes.json()
      const vel = velRes ? await velRes.json() : null
      const hist = await histRes.json()
      setDatos({ ...rep, fecha_analisis: new Date().toISOString() })
      setInfra({ dominio, ssl, velocidad: vel, fecha_analisis: new Date().toISOString() })
      setHistorial(hist)
    } catch (e) {
      console.error(e)
    }
    setCargando(false)
  }

  const neg = datos?.negocio
  const anal = datos?.analisis
  const diag = anal?.diagnostico_operativo
  const plan = anal?.plan_de_mejora
  const sop = anal?.sop_sugerido
  const checklist = anal?.checklist_equipo

  const historialFiltrado = fecha ? historial.filter(h => h.fecha?.startsWith(fecha)) : historial

  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'reputacion', label: 'Reputación' },
    { id: 'diagnostico', label: 'Diagnóstico' },
    { id: 'plan', label: 'Plan de Mejora' },
    { id: 'infraestructura', label: 'Infraestructura' },
    { id: 'historial', label: `Historial ${historial.length > 0 ? `(${historial.length})` : ''}` },
  ]

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-400">Growth Check</h1>
          <p className="text-gray-400 mt-1">Sistema de Optimización Inteligente de Negocios</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <input type="text" placeholder="Nombre del negocio" value={negocio} onChange={(e) => setNegocio(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" />
          <input type="text" placeholder="URL del sitio (opcional)" value={url} onChange={(e) => setUrl(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" />
          <button onClick={analizar} disabled={cargando} className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold px-6 py-3 rounded-lg transition">
            {cargando ? 'Analizando...' : 'Analizar'}
          </button>
        </div>

        {(datos || infra) && (
          <>
            <div className="flex gap-2 mb-6 flex-wrap items-center">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-2 rounded-full text-xs font-medium transition ${tab === t.id ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{t.label}</button>
              ))}
              <div className="ml-auto">
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" />
              </div>
            </div>

            {tab === 'resumen' && datos && (
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
                    <span className="text-xl">⚠️</span>
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

                {diag && (
                  <div className={`rounded-xl p-5 border ${diag.prioridad === 'alta' ? 'bg-red-950 border-red-800' : 'bg-gray-900 border-gray-800'}`}>
                    <h3 className="font-semibold text-white mb-3">🔍 Diagnóstico rápido</h3>
                    <p className="text-sm text-gray-300"><span className="text-gray-500">Proceso que falla:</span> {diag.proceso_que_falla}</p>
                    <p className="text-sm text-gray-300 mt-1"><span className="text-gray-500">Causa raíz:</span> {diag.causa_raiz}</p>
                    <p className="text-sm text-red-400 mt-1 font-semibold">{diag.impacto_economico}</p>
                  </div>
                )}

                <div className="bg-emerald-950 rounded-xl p-5 border border-emerald-800">
                  <h3 className="font-semibold text-emerald-400 mb-2">💡 Acción urgente</h3>
                  <p className="text-emerald-100 text-sm">{anal?.recomendacion}</p>
                </div>
              </div>
            )}

            {tab === 'reputacion' && datos && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                    <h3 className="font-semibold text-red-400 mb-3">⚠ Problemas detectados</h3>
                    <ul className="space-y-2">
                      {anal?.principales_problemas?.map((p: any, i: number) => (
                        <li key={i} className="text-gray-300 text-sm flex gap-2"><span className="text-red-500">•</span>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                    <h3 className="font-semibold text-emerald-400 mb-3">✓ Fortalezas</h3>
                    <ul className="space-y-2">
                      {anal?.principales_fortalezas?.map((f: any, i: number) => (
                        <li key={i} className="text-gray-300 text-sm flex gap-2"><span className="text-emerald-500">•</span>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {tab === 'diagnostico' && diag && (
              <div className="space-y-5">
                <div className={`rounded-xl p-6 border ${diag.prioridad === 'alta' ? 'bg-red-950 border-red-800' : 'bg-gray-900 border-gray-800'}`}>
                  <h3 className="font-semibold text-white text-lg mb-4">🔍 Diagnóstico Operativo</h3>
                  <div className="space-y-3">
                    <div><p className="text-gray-500 text-xs uppercase tracking-wide">Proceso que falla</p><p className="text-white text-sm mt-1">{diag.proceso_que_falla}</p></div>
                    <div><p className="text-gray-500 text-xs uppercase tracking-wide">Etapa del fallo</p><p className="text-white text-sm mt-1">{diag.etapa_del_fallo}</p></div>
                    <div><p className="text-gray-500 text-xs uppercase tracking-wide">Causa raíz</p><p className="text-white text-sm mt-1">{diag.causa_raiz}</p></div>
                    <div><p className="text-gray-500 text-xs uppercase tracking-wide">Impacto económico</p><p className="text-red-400 text-sm mt-1 font-semibold">{diag.impacto_economico}</p></div>
                    <div><p className="text-gray-500 text-xs uppercase tracking-wide">Prioridad</p><span className={`text-xs font-semibold px-3 py-1 rounded-full ${diag.prioridad === 'alta' ? 'bg-red-500 text-white' : diag.prioridad === 'media' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'}`}>{diag.prioridad?.toUpperCase()}</span></div>
                  </div>
                </div>

                {checklist && (
                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <h3 className="font-semibold text-white text-lg mb-4">✅ Checklist del equipo</h3>
                    <ul className="space-y-3">
                      {checklist.map((item: string, i: number) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-300">
                          <span className="text-emerald-400 flex-shrink-0">☐</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {tab === 'plan' && plan && (
              <div className="space-y-5">
                {sop && (
                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <h3 className="font-semibold text-emerald-400 text-lg mb-1">📋 {sop.titulo}</h3>
                    <p className="text-gray-400 text-sm mb-4">{sop.objetivo}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div><p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Responsable</p><p className="text-white text-sm">{sop.responsable}</p></div>
                      <div><p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Frecuencia</p><p className="text-white text-sm">{sop.frecuencia}</p></div>
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Pasos</p>
                    <ol className="space-y-2">
                      {sop.pasos?.map((paso: string, i: number) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-300">
                          <span className="text-emerald-400 font-bold flex-shrink-0">{i + 1}.</span>{paso}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['semana_1', 'semana_2', 'semana_3'].map((semana, idx) => (
                    <div key={semana} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                      <h4 className="font-semibold text-white mb-3">Semana {idx + 1}</h4>
                      <ul className="space-y-2">
                        {plan[semana]?.map((accion: string, i: number) => (
                          <li key={i} className="text-gray-300 text-xs flex gap-2"><span className="text-emerald-400 flex-shrink-0">→</span>{accion}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'infraestructura' && infra && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`rounded-xl p-5 border ${infra.dominio?.alerta ? 'bg-red-950 border-red-500' : 'bg-gray-900 border-gray-800'}`}>
                    <h3 className="font-semibold text-gray-300 mb-3">🌐 Dominio</h3>
                    <p className="text-sm text-gray-400">Expira: {infra.dominio?.expiracion}</p>
                    {infra.dominio?.dias_restantes && <p className="text-sm text-gray-400">Días: {infra.dominio.dias_restantes}</p>}
                    {infra.dominio?.alerta && <p className="text-red-400 text-sm font-semibold mt-2">⚠ Vence pronto</p>}
                  </div>
                  <div className={`rounded-xl p-5 border ${infra.ssl?.alerta ? 'bg-red-950 border-red-500' : 'bg-gray-900 border-gray-800'}`}>
                    <h3 className="font-semibold text-gray-300 mb-3">🔒 SSL</h3>
                    <p className={`text-sm font-semibold ${infra.ssl?.ssl_valido ? 'text-emerald-400' : 'text-red-400'}`}>{infra.ssl?.ssl_valido ? '✓ Válido' : '✗ No válido'}</p>
                    <p className="text-sm text-gray-400 mt-1">Expira: {infra.ssl?.expiracion}</p>
                    <p className="text-sm text-gray-400">Días: {infra.ssl?.dias_restantes}</p>
                  </div>
                  <div className={`rounded-xl p-5 border ${infra.velocidad?.alerta ? 'bg-red-950 border-red-500' : 'bg-gray-900 border-gray-800'}`}>
                    <h3 className="font-semibold text-gray-300 mb-3">⚡ Velocidad</h3>
                    {infra.velocidad ? (
                      <>
                        <div className="text-2xl font-bold text-emerald-400">{infra.velocidad.performance_score}/100</div>
                        <p className="text-sm text-gray-400 mt-1">FCP: {infra.velocidad.first_contentful_paint}</p>
                        <p className="text-sm text-gray-400">LCP: {infra.velocidad.largest_contentful_paint}</p>
                      </>
                    ) : (
                      <p className="text-gray-500 text-sm">Ingresa la URL para analizar</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab === 'historial' && (
              <div className="space-y-4">
                {historialFiltrado.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">No hay análisis para mostrar.</p>
                ) : (
                  historialFiltrado.map((h: any) => (
                    <div key={h.id} className={`rounded-xl p-5 border ${h.alerta_critica ? 'bg-red-950 border-red-800' : 'bg-gray-900 border-gray-800'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold">{h.negocio}</p>
                          <p className="text-gray-500 text-xs mt-1">{new Date(h.fecha).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-emerald-400">{h.rating} ⭐</div>
                          <div className={`text-xs font-semibold mt-1 capitalize ${h.sentimiento === 'negativo' ? 'text-red-400' : h.sentimiento === 'positivo' ? 'text-emerald-400' : 'text-yellow-400'}`}>{h.sentimiento}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-emerald-400">{h.porcentaje_positivo}%</div>
                          <div className="text-gray-400 text-xs">Positivo</div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-red-400">{h.porcentaje_negativo}%</div>
                          <div className="text-gray-400 text-xs">Negativo</div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{h.resumen}</p>
                      {h.alerta_critica && <p className="text-red-400 text-xs font-semibold mt-2">⚠ Alerta crítica</p>}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}