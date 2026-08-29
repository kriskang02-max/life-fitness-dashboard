import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { SUPABASE_SQL, isSyncConfigured } from '../../utils/cloudSync'

export default function SyncSettingsModal({
  open,
  onClose,
  syncSettings,
  onSave,
  pullRemote,
  pushRemote,
}) {
  const [local, setLocal] = useState(syncSettings)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setLocal({ ...syncSettings })
      setStatus('')
      setError('')
    }
  }, [open, syncSettings])

  const testSync = async () => {
    setError('')
    setStatus('연결 테스트 중...')
    try {
      if (!isSyncConfigured(local)) {
        setError('Supabase URL, API Key, Sync ID를 모두 입력해주세요.')
        setStatus('')
        return
      }
      await onSave(local)
      setStatus('연결 성공! 이후 수정은 자동 업로드되고, 다른 기기 변경도 자동 반영됩니다.')
    } catch (e) {
      setError(e.message)
      setStatus('')
    }
  }

  const handleSave = async () => {
    setError('')
    try {
      await onSave(local)
      if (isSyncConfigured(local)) {
        setStatus('설정 저장됨 · 자동 동기화 활성화')
      } else {
        setStatus('설정 저장됨 (로컬만 사용)')
      }
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="☁️ 클라우드 동기화 설정" wide>
      <div className="space-y-5">
        <p className="text-sm text-zinc-400">
          Supabase 연결이 성공하면 <strong className="text-zinc-300">별도 버튼 없이</strong> 동기화됩니다.
          체크박스·목표·아카이브 등 수정 내용은 약 1초 후 자동 업로드되고,
          다른 기기에서는 Realtime + 30초 폴링으로 변경을 자동 불러옵니다.
          모든 기기에 <strong className="text-zinc-300">동일한 Sync ID</strong>를 입력하세요.
        </p>

        <label className="block">
          <span className="text-xs text-zinc-400 mb-1 block">동기화 방식</span>
          <select
            value={local.provider ?? 'supabase'}
            disabled
            className="w-full px-3 py-2 text-base bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-400 cursor-not-allowed"
          >
            <option value="supabase">Supabase (자동 동기화)</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-zinc-400 mb-1 block">Sync ID (기기 공통 비밀 키)</span>
          <input
            type="text"
            value={local.syncId}
            onChange={(e) => setLocal((p) => ({ ...p, syncId: e.target.value }))}
            placeholder="my-unique-sync-key-2026"
            className="w-full px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
          />
        </label>

        {local.provider === 'supabase' && (
          <div className="space-y-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <p className="text-xs text-emerald-400">Supabase 연결 정보는 사이트에 고정되어 있습니다.</p>
            <input
              type="url"
              value={local.supabaseUrl}
              readOnly
              className="w-full px-3 py-2 text-base bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-400 cursor-not-allowed"
            />
            <input
              type="text"
              value={local.supabaseAnonKey}
              readOnly
              className="w-full px-3 py-2 text-base bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-400 cursor-not-allowed"
            />
            <details className="text-xs text-zinc-500">
              <summary className="cursor-pointer text-cyan-400">Supabase 테이블 + Realtime SQL</summary>
              <pre className="mt-2 p-2 bg-zinc-950 rounded text-[10px] overflow-x-auto whitespace-pre-wrap">{SUPABASE_SQL}</pre>
            </details>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-medium bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700"
          >
            설정 저장
          </button>
          <button
            type="button"
            onClick={testSync}
            className="px-4 py-2 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg"
          >
            연결 테스트 & 동기화 시작
          </button>
          <button
            type="button"
            onClick={() => pullRemote(false)}
            className="px-4 py-2 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"
          >
            지금 불러오기
          </button>
          <button
            type="button"
            onClick={() => pushRemote()}
            className="px-4 py-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
          >
            지금 업로드
          </button>
        </div>

        {status && <p className="text-sm text-emerald-400">{status}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </Modal>
  )
}
