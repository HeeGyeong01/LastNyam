/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Foreground (텍스트 색상)
        primary: 'rgb(var(--color-foreground-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-foreground-secondary) / <alpha-value>)',
        tertiary: 'rgb(var(--color-foreground-tertiary) / <alpha-value>)',
        subtle: 'rgb(var(--color-foreground-subtle) / <alpha-value>)',
        inverse: 'rgb(var(--color-foreground-inverse) / <alpha-value>)',
        
        // Background
        'bg-0': 'rgb(var(--color-bg-0) / <alpha-value>)',
        'bg-1': 'rgb(var(--color-bg-1) / <alpha-value>)',
        'bg-2': 'rgb(var(--color-bg-2) / <alpha-value>)',
        'bg-3': 'rgb(var(--color-bg-3) / <alpha-value>)',
        'bg-dimmed-1': 'rgb(var(--color-bg-dimmed-1) / 0.4)',
        'bg-dimmed-2': 'rgb(var(--color-bg-dimmed-2) / 0.2)',
        'bg-inverse': 'rgb(var(--color-bg-inverse) / <alpha-value>)',
        
        // Brand
        brand: 'rgb(var(--color-brand) / <alpha-value>)',
        'brand-strong': 'rgb(var(--color-brand-strong) / <alpha-value>)',
        'brand-subtle': 'rgb(var(--color-brand-subtle) / <alpha-value>)',
        'brand-bg-1': 'rgb(var(--color-brand-bg-1) / <alpha-value>)',
        'brand-bg-2': 'rgb(var(--color-brand-bg-2) / <alpha-value>)',
        'brand-bg-3': 'rgb(var(--color-brand-bg-3) / <alpha-value>)',
        
        // Semantic
        error: 'rgb(var(--color-error) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
        
        // Stroke
        'stroke-1': 'rgb(var(--color-stroke-1) / <alpha-value>)',
        'stroke-2': 'rgb(var(--color-stroke-2) / <alpha-value>)',
        'stroke-3': 'rgb(var(--color-stroke-3) / <alpha-value>)',
        'stroke-subtle': 'rgb(var(--color-stroke-subtle) / <alpha-value>)',
        'stroke-inverse': 'rgb(var(--color-stroke-inverse) / <alpha-value>)',
      },
      fontFamily: {
        // 기본 폰트 (Pretendard)
        sans: ['Pretendard', 'sans-serif'],
        
        // 브랜드 한글 폰트 (RixInooAriDuri)
        // 폰트 파일이 없으면 아래 주석을 해제하고 Google Fonts 사용
        'kr-h1': ['RixInooAriDuri', 'Gaegu', 'sans-serif'],  // fallback: Gaegu
        'kr-h2': ['RixInooAriDuri', 'Gaegu', 'sans-serif'],
        'kr-h3': ['RixInooAriDuri', 'Gaegu', 'sans-serif'],
        'kr-h4': ['RixInooAriDuri', 'Gaegu', 'sans-serif'],
        'kr-h5': ['RixInooAriDuri', 'Gaegu', 'sans-serif'],
        
        // 브랜드 영문 폰트 (Modak)
        'en-h1': ['Modak', 'sans-serif'],
        'en-h2': ['Modak', 'sans-serif'],
        'en-h3': ['Modak', 'sans-serif'],
        'en-h4': ['Modak', 'sans-serif'],
        'en-h5': ['Modak', 'sans-serif'],
      },
      fontSize: {
        // 기본 타이포그래피 (Pretendard)
        'h1': ['48px', { lineHeight: '48px', fontWeight: '800' }],
        'h2': ['30px', { lineHeight: '36px', fontWeight: '500' }],
        'h2-b': ['30px', { lineHeight: '36px', fontWeight: '700' }],
        'h3': ['24px', { lineHeight: '32px', fontWeight: '500' }],
        'h3-b': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'h4': ['20px', { lineHeight: '28px', fontWeight: '500' }],
        'h4-b': ['20px', { lineHeight: '28px', fontWeight: '700' }],
        'h5': ['18px', { lineHeight: '28px', fontWeight: '500' }],
        'h5-b': ['18px', { lineHeight: '28px', fontWeight: '700' }],
        'p1': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'p1-b': ['16px', { lineHeight: '24px', fontWeight: '700' }],
        'p2': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'p2-b': ['14px', { lineHeight: '20px', fontWeight: '700' }],
        'p3': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'p3-b': ['12px', { lineHeight: '16px', fontWeight: '700' }],
        'caption1': ['11px', { lineHeight: '14px', fontWeight: '500' }],
        'caption1-b': ['11px', { lineHeight: '14px', fontWeight: '700' }],
        'caption2': ['10px', { lineHeight: '12px', fontWeight: '500' }],
        'caption2-b': ['10px', { lineHeight: '12px', fontWeight: '700' }],
        
        // 브랜드 한글 타이포그래피 (RixInooAriDuri)
        'kr-h1': ['48px', { lineHeight: '48px', fontWeight: '400' }],
        'kr-h2': ['30px', { lineHeight: '36px', fontWeight: '400' }],
        'kr-h3': ['24px', { lineHeight: '32px', fontWeight: '400' }],
        'kr-h4': ['20px', { lineHeight: '28px', fontWeight: '400' }],
        'kr-h5': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        
        // 브랜드 영문 타이포그래피 (Modak)
        'en-h1': ['60px', { lineHeight: '60px', fontWeight: '400' }],
        'en-h2': ['36px', { lineHeight: '40px', fontWeight: '400' }],
        'en-h3': ['30px', { lineHeight: '36px', fontWeight: '400' }],
        'en-h4': ['24px', { lineHeight: '32px', fontWeight: '400' }],
        'en-h5': ['18px', { lineHeight: '28px', fontWeight: '400' }],
      },
      animation: {
        'fade-in': 'fade-in 1s ease forwards',
        'fade-up': 'fade-up 1s ease forwards',
        'marquee': 'marquee var(--duration) linear infinite',
        'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
        'shimmer': 'shimmer 8s infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        'marquee': {
          '0%': { transform: 'translate(0)' },
          '100%': { transform: 'translateX(calc(-100% - var(--gap)))' },
        },
        'marquee-vertical': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(calc(-100% - var(--gap)))' },
        },
        'shimmer': {
          '0%, 90%, 100%': { backgroundPosition: 'calc(-100% - var(--shimmer-width)) 0' },
          '30%, 60%': { backgroundPosition: 'calc(100% + var(--shimmer-width)) 0' },
        },
      },
    },
  },
  plugins: [],
}
