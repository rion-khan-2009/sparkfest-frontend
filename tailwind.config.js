/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark: { DEFAULT:'#0B0F1A', panel:'#111827', card:'#1a2035' },
        neon: { cyan:'#00f5ff', blue:'#3b82f6', purple:'#a855f7' }
      },
      fontFamily: { display:['Orbitron','sans-serif'] },
      animation: {
        'float':'float 3s ease-in-out infinite',
        'fade-in':'fadeIn 0.5s ease-in',
      },
      keyframes: {
        'float':{'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-8px)'}},
        'fadeIn':{'from':{opacity:'0',transform:'translateY(10px)'},'to':{opacity:'1',transform:'translateY(0)'}},
      }
    }
  },
  plugins: [],
}