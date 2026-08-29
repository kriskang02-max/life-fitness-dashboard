import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { DAY_KEYS, DAY_LABELS, DAILY_CHECK_KEYS, DAILY_CHECK_LABELS } from '../../utils/constants'
import { SUPABASE_SQL, isSyncConfigured, pullFromCloud, pushToCloud, createGist } from '../../utils/cloudSync'
import { loadAllData } from '../../utils/storage'

export default function SyncSettingsModal({
  open,
  onClose,
  syncSettings,
  onSave,
  onImport,
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
    setStatus('테스트 중...')
    try {
      onSave(local)
      if (!isSyncConfigured(local)) {
        setError('설정을 먼저 완료해주세요.')
        return
      }
      await pushToCloud(local, loadAllData())
      const remote = await pullFromCloud(local)
      setStatus(remote ? '연결 성공! 클라우드 동기화가 활성화되었습니다.' : '연결됨 (원격 데이터 없음)')
    } catch (e) {
      setError(e.message)
      setStatus('')
    }
  }

  const handleCreateGist = async () => {
    if (!local.gistToken) {
      setError('GitHub Token을 입력하세요.')
      return
    }
    try {
      const id = await createGist(local.gistToken)
      setLocal((p) => ({ ...p, gistId: id, provider: 'gist' }))
      setStatus(`Gist 생성 완료: ${id}`)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="☁️ 클라우드 동기화 설정" wide>
      <div className="space-y-5">
        <p className="text-sm text-zinc-400">
          iPad · iPhone · PC에서 같은 데이터를 쓰려면 Supabase 또는 GitHub Gist로 동기화하세요.
          모든 기기에 <strong className="text-zinc-300">동일한 Sync ID</strong>를 입력해야 합니다.
        </p>

        <label className="block">
          <span className="text-xs text-zinc-400 mb-1 block">동기화 방식</span>
          <select
            value={local.provider ?? ''}
            onChange={(e) => setLocal((p) => ({ ...p, provider: e.target.value || null }))}
            className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
          >
            <option value="">사용 안 함 (로컬만)</option>
            <option value="supabase">Supabase (추천)</option>
            <option value="gist">GitHub Gist</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-zinc-400 mb-1 block">Sync ID (기기 공통 비밀 키)</span>
          <input
            type="text"
            value={local.syncId}
            onChange={(e) => setLocal((p) => ({ ...p, syncId: e.target.value }))}
            placeholder="my-unique-sync-key-2026"
            className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
          />
        </label>

        {local.provider === 'supabase' && (
          <div className="space-y-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
            <p className="text-xs text-zinc-500">Supabase 프로젝트 URL · Anon Key (Settings → API)</p>
            <input
              type="url"
              value={local.supabaseUrl}
              onChange={(e) => setLocal((p) => ({ ...p, supabaseUrl: e.target.value }))}
              placeholder="https://xxxx.supabase.co"
              className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
            />
            <input
              type="text"
              value={local.supabaseAnonKey}
              onChange={(e) => setLocal((p) => ({ ...p, supabaseAnonKey: e.target.value }))}
              placeholder="anon public key"
              className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
            />
            <details className="text-xs text-zinc-500">
              <summary className="cursor-pointer text-cyan-400">Supabase 테이블 SQL</summary>
              <pre className="mt-2 p-2 bg-zinc-950 rounded text-[10px] overflow-x-auto whitespace-pre-wrap">{SUPABASE_SQL}</pre>
            </details>
          </div>
        )}

        {local.provider === 'gist' && (
          <div className="space-y-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
            <input
              type="password"
              value={local.gistToken}
              onChange={(e) => setLocal((p) => ({ ...p, gistToken: e.target.value }))}
              placeholder="GitHub Personal Access Token (gist 권한)"
              className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={local.gistId}
                onChange={(e) => setLocal((p) => ({ ...p, gistId: e.target.value }))}
                placeholder="Gist ID"
                className="flex-1 px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
              />
              <button
                type="button"
                onClick={handleCreateGist}
                className="px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700"
              >
                Gist 생성
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              onSave(local)
              setStatus('설정 저장됨')
            }}
            className="px-4 py-2 text-xs font-medium bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700"
          >
            설정 저장
          </button>
          <button
            type="button"
            onClick={testSync}
            className="px-4 py-2 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg"
          >
            연결 테스트
          </button>
          <button
            type="button"
            onClick={async () => {
              onSave(local)
              await pullRemote(false)
            }}
            className="px-4 py-2 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"
          >
            클라우드에서 불러오기
          </button>
          <button
            type="button"
            onClick={async () => {
              onSave(local)
              await pushRemote()
            }}
            className="px-4 py-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
          >
            클라우드에 업로드
          </button>
        </div>

        {status && <p className="text-sm text-emerald-400">{status}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </Modal>
  )
}
