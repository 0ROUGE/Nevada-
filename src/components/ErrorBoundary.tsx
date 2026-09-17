import { Component } from 'react'
import type { ReactNode } from 'react'

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Essayz crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            textAlign: 'center',
            fontFamily: 'sans-serif',
            background: '#fff',
            color: '#0a0a0a',
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            Something went wrong loading Essayz
          </h1>
          <p style={{ color: '#666', maxWidth: 480, marginBottom: 12 }}>
            {this.state.error.message}
          </p>
          <p style={{ color: '#999', fontSize: 13, maxWidth: 480 }}>
            This usually means required configuration (Supabase URL/key) is missing from this
            deployment's environment variables.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
