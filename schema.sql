create table if not exists schedules (
  id                    bigint generated always as identity primary key,
  performance_type      text        not null default 'musical', -- 'musical' | 'concert'(추후)
  musical_name          text        not null,
  open_time             timestamptz not null,
  sites                 text[]      not null default '{}',
  no_waiting_service    text[]      not null default '{}',
  is_active             boolean     not null default true,
  alerts_generated      boolean     not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table if not exists schedule_alerts (
  id            bigint generated always as identity primary key,
  schedule_id   bigint      not null references schedules(id) on delete cascade,
  alert_type    text        not null,
  site          text        not null,
  fire_at       timestamptz not null,
  display_time  timestamptz not null,
  expires_at    timestamptz not null, -- 등록 시점에 계산: 이 시각 넘으면 뒤늦은 알림이라 보내지 않고 건너뜀
  sent_at       timestamptz, -- 실제로 트윗을 보낸 시각
  created_at    timestamptz not null default now()
);

create index if not exists schedule_alerts_schedule_id_idx on schedule_alerts (schedule_id);
create index if not exists schedule_alerts_pending_idx on schedule_alerts (fire_at) where sent_at is null;
