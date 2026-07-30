import { ImageResponse } from 'next/og'
import { SITE_OG_ALT, SITE_OG_SUBTITLE } from '@/lib/site-metadata'

export const alt = SITE_OG_ALT
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#eae7df',
          color: '#1d1c19',
          fontFamily: 'monospace',
          padding: 56,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            border: '6px solid #1d1c19',
            boxShadow: '16px 16px 0 rgba(29, 28, 25, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            background:
              'radial-gradient(circle at 2px 2px, rgba(29,28,25,0.08) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        >
          <div
            style={{
              height: 64,
              background: '#1d1c19',
              color: '#f7f4ec',
              display: 'flex',
              alignItems: 'center',
              padding: '0 24px',
              gap: 18,
              fontSize: 24,
              letterSpacing: 0,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                border: '4px solid #f7f4ec',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              J
            </div>
            <div style={{ display: 'flex', flex: 1 }}>Jack OS</div>
            <div style={{ display: 'flex', fontSize: 18 }}>Interactive Portfolio</div>
          </div>

          <div
            style={{
              display: 'flex',
              flex: 1,
              padding: 44,
              gap: 36,
            }}
          >
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 70,
                  fontWeight: 800,
                  lineHeight: 1.02,
                  letterSpacing: 0,
                }}
              >
                Jack Dennehey
              </div>
              <div
                style={{
                  marginTop: 26,
                  fontSize: 34,
                  lineHeight: 1.25,
                  color: '#36342f',
                }}
              >
                {SITE_OG_SUBTITLE}
              </div>
            </div>

            <div
              style={{
                width: 330,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                justifyContent: 'center',
              }}
            >
              {['Credentials', 'Projects', 'About Me'].map((label) => (
                <div
                  key={label}
                  style={{
                    border: '4px solid #1d1c19',
                    background: '#f7f4ec',
                    padding: '20px 18px',
                    fontSize: 24,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      border: '4px solid #1d1c19',
                      display: 'flex',
                    }}
                  />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
