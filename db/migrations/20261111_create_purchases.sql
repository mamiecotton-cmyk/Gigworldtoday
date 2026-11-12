-- Purchases for paid digital products (e.g. The No-Car Gig Blueprint).
-- Rows are written by the Stripe webhook using the service role key.

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  product_slug text not null,
  stripe_session_id text not null unique,
  amount_cents integer,
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_product_idx
  on public.purchases (user_id, product_slug);
create index if not exists purchases_email_product_idx
  on public.purchases (lower(email), product_slug);

alter table public.purchases enable row level security;

-- Signed-in users can see their own purchases. No insert/update/delete
-- policies: only the service role (webhook) writes.
drop policy if exists "Users read own purchases" on public.purchases;
create policy "Users read own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

-- Private bucket for the paid files. Upload "no-car-gig-blueprint.pdf" here.
insert into storage.buckets (id, name, public)
values ('members-files', 'members-files', false)
on conflict (id) do nothing;
