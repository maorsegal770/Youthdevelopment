-- =====================================================================
-- Birth-prep site – schema, row level security and triggers
-- =====================================================================

-- ---------- profiles (one row per auth user) --------------------------
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  email               text,
  display_name        text,
  phone               text,
  due_date            date,
  role                text not null default 'user' check (role in ('user', 'admin')),
  subscription_status text not null default 'pending_payment'
                      check (subscription_status in ('pending_payment', 'active', 'canceled')),
  stripe_customer_id  text,
  paid_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Helper checks. SECURITY DEFINER so they can read profiles from inside
-- RLS policies without recursing into the profiles policies.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_active_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and subscription_status = 'active');
$$;

-- Create a profile automatically on sign-up. Only harmless fields are taken
-- from the user-supplied metadata; role and subscription keep their defaults.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, email, display_name, phone, due_date)
  values (
    new.id,
    new.email,
    left(nullif(trim(meta ->> 'display_name'), ''), 100),
    left(nullif(trim(meta ->> 'phone'), ''), 20),
    case when (meta ->> 'due_date') ~ '^\d{4}-\d{2}-\d{2}$'
         then (meta ->> 'due_date')::date end
  );
  return new;
exception when others then
  -- Never block sign-up because of a bad optional field.
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;

create policy "profiles: read own or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Column-level privileges: a user may only edit her personal details.
-- role / subscription_status / paid_at are changed only by the service role
-- (edge functions after a verified payment) or in the Supabase dashboard.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (display_name, phone, due_date) on public.profiles to authenticated;

-- ---------- landing_sections (editable landing page) -----------------
create table public.landing_sections (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('hero', 'about', 'service', 'topic', 'faq', 'text')),
  title      text not null,
  body       text,
  icon       text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger landing_sections_touch before update on public.landing_sections
  for each row execute function public.touch_updated_at();

alter table public.landing_sections enable row level security;
create policy "landing: public read" on public.landing_sections
  for select to anon, authenticated using (true);
create policy "landing: admin insert" on public.landing_sections
  for insert to authenticated with check (public.is_admin());
create policy "landing: admin update" on public.landing_sections
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "landing: admin delete" on public.landing_sections
  for delete to authenticated using (public.is_admin());

-- ---------- course_lessons (members only) ----------------------------
create table public.course_lessons (
  id               uuid primary key default gen_random_uuid(),
  module           text,
  title            text not null,
  summary          text,
  body             text,
  video_url        text,
  attachment_url   text,
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  sort_order       integer not null default 0,
  published        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger course_lessons_touch before update on public.course_lessons
  for each row execute function public.touch_updated_at();

alter table public.course_lessons enable row level security;
create policy "lessons: members read published, admin reads all" on public.course_lessons
  for select to authenticated
  using (public.is_admin() or (published and public.is_active_member()));
create policy "lessons: admin insert" on public.course_lessons
  for insert to authenticated with check (public.is_admin());
create policy "lessons: admin update" on public.course_lessons
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "lessons: admin delete" on public.course_lessons
  for delete to authenticated using (public.is_admin());

-- ---------- leads (contact form) -------------------------------------
-- Inserted only by the submit-lead edge function (service role).
create table public.leads (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  phone      text not null,
  email      text,
  interest   text not null check (interest in ('course', 'doula', 'consultation', 'other')),
  due_date   date,
  message    text,
  status     text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  email_sent boolean,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;
create policy "leads: admin read" on public.leads
  for select to authenticated using (public.is_admin());
create policy "leads: admin update" on public.leads
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "leads: admin delete" on public.leads
  for delete to authenticated using (public.is_admin());
revoke insert on public.leads from anon, authenticated;
