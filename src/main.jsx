import './instrument'
import React from 'react'
import * as Sentry from '@sentry/react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root'), {
  onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
    console.error(error, errorInfo.componentStack)
  }),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
