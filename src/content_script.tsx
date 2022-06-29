import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const Sample = () => {
  return <span style={{color: 'red', fontSize: '48px'}}>Sample</span>
}

const root = createRoot(
  document.body.appendChild(document.createElement('div'))
)
root.render(
  <StrictMode>
    <Sample />
  </StrictMode>
)