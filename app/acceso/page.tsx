'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const ERROR_MESSAGES: Record<string, string> = {
  token_faltante: 'El enlace no incluye un token válido.',
  enlace_invalido: 'Ese enlace ya expiró o ya fue usado. Solicita uno nuevo.',
  sin_suscripcion: 'Tu correo no tiene una suscripción activa. Suscríbete para acceder al dashboard.',
}

export default function AccesoPage() {
  return (
    <Suspense fallback={null}>
      <AccesoForm />
    </Suspense>
  )
}

function AccesoForm() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')

  const enviarEnlace = async () => {
    if (!email) return
    setEnviando(true)
    setErrorEnvio('')
    try {
      const res = await fetch('/api/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setEnviado(true)
      } else {
        const data = await res.json().catch(() => null)
        setErrorEnvio(data?.message ?? 'No pudimos procesar la solicitud. Intenta de nuevo.')
      }
    } catch (e) {
      console.error(e)
      setErrorEnvio('No pudimos conectar con el servidor. Intenta de nuevo.')
    }
    setEnviando(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        body { background: #0D0B1F; font-family: 'Inter', sans-serif; color: #fff; }
      `}</style>
      <main
        style={{
          minHeight: '100vh',
          background: '#0D0B1F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <div
          style={{
            background: '#151230',
            border: '1px solid #2A2560',
            borderRadius: 12,
            padding: 32,
            width: '100%',
            maxWidth: 380,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ color: '#E8A020', fontSize: 20 }}>⬡</span>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800 }}>
              GrowthCheck
            </h1>
          </div>
          <p style={{ color: '#8B87A8', fontSize: 13, marginBottom: 24 }}>
            Ingresa tu correo y te enviaremos un enlace de acceso al dashboard.
          </p>

          {urlError && (
            <div
              style={{
                background: 'rgba(220,38,38,0.15)',
                border: '1px solid rgba(220,38,38,0.4)',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 13,
                color: '#FCA5A5',
              }}
            >
              {ERROR_MESSAGES[urlError] ?? 'Ocurrió un error, intenta de nuevo.'}
            </div>
          )}

          {enviado ? (
            <p style={{ fontSize: 13, color: '#fff', lineHeight: 1.6 }}>
              Si tu correo tiene una suscripción activa, te enviamos un enlace de acceso.
              Revisa tu bandeja de entrada (y spam).
            </p>
          ) : (
            <>
              {errorEnvio && (
                <div
                  style={{
                    background: 'rgba(220,38,38,0.15)',
                    border: '1px solid rgba(220,38,38,0.4)',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    fontSize: 13,
                    color: '#FCA5A5',
                  }}
                >
                  {errorEnvio}
                </div>
              )}
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  background: '#0D0B1F',
                  border: '1px solid #2A2560',
                  borderRadius: 8,
                  padding: '12px 16px',
                  color: '#fff',
                  fontSize: 14,
                  width: '100%',
                  outline: 'none',
                  marginBottom: 12,
                }}
              />
              <button
                onClick={enviarEnlace}
                disabled={enviando || !email}
                style={{
                  background: '#E8A020',
                  color: '#0D0B1F',
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: 14,
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  cursor: enviando || !email ? 'not-allowed' : 'pointer',
                  opacity: enviando || !email ? 0.5 : 1,
                  width: '100%',
                }}
              >
                {enviando ? 'Enviando...' : 'Enviar enlace de acceso'}
              </button>
            </>
          )}
        </div>
      </main>
    </>
  )
}
