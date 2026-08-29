import { createClient } from '@supabase/supabase-js'

const GIST_FILENAME = 'life-dashboard.json'

export function isSyncConfigured(settings) {
  if (!settings?.provider) return false
  if (settings.provider === 'supabase') {
    return settings.supabaseUrl && settings.supabaseAnonKey && settings.syncId
  }
  if (settings.provider === 'gist') {
    return settings.gistToken && settings.gistId
  }
  return false
}

function supabaseClient(settings) {
  return createClient(settings.supabaseUrl.trim(), settings.supabaseAnonKey.trim())
}

export async function pullFromCloud(settings) {
  if (!isSyncConfigured(settings)) return null
  if (settings.provider === 'supabase') {
    const sb = supabaseClient(settings)
    const { data, error } = await sb
      .from('dashboard_sync')
      .select('payload, updated_at')
      .eq('sync_id', settings.syncId.trim())
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return null
    return { payload: data.payload, updated_at: data.updated_at }
  }

  const res = await fetch(`https://api.github.com/gists/${settings.gistId.trim()}`, {
    headers: {
      Authorization: `Bearer ${settings.gistToken.trim()}`,
      Accept: 'application/vnd.github+json',
    },
  })
  if (!res.ok) throw new Error(`Gist 조회 실패 (${res.status})`)
  const gist = await res.json()
  const file = gist.files?.[GIST_FILENAME]
  if (!file?.content) return null
  return {
    payload: JSON.parse(file.content),
    updated_at: gist.updated_at,
  }
}

export async function pushToCloud(settings, payload) {
  if (!isSyncConfigured(settings)) return null
  const updated_at = new Date().toISOString()

  if (settings.provider === 'supabase') {
    const sb = supabaseClient(settings)
    const { error } = await sb.from('dashboard_sync').upsert({
      sync_id: settings.syncId.trim(),
      payload,
      updated_at,
    })
    if (error) throw new Error(error.message)
    return updated_at
  }

  const body = {
    files: {
      [GIST_FILENAME]: { content: JSON.stringify(payload, null, 2) },
    },
  }
  const res = await fetch(`https://api.github.com/gists/${settings.gistId.trim()}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${settings.gistToken.trim()}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Gist 저장 실패 (${res.status})`)
  const gist = await res.json()
  return gist.updated_at
}

/** Supabase Realtime — 다른 기기 변경을 즉시 반영 */
export function subscribeSupabaseSync(settings, onRowChange) {
  if (settings?.provider !== 'supabase' || !isSyncConfigured(settings)) return null

  const sb = supabaseClient(settings)
  const syncId = settings.syncId.trim()

  const channel = sb
    .channel(`dashboard-sync-${syncId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'dashboard_sync',
        filter: `sync_id=eq.${syncId}`,
      },
      (payload) => onRowChange(payload.new),
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'dashboard_sync',
        filter: `sync_id=eq.${syncId}`,
      },
      (payload) => onRowChange(payload.new),
    )
    .subscribe()

  return () => {
    sb.removeChannel(channel)
  }
}

export async function createGist(token, syncId) {
  const payload = { syncId, note: 'Life dashboard sync file' }
  const res = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: 'Life & Fitness Dashboard Sync',
      public: false,
      files: {
        [GIST_FILENAME]: { content: JSON.stringify(payload, null, 2) },
      },
    }),
  })
  if (!res.ok) throw new Error(`Gist 생성 실패 (${res.status})`)
  const gist = await res.json()
  return gist.id
}

export const SUPABASE_SQL = `-- Supabase SQL Editor에서 실행하세요
create table if not exists dashboard_sync (
  sync_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table dashboard_sync enable row level security;

create policy "dashboard_sync_anon_all"
  on dashboard_sync for all
  to anon
  using (true)
  with check (true);

-- Realtime 자동 동기화용 (SQL Editor에서 실행 후, Table Editor에서도 Realtime ON 확인)
alter table dashboard_sync replica identity full;
alter publication supabase_realtime add table dashboard_sync;
`
