-- Webchat : schéma de base de données (Supabase / PostgreSQL)
-- À éventuellement exécuter dans Supabase : SQL Editor > New query > Run


-- 1. TABLES
create table public.channels (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique
                   check (char_length(trim(name)) between 1 and 50),
  created_at  timestamptz not null default now(),

  -- identifiant de la personne connectée. Le client n'envoie pas cette colonne : la base la remplit elle-même
  created_by  uuid not null default auth.uid()
                   references auth.users (id)
);

create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  
  -- Si un salon est supprimé, ses messages le sont aussi.
  channel_id  uuid not null references public.channels (id) on delete cascade,
  user_id     uuid not null default auth.uid()
                   references auth.users (id),
  username    text not null,
  content     text not null
                   check (char_length(trim(content)) between 1 and 2000),
  created_at  timestamptz not null default now()
);


-- 2. SÉCURITÉ AU NIVEAU DES LIGNES (RLS)

alter table public.channels enable row level security;
alter table public.messages enable row level security;

-- Lecture : toute personne authentifiée voit tous les salons et tous les messages.
create policy "channels: lecture pour les personnes authentifiées"
  on public.channels for select
  to authenticated
  using (true);

create policy "messages: lecture pour les personnes authentifiées"
  on public.messages for select
  to authenticated
  using (true);

-- Création : on peut créer un salon / un message seulement en son propre nom.
create policy "channels: création en son propre nom"
  on public.channels for insert
  to authenticated
  with check (created_by = (select auth.uid()));

create policy "messages: création en son propre nom"
  on public.messages for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- Aucune politique update / delete : ces opérations sont donc interdites au client.


-- 3. REALTIME (Ajoute les tables à la publication utilisée par les abonnements)
alter publication supabase_realtime add table public.channels;
alter publication supabase_realtime add table public.messages;