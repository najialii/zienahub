'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalNotFound() {
  useEffect(() => {
    // Hide any existing header/footer
    const body = document.body;
    const html = document.documentElement;
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    
    // Inject styles
    const style = document.createElement('style');
    style.innerHTML = `
      body > div:first-child > header,
      body > div:first-child > nav,
      body > div:first-child > footer {
        display: none !important;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      body.style.overflow = '';
      html.style.overflow = '';
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: '#000'
      }}>
        {/* Background Image with Overlay */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/404.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.5), rgba(0,0,0,0.7))',
            backdropFilter: 'blur(2px)'
          }} />
        </div>

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          textAlign: 'center'
        }}>
          {/* 404 Text */}
          <div style={{
            marginBottom: '2rem',
            animation: 'fadeIn 0.8s ease-out forwards'
          }}>
            <h1 style={{
              fontSize: 'clamp(120px, 20vw, 280px)',
              fontWeight: 'bold',
              lineHeight: 1,
              color: 'white',
              textShadow: '0 25px 50px rgba(0,0,0,0.5)',
              margin: 0
            }}>
              404
            </h1>
          </div>

          {/* Message */}
          <div style={{
            marginBottom: '3rem',
            maxWidth: '42rem',
            animation: 'fadeIn 0.8s ease-out 0.3s forwards',
            opacity: 0
          }}>
            <h2 style={{
              fontSize: 'clamp(1.875rem, 5vw, 3rem)',
              fontWeight: 600,
              color: 'white',
              textShadow: '0 10px 30px rgba(0,0,0,0.5)',
              marginBottom: '1rem'
            }}>
              Page Not Found
            </h2>
            <p style={{
              fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
              color: '#e5e7eb',
              textShadow: '0 5px 15px rgba(0,0,0,0.5)'
            }}>
              Oops! The page you&apos;re looking for seems to have wandered off. Let&apos;s get you back on track.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'fadeIn 0.8s ease-out 0.6s forwards',
            opacity: 0
          }}>
            <Link 
              href="/en"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '200px',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                color: 'black',
                textDecoration: 'none',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg style={{ marginRight: '0.5rem', width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Link>
            
            <Link
              href="/en"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '200px',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: '0.375rem',
                border: '2px solid white',
                backgroundColor: 'transparent',
                color: 'white',
                textDecoration: 'none',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = 'black';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg style={{ marginRight: '0.5rem', width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </Link>
          </div>

          {/* Decorative Elements */}
          <div style={{
            position: 'absolute',
            top: '2.5rem',
            left: '2.5rem',
            width: '5rem',
            height: '5rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            filter: 'blur(40px)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '5rem',
            right: '2.5rem',
            width: '8rem',
            height: '8rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            filter: 'blur(40px)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            animationDelay: '700ms'
          }} />
          <div style={{
            position: 'absolute',
            top: '33%',
            right: '25%',
            width: '4rem',
            height: '4rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            filter: 'blur(30px)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            animationDelay: '300ms'
          }} />
        </div>
      </div>
    </>
  );
}
