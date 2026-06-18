'use client'
import { useState } from 'react'

const API = 'https://web-production-333dd.up.railway.app'

export default function Home() {
  const [negocio, setNegocio] = useState('')
  const [url, setUrl] = useState('')
  const [mapsUrl, setMapsUrl] = useState('')
  const [datos, setDatos] = useState<any>(null)
  const [infra, setInfra] = useState<any>(null)
  const [historial, setHistorial] = useState<any[]>([])
  const [cargando, setCargando] = useState(false)
  const [tab, setTab] = useState('resumen')
  const [fecha, setFecha] = useState('')
  const [problema, setProblema] = useState('')
  const [consultorResp, setConsultorResp] = useState<any>(null)
  const [consultorCargando, setConsultorCargando] = useState(false)

  const analizar = async () => {
    if (!negocio) return
    setCargando(true)
    try {
      const nombreFinal = negocio
      const [repRes, dominioRes, sslRes, velRes, histRes] = await Promise.all([
        fetch(`${API}/analisis/${nombreFinal}`),
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

  const consultarIA = async () => {
    if (!problema) return
    setConsultorCargando(true)
    try {
      const res = await fetch(`${API}/consultor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problema, negocio: negocio || 'mi negocio' })
      })
      const data = await res.json()
      setConsultorResp(data)
    } catch (e) {
      console.error(e)
    }
    setConsultorCargando(false)
  }

  const descargarPDF = () => {
    if (!consultorResp) return
    const contenido = `
CONSULTORÍA GROWTHCHECK
========================
Negocio: ${negocio || 'Mi negocio'}
Fecha: ${new Date().toLocaleString()}

PROBLEMA REPORTADO
------------------
${problema}

DIAGNÓSTICO
-----------
${consultorResp.diagnostico}

CAUSA PROBABLE
--------------
${consultorResp.causa_probable}

ACCIONES CONCRETAS
------------------
${consultorResp.acciones?.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}

CHECKLIST DE VERIFICACIÓN
-------------------------
${consultorResp.checklist?.map((c: string) => `☐ ${c}`).join('\n')}

TIEMPO ESTIMADO: ${consultorResp.tiempo_estimado}
PRIORIDAD: ${consultorResp.prioridad?.toUpperCase()}

---
growthcheck.ink
    `
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
    const urlObj = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = urlObj
    a.download = `GrowthCheck-Consulta-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(urlObj)
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
    { id: 'consultor', label: '🤖 Consultor IA' },
    { id: 'historial', label: `Historial${historial.length > 0 ? ` (${historial.length})` : ''}` },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0B1F; font-family: 'Inter', sans-serif; color: #fff; }
        .syne { font-family: 'Syne', sans-serif; }
        .card { background: #151230; border: 1px solid #2A2560; border-radius: 12px; padding: 20px; }
        .card-dark { background: #0D0B1F; border: 1px solid #2A2560; border-radius: 12px; padding: 16px; }
        .btn-primary { background: #E8A020; color: #0D0B1F; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer; transition: background 0.2s; }
        .btn-primary:hover { background: #F5B840; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary { background: transparent; color: #8B87A8; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; border: 1px solid #2A2560; border-radius: 20px; padding: 6px 14px; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { border-color: #E8A020; color: #E8A020; }
        .btn-active { background: #E8A020; color: #0D0B1F; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; border: 1px solid #E8A020; border-radius: 20px; padding: 6px 14px; cursor: pointer; }
        .btn-outline { background: transparent; color: #E8A020; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; border: 1px solid #E8A020; border-radius: 8px; padding: 10px 20px; cursor: pointer; transition: all 0.2s; }
        .btn-outline:hover { background: #E8A020; color: #0D0B1F; }
        .input-field { background: #151230; border: 1px solid #2A2560; border-radius: 8px; padding: 12px 16px; color: #fff; font-family: 'Inter', sans-serif; font-size: 14px; width: 100%; outline: none; transition: border 0.2s; }
        .input-field::placeholder { color: #8B87A8; }
        .input-field:focus { border-color: #E8A020; }
        .textarea-field { background: #151230; border: 1px solid #2A2560; border-radius: 8px; padding: 12px 16px; color: #fff; font-family: 'Inter', sans-serif; font-size: 14px; width: 100%; outline: none; transition: border 0.2s; resize: vertical; min-height: 100px; line-height: 1.6; }
        .textarea-field::placeholder { color: #8B87A8; }
        .textarea-field:focus { border-color: #E8A020; }
        .label { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; color: #E8A020; letter-spacing: 1px; text-transform: uppercase; }
        .text-muted { color: #8B87A8; font-size: 14px; }
        .text-small { color: #8B87A8; font-size: 12px; }
        .alert-critical { background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.4); border-radius: 12px; padding: 16px; }
        .badge-alta { background: #E8A020; color: #0D0B1F; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; font-family: 'Syne', sans-serif; }
        .badge-media { background: #2A2560; color: #8B87A8; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        @media (max-width: 640px) { .grid-3 { grid-template-columns: 1fr; } .grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <main style={{ minHeight: '100vh', background: '#0D0B1F', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ color: '#E8A020', fontSize: 20 }}>⬡</span>
            <h1 className="syne" style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>GrowthCheck</h1>
          </div>
          <p className="text-muted" style={{ fontSize: 13 }}>Sistema de Optimización Inteligente de Negocios</p>
        </div>

        {/* Buscador */}
        <div className="card" style={{ marginBottom: 24 }}>
          <span className="label" style={{ display: 'block', marginBottom: 12 }}>Analizar negocio</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <input className="input-field" type="text" placeholder="Nombre del negocio" value={negocio} onChange={(e) => setNegocio(e.target.value)} />
            <input className="input-field" type="text" placeholder="URL del sitio web (opcional)" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
            <input className="input-field" type="text" placeholder="URL de Google Maps (opcional — para analizar sucursal específica)" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} />
            <button className="btn-primary" onClick={analizar} disabled={cargando} style={{ whiteSpace: 'nowrap' }}>
              {cargando ? 'Analizando...' : 'Analizar →'}
            </button>
          </div>
        </div>

        {(datos || infra) && (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'btn-active' : 'btn-secondary'}>{t.label}</button>
              ))}
              <div style={{ marginLeft: 'auto' }}>
                <input className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ width: 'auto', fontSize: 12, padding: '6px 12px' }} />
              </div>
            </div>

            {/* RESUMEN */}
            {tab === 'resumen' && datos && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2 className="syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{neg?.nombre}</h2>
                      <p className="text-small">{neg?.direccion}</p>
                      <p className="text-small" style={{ marginTop: 4 }}>Analizado: {new Date(datos.fecha_analisis).toLocaleString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="syne" style={{ fontSize: 32, fontWeight: 800, color: '#E8A020' }}>{neg?.rating} ⭐</div>
                      <p className="text-small">{neg?.total_resenas} reseñas</p>
                    </div>
                  </div>
                </div>

                {anal?.alerta_critica && (
                  <div className="alert-critical">
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 18 }}>⚠️</span>
                      <div>
                        <p className="syne" style={{ fontWeight: 700, color: '#EF4444', marginBottom: 4 }}>Alerta crítica detectada</p>
                        <p className="text-small" style={{ color: '#FCA5A5', lineHeight: 1.6 }}>{anal.resumen}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid-3">
                  <div className="card" style={{ textAlign: 'center' }}>
                    <div className="syne" style={{ fontSize: 28, fontWeight: 800, color: '#1B9E75' }}>{anal?.porcentaje_positivo}%</div>
                    <p className="text-small" style={{ marginTop: 4 }}>Positivo</p>
                  </div>
                  <div className="card" style={{ textAlign: 'center' }}>
                    <div className="syne" style={{ fontSize: 28, fontWeight: 800, color: '#EF4444' }}>{anal?.porcentaje_negativo}%</div>
                    <p className="text-small" style={{ marginTop: 4 }}>Negativo</p>
                  </div>
                  <div className="card" style={{ textAlign: 'center' }}>
                    <div className="syne" style={{ fontSize: 20, fontWeight: 800, color: '#E8A020', textTransform: 'capitalize' }}>{anal?.sentimiento_general}</div>
                    <p className="text-small" style={{ marginTop: 4 }}>Sentimiento</p>
                  </div>
                </div>

                {diag && (
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className="label">Diagnóstico rápido</span>
                      <span className={diag.prioridad === 'alta' ? 'badge-alta' : 'badge-media'}>{diag.prioridad?.toUpperCase()}</span>
                    </div>
                    <p className="text-small" style={{ marginBottom: 6 }}><span style={{ color: '#8B87A8' }}>Proceso:</span> <span style={{ color: '#fff' }}>{diag.proceso_que_falla}</span></p>
                    <p className="text-small" style={{ marginBottom: 6 }}><span style={{ color: '#8B87A8' }}>Causa raíz:</span> <span style={{ color: '#fff' }}>{diag.causa_raiz}</span></p>
                    <p className="text-small" style={{ color: '#E8A020', fontWeight: 600 }}>{diag.impacto_economico}</p>
                  </div>
                )}

                <div className="card" style={{ borderColor: '#E8A020' }}>
                  <span className="label" style={{ display: 'block', marginBottom: 8 }}>💡 Acción urgente</span>
                  <p className="text-small" style={{ color: '#fff', lineHeight: 1.7 }}>{anal?.recomendacion}</p>
                </div>
              </div>
            )}

            {/* REPUTACIÓN */}
            {tab === 'reputacion' && datos && (
              <div className="grid-2">
                <div className="card">
                  <span className="label" style={{ color: '#EF4444', display: 'block', marginBottom: 12 }}>⚠ Problemas detectados</span>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {anal?.principales_problemas?.map((p: any, i: number) => (
                      <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#fff' }}>
                        <span style={{ color: '#EF4444', flexShrink: 0 }}>•</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card">
                  <span className="label" style={{ color: '#1B9E75', display: 'block', marginBottom: 12 }}>✓ Fortalezas</span>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {anal?.principales_fortalezas?.map((f: any, i: number) => (
                      <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#fff' }}>
                        <span style={{ color: '#1B9E75', flexShrink: 0 }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* DIAGNÓSTICO */}
            {tab === 'diagnostico' && diag && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 className="syne" style={{ fontSize: 16, fontWeight: 700 }}>🔍 Diagnóstico Operativo</h3>
                    <span className={diag.prioridad === 'alta' ? 'badge-alta' : 'badge-media'}>{diag.prioridad?.toUpperCase()}</span>
                  </div>
                  {[
                    { label: 'Proceso que falla', value: diag.proceso_que_falla },
                    { label: 'Etapa del fallo', value: diag.etapa_del_fallo },
                    { label: 'Causa raíz', value: diag.causa_raiz },
                  ].map((item, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <span className="label" style={{ display: 'block', marginBottom: 4 }}>{item.label}</span>
                      <p style={{ fontSize: 13, color: '#fff', lineHeight: 1.6 }}>{item.value}</p>
                    </div>
                  ))}
                  <div>
                    <span className="label" style={{ display: 'block', marginBottom: 4 }}>Impacto económico</span>
                    <p style={{ fontSize: 13, color: '#E8A020', fontWeight: 600, lineHeight: 1.6 }}>{diag.impacto_economico}</p>
                  </div>
                </div>

                {checklist && (
                  <div className="card">
                    <span className="label" style={{ display: 'block', marginBottom: 12 }}>✅ Checklist del equipo</span>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {checklist.map((item: string, i: number) => (
                        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#fff', lineHeight: 1.6 }}>
                          <span style={{ color: '#E8A020', flexShrink: 0 }}>☐</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* PLAN DE MEJORA */}
            {tab === 'plan' && plan && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {sop && (
                  <div className="card">
                    <span className="label" style={{ display: 'block', marginBottom: 4 }}>SOP Sugerido</span>
                    <h3 className="syne" style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📋 {sop.titulo}</h3>
                    <p className="text-small" style={{ marginBottom: 12 }}>{sop.objetivo}</p>
                    <div className="grid-2" style={{ marginBottom: 12 }}>
                      <div><span className="label" style={{ display: 'block', marginBottom: 4 }}>Responsable</span><p style={{ fontSize: 13, color: '#fff' }}>{sop.responsable}</p></div>
                      <div><span className="label" style={{ display: 'block', marginBottom: 4 }}>Frecuencia</span><p style={{ fontSize: 13, color: '#fff' }}>{sop.frecuencia}</p></div>
                    </div>
                    <span className="label" style={{ display: 'block', marginBottom: 8 }}>Pasos</span>
                    <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {sop.pasos?.map((paso: string, i: number) => (
                        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#fff', lineHeight: 1.6 }}>
                          <span className="syne" style={{ color: '#E8A020', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{paso}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                <div className="grid-3">
                  {['semana_1', 'semana_2', 'semana_3'].map((semana, idx) => (
                    <div key={semana} className="card">
                      <span className="label" style={{ display: 'block', marginBottom: 8 }}>Semana {idx + 1}</span>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {plan[semana]?.map((accion: string, i: number) => (
                          <li key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: '#fff', lineHeight: 1.6 }}>
                            <span style={{ color: '#E8A020', flexShrink: 0 }}>→</span>{accion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INFRAESTRUCTURA */}
            {tab === 'infraestructura' && infra && (
              <div className="grid-3">
                <div className="card" style={{ borderColor: infra.dominio?.alerta ? '#EF4444' : '#2A2560' }}>
                  <span className="label" style={{ display: 'block', marginBottom: 8 }}>🌐 Dominio</span>
                  <p className="text-small">Expira: {infra.dominio?.expiracion}</p>
                  {infra.dominio?.dias_restantes && <p className="text-small">Días: {infra.dominio.dias_restantes}</p>}
                  {infra.dominio?.alerta && <p style={{ color: '#EF4444', fontSize: 12, fontWeight: 600, marginTop: 8 }}>⚠ Vence pronto</p>}
                </div>
                <div className="card" style={{ borderColor: infra.ssl?.alerta ? '#EF4444' : '#2A2560' }}>
                  <span className="label" style={{ display: 'block', marginBottom: 8 }}>🔒 SSL</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: infra.ssl?.ssl_valido ? '#1B9E75' : '#EF4444' }}>{infra.ssl?.ssl_valido ? '✓ Válido' : '✗ No válido'}</p>
                  <p className="text-small" style={{ marginTop: 4 }}>Expira: {infra.ssl?.expiracion}</p>
                  <p className="text-small">Días: {infra.ssl?.dias_restantes}</p>
                  {infra.ssl?.alerta && <p style={{ color: '#EF4444', fontSize: 12, fontWeight: 600, marginTop: 8 }}>⚠ Vence pronto</p>}
                </div>
                <div className="card" style={{ borderColor: infra.velocidad?.alerta ? '#EF4444' : '#2A2560' }}>
                  <span className="label" style={{ display: 'block', marginBottom: 8 }}>⚡ Velocidad</span>
                  {infra.velocidad ? (
                    <>
                      <div className="syne" style={{ fontSize: 28, fontWeight: 800, color: '#E8A020' }}>{infra.velocidad.performance_score}/100</div>
                      <p className="text-small" style={{ marginTop: 4 }}>FCP: {infra.velocidad.first_contentful_paint}</p>
                      <p className="text-small">LCP: {infra.velocidad.largest_contentful_paint}</p>
                      {infra.velocidad.alerta && <p style={{ color: '#EF4444', fontSize: 12, fontWeight: 600, marginTop: 8 }}>⚠ Sitio lento</p>}
                    </>
                  ) : (
                    <p className="text-small">Ingresa la URL para analizar</p>
                  )}
                </div>
              </div>
            )}

            {/* CONSULTOR IA */}
            {tab === 'consultor' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                  <span className="label" style={{ display: 'block', marginBottom: 8 }}>🤖 Consultor Virtual GrowthCheck</span>
                  <p className="text-small" style={{ marginBottom: 16, lineHeight: 1.6 }}>Describe el problema que enfrenta tu negocio y la IA te dará un diagnóstico con acciones concretas.</p>
                  <textarea
                    className="textarea-field"
                    placeholder="Ej: Mis clientes se quejan de que el tiempo de espera es muy largo y perdemos clientes en hora pico..."
                    value={problema}
                    onChange={(e) => setProblema(e.target.value)}
                    style={{ marginBottom: 12 }}
                  />
                  <button className="btn-primary" onClick={consultarIA} disabled={consultorCargando || !problema}>
                    {consultorCargando ? 'Analizando problema...' : 'Consultar IA →'}
                  </button>
                </div>

                {consultorResp && (
                  <>
                    <div className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <span className="label">Resultado del análisis</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span className={consultorResp.prioridad === 'alta' ? 'badge-alta' : 'badge-media'}>{consultorResp.prioridad?.toUpperCase()}</span>
                          <button className="btn-outline" onClick={descargarPDF}>⬇ Descargar</button>
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <span className="label" style={{ display: 'block', marginBottom: 6 }}>Diagnóstico</span>
                        <p style={{ fontSize: 13, color: '#fff', lineHeight: 1.7 }}>{consultorResp.diagnostico}</p>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <span className="label" style={{ display: 'block', marginBottom: 6 }}>Causa probable</span>
                        <p style={{ fontSize: 13, color: '#fff', lineHeight: 1.7 }}>{consultorResp.causa_probable}</p>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <span className="label" style={{ display: 'block', marginBottom: 8 }}>Acciones concretas</span>
                        <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {consultorResp.acciones?.map((a: string, i: number) => (
                            <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#fff', lineHeight: 1.6 }}>
                              <span className="syne" style={{ color: '#E8A020', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{a}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <span className="label" style={{ display: 'block', marginBottom: 8 }}>Checklist de verificación</span>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {consultorResp.checklist?.map((c: string, i: number) => (
                            <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#fff', lineHeight: 1.6 }}>
                              <span style={{ color: '#E8A020', flexShrink: 0 }}>☐</span>{c}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ borderTop: '1px solid #2A2560', paddingTop: 12, display: 'flex', gap: 16 }}>
                        <p className="text-small">⏱ Tiempo estimado: <span style={{ color: '#fff' }}>{consultorResp.tiempo_estimado}</span></p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* HISTORIAL */}
            {tab === 'historial' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {historialFiltrado.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <p className="text-muted">No hay análisis para mostrar.</p>
                  </div>
                ) : (
                  historialFiltrado.map((h: any) => (
                    <div key={h.id} className="card" style={{ borderColor: h.alerta_critica ? 'rgba(220,38,38,0.4)' : '#2A2560' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <h3 className="syne" style={{ fontSize: 15, fontWeight: 700 }}>{h.negocio}</h3>
                          <p className="text-small" style={{ marginTop: 2 }}>{new Date(h.fecha).toLocaleString()}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="syne" style={{ fontSize: 20, fontWeight: 800, color: '#E8A020' }}>{h.rating} ⭐</div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: h.sentimiento === 'negativo' ? '#EF4444' : h.sentimiento === 'positivo' ? '#1B9E75' : '#E8A020', textTransform: 'capitalize' }}>{h.sentimiento}</p>
                        </div>
                      </div>
                      <div className="grid-2" style={{ marginBottom: 12 }}>
                        <div className="card-dark" style={{ textAlign: 'center' }}>
                          <div className="syne" style={{ fontSize: 20, fontWeight: 800, color: '#1B9E75' }}>{h.porcentaje_positivo}%</div>
                          <p className="text-small">Positivo</p>
                        </div>
                        <div className="card-dark" style={{ textAlign: 'center' }}>
                          <div className="syne" style={{ fontSize: 20, fontWeight: 800, color: '#EF4444' }}>{h.porcentaje_negativo}%</div>
                          <p className="text-small">Negativo</p>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: '#8B87A8', lineHeight: 1.6 }}>{h.resumen}</p>
                      {h.alerta_critica && <p style={{ color: '#EF4444', fontSize: 11, fontWeight: 700, marginTop: 8 }}>⚠ ALERTA CRÍTICA</p>}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}