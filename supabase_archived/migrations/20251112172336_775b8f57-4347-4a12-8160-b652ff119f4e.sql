-- Criar tabela para permissões granulares por módulo
create table if not exists public.user_module_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  module_catalog_id integer references public.module_catalog(id) on delete cascade not null,
  can_view boolean not null default false,
  can_edit boolean not null default false,
  can_delete boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique(user_id, module_catalog_id)
);

-- Habilitar RLS
alter table public.user_module_permissions enable row level security;

-- Políticas RLS
create policy "Admins can manage all module permissions"
on public.user_module_permissions
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() 
      and p.clinic_id = (
        select clinic_id from public.profiles where id = user_module_permissions.user_id
      )
  ) and has_role(auth.uid(), 'ADMIN')
);

create policy "Users can view their own module permissions"
on public.user_module_permissions
for select
to authenticated
using (user_id = auth.uid());

-- Trigger para updated_at
create trigger update_user_module_permissions_updated_at
  before update on public.user_module_permissions
  for each row
  execute function public.update_updated_at_column();

-- Criar tabela para agendamentos de exportação de relatórios
create table if not exists public.scheduled_exports (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  dashboard_name text not null,
  export_format text not null check (export_format in ('pdf', 'excel', 'csv')),
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  email text not null,
  is_active boolean not null default true,
  last_sent_at timestamp with time zone,
  next_send_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Habilitar RLS
alter table public.scheduled_exports enable row level security;

-- Políticas RLS
create policy "Users can manage scheduled exports in their clinic"
on public.scheduled_exports
for all
to authenticated
using (
  clinic_id = get_user_clinic_id(auth.uid()) 
  and has_role(auth.uid(), 'ADMIN')
);

-- Trigger para updated_at
create trigger update_scheduled_exports_updated_at
  before update on public.scheduled_exports
  for each row
  execute function public.update_updated_at_column();

-- Adicionar índices para performance
create index if not exists idx_user_module_permissions_user_id 
  on public.user_module_permissions(user_id);

create index if not exists idx_scheduled_exports_clinic_id 
  on public.scheduled_exports(clinic_id);

create index if not exists idx_scheduled_exports_next_send_at 
  on public.scheduled_exports(next_send_at) 
  where is_active = true;