import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-zinc-100 bg-zinc-900">
          <div className="max-w-md text-center space-y-3">
            <p className="text-lg font-semibold text-red-400">화면을 불러오지 못했습니다</p>
            <p className="text-sm text-zinc-400">{this.state.error.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm bg-emerald-600 rounded-lg"
            >
              새로고침
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
