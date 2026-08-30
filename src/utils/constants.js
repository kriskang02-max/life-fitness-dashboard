export const STORAGE_KEYS = {
  daily_logs: 'daily_logs',
  weekly_metrics: 'weekly_metrics',
  routine_presets: 'routine_presets',
  daily_items_config: 'daily_items_config',
  goal_settings: 'goal_settings',
  thought_archive: 'thought_archive',
  focus_compass_data: 'focus_compass_data',
  sync_settings: 'sync_settings',
  sync_meta: 'sync_meta',
}

export const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const DAY_LABELS = {
  Sun: '일',
  Mon: '월',
  Tue: '화',
  Wed: '수',
  Thu: '목',
  Fri: '금',
  Sat: '토',
}

export const ARCHIVE_TAGS = ['독서', '인사이트', '마인드셋']

export const DAILY_CHECK_KEYS = ['workout', 'diet', 'dopamine', 'read']

export const DAILY_CHECK_LABELS = {
  workout: '관절 보호 운동',
  diet: '클린 디너 & 야식 차단',
  dopamine: '스크린 & 도파민 리밋',
  read: '데일리 인지 충전',
}

export const DEFAULT_DAILY_ITEMS_CONFIG = {
  workout: {
    emoji: '🔥',
    label: '에슬레틱 무브먼트 (Athletic Flow)',
    tooltip: '체중 부하는 줄이고 출력은 극대화. 점프 대신 스텝, 심박 155 이하 스마트 걷뛰',
    linkWeekday: true,
  },
  diet: {
    emoji: '🥗',
    label: '클린 디너 & 야식 차단',
    tooltip: '취침 3시간 전 주방 마감 (물 제외 금식), 액상과당/배달음식/야식 절대 금지',
    linkWeekday: false,
  },
  dopamine: {
    emoji: '📵',
    label: '스크린 & 도파민 리밋',
    tooltip: '기상 직후 & 취침 전 각 30~60분 스마트폰 차단, iOS 스크린타임 설정 시간 준수',
    linkWeekday: false,
  },
  read: {
    emoji: '📖',
    label: '데일리 인지 충전 (20분)',
    tooltip: '출퇴근길/틈새 독서 15~20분 또는 코딩/기술 탐구 등 능동적 지적 자극 채우기',
    linkWeekday: false,
  },
}

export const DEFAULT_GOAL_SETTINGS = {
  title: '🏃 10km 마라톤 완주',
  targetDate: '2026-11-03',
  linkedCheckKey: 'workout',
}

export const DEFAULT_FOCUS_COMPASS_DATA = {
  target: {
    title: '9월 체지방 34% 진입 & 걷뛰 35분 완주',
    eventTitle: '10km 마라톤',
    targetDate: '2026-11-04',
  },
  mindset: {
    title: '원하는 기분을 기다리지 말고, 정해진 행동을 완수하라',
    sub: '— 행동이 감정을 만든다',
  },
  insight: {
    title: '체지방 36%에서는 무리한 질주보다 Zone 2 걷뛰가 지방 연소와 관절에 압도적으로 유리하다',
    sub: '📌 08.30 메모에서 고정됨',
    pinnedArchiveId: null,
  },
}

/** 사이트에 고정된 Supabase 연결 정보 (클라이언트 publishable key) */
export const BUILTIN_SUPABASE = {
  provider: 'supabase',
  supabaseUrl: 'https://xexqckliekutptuksyfy.supabase.co',
  supabaseAnonKey: 'sb_publishable_PiLnDuZl7Rwfi0Wmt9GkMg_8_lw_5X1',
  syncId: 'life-fitness-dashboard',
}

export const DEFAULT_SYNC_SETTINGS = {
  ...BUILTIN_SUPABASE,
  gistToken: '',
  gistId: '',
}

/** @deprecated use daily_items_config */
export const DAILY_ITEMS = DAILY_CHECK_KEYS.map((key) => ({
  key,
  emoji: DEFAULT_DAILY_ITEMS_CONFIG[key].emoji,
  label: DEFAULT_DAILY_ITEMS_CONFIG[key].label,
  tooltip: DEFAULT_DAILY_ITEMS_CONFIG[key].tooltip,
  dynamicLabel: DEFAULT_DAILY_ITEMS_CONFIG[key].linkWeekday,
}))

export function buildDailyItems(dailyItemsConfig, routineWeekdays, dayKey) {
  return DAILY_CHECK_KEYS.map((key) => {
    const cfg = dailyItemsConfig[key] ?? DEFAULT_DAILY_ITEMS_CONFIG[key]
    let label = cfg.label
    if (cfg.linkWeekday && routineWeekdays?.[dayKey]) {
      label = `${cfg.label} · ${routineWeekdays[dayKey]}`
    }
    return {
      key,
      emoji: cfg.emoji,
      label,
      tooltip: cfg.tooltip,
      linkWeekday: cfg.linkWeekday,
    }
  })
}
