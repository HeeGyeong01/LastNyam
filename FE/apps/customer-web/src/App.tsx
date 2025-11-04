import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="bg-bg-1">
        <h1 className="font-kr-h1 text-kr-h1 text-brand">브랜드 kr 폰트 + 브랜드 색상</h1>
        <h1 className="font-en-h1 text-en-h1 text-brand">브랜드 en 폰트 + 브랜드 색상</h1>
        <h1 className="text-h1 text-primary">h1 폰트 + primary 색상</h1>
        <h2 className="text-h2-b text-brand">h2-b 폰트 + brand 색상</h2>
        <p className="text-p1 text-tertiary">p1 폰트 + tertiary 색상</p>
      </div>
    </>
  )
}

export default App
