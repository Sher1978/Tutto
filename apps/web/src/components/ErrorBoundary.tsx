import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { sendSuperadminErrorAlert } from '../lib/telegram'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in TuttoMinutto App:', error, errorInfo)
    sendSuperadminErrorAlert(
      error?.message || 'Uncaught ErrorBoundary Exception',
      errorInfo?.componentStack || error?.stack,
      'React ErrorBoundary'
    )
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070C15] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Произошла ошибка интерфейса</h2>
          <p className="text-xs text-gray-400 max-w-sm mb-6 leading-relaxed">
            {this.state.error?.message || 'Непредвиденное исключение при отображении экрана.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#00D4E8] text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,242,254,0.4)] active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Обновить приложение</span>
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
