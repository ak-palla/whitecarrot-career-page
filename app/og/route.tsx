import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const alt = 'Career Page';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('company') || 'Lisco';
    const title = searchParams.get('title') || 'Careers';
    const description = searchParams.get('description') || 'Join our team';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            backgroundImage: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '20px',
                lineHeight: '1.2',
              }}
            >
              {title}
            </h1>
            <h2
              style={{
                fontSize: '48px',
                color: '#a0a0a0',
                marginBottom: '40px',
                fontWeight: 'normal',
              }}
            >
              {companyName}
            </h2>
            <p
              style={{
                fontSize: '32px',
                color: '#d0d0d0',
                maxWidth: '900px',
                lineHeight: '1.5',
              }}
            >
              {description}
            </p>
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (e: any) {
    console.error('Error generating OG image:', e);
    // Return a simple fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            color: '#ffffff',
            fontSize: '48px',
          }}
        >
          Careers at Lisco
        </div>
      ),
      {
        ...size,
      }
    );
  }
}

