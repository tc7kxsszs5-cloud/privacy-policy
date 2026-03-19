-- Марки
create table if not exists makes (
  id text primary key,
  name text not null,
  cyrillic_name text default '',
  country text default '',
  popular boolean default false,
  logo_url text default ''
);

alter table makes enable row level security;
create policy "Anyone can view makes" on makes for select using (true);

-- Модели
create table if not exists car_models (
  id text primary key,
  make_id text references makes(id) on delete cascade,
  name text not null,
  cyrillic_name text default '',
  class text default '',
  year_from int,
  year_to int
);

alter table car_models enable row level security;
create policy "Anyone can view car_models" on car_models for select using (true);

-- Поколения
create table if not exists car_generations (
  id text primary key,
  model_id text references car_models(id) on delete cascade,
  name text not null,
  year_start int,
  year_stop int,
  is_restyle boolean default false,
  glb_url text default '',
  thumbnail_url text default ''
);

alter table car_generations enable row level security;
create policy "Anyone can view car_generations" on car_generations for select using (true);
