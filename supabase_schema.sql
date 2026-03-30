-- ============================================================
-- Restaurant Finder - Supabase Database Schema
-- 
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. CREATE STORAGE BUCKETS:
--    - 'restaurants' (Public: ON)
--    - 'avatars' (Public: ON)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text,
  email       text,
  avatar_url  text,
  bio         text,
  role        text default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- RESTAURANTS TABLE
-- ============================================================
create table if not exists public.restaurants (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  description text,
  image_url   text,
  location    text,
  address     text,
  category    text,
  cuisine     text,
  price_range text default '$$' check (price_range in ('$', '$$', '$$$', '$$$$')),
  phone       text,
  website     text,
  hours       text,
  avg_rating  numeric(3,2) default 0,
  total_reviews integer default 0,
  featured    boolean default false,
  created_by  uuid references public.profiles(id),
  featured_by uuid references public.profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
create table if not exists public.reviews (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  rating        integer not null check (rating >= 1 and rating <= 5),
  comment       text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(user_id, restaurant_id)
);

-- Update restaurant avg_rating when review is added/changed
create or replace function public.update_restaurant_rating()
returns trigger as $$
begin
  update public.restaurants
  set 
    avg_rating = (
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where restaurant_id = coalesce(new.restaurant_id, old.restaurant_id)
    ),
    total_reviews = (
      select count(*)
      from public.reviews
      where restaurant_id = coalesce(new.restaurant_id, old.restaurant_id)
    )
  where id = coalesce(new.restaurant_id, old.restaurant_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

create or replace trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.update_restaurant_rating();

-- ============================================================
-- FAVORITES TABLE
-- ============================================================
-- RESERVATIONS TABLE
-- ============================================================
create table if not exists public.reservations (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  reservation_date date not null,
  reservation_time time not null,
  guests        integer not null check (guests >= 1),
  status        text default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- FAVORITES TABLE
-- ============================================================
create table if not exists public.favorites (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  created_at    timestamptz default now(),
  unique(user_id, restaurant_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Profiles: users can read all, edit only own
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can delete any profile" on public.profiles for delete 
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Restaurants: anyone can read, only admins can CUD
alter table public.restaurants enable row level security;
create policy "Restaurants are viewable by everyone" on public.restaurants for select using (true);
create policy "Admins can insert restaurants" on public.restaurants for insert 
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update restaurants" on public.restaurants for update 
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete restaurants" on public.restaurants for delete 
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Reviews: anyone can read, authenticated users can CUD own reviews
alter table public.reviews enable row level security;
create policy "Reviews are viewable by everyone" on public.reviews for select using (true);
create policy "Authenticated users can insert reviews" on public.reviews for insert 
  with check (auth.uid() = user_id);
create policy "Users can update own reviews" on public.reviews for update 
  using (auth.uid() = user_id);
create policy "Users can delete own reviews" on public.reviews for delete 
  using (auth.uid() = user_id);

-- Favorites: users can only see/modify own favorites
alter table public.favorites enable row level security;
create policy "Users can view own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users can add favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can remove favorites" on public.favorites for delete using (auth.uid() = user_id);

-- ============================================================
-- SECURE ADMIN RPC FUNCTIONS
-- ============================================================

-- Function to fully delete a user from the Auth system (admin only)
-- Call this via supabase.rpc('delete_user_by_admin', { user_id: '...' })
create or replace function public.delete_user_by_admin(user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Check if the caller is an admin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Unauthorized: Only admins can delete users.';
  end if;

  -- Delete from auth.users (this will cascade to public.profiles)
  delete from auth.users where id = user_id;
end;
$$;

-- Grant access to the function
grant execute on function public.delete_user_by_admin(uuid) to authenticated;
grant execute on function public.delete_user_by_admin(uuid) to service_role;

-- ============================================================
-- STORAGE BUCKET POLICIES (Admins only for CUD)
-- ============================================================
-- Note: Buckets 'restaurants' and 'avatars' must be created in the Supabase Dashboard first.
-- These policies allow admins to manage files in those buckets.

create policy "Public Access to Restaurants"
on storage.objects for select
using ( bucket_id = 'restaurants' );

create policy "Admins can upload to Restaurants"
on storage.objects for insert
with check (
  bucket_id = 'restaurants' 
  AND (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
);

create policy "Admins can update Restaurants"
on storage.objects for update
using (
  bucket_id = 'restaurants' 
  AND (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
);

create policy "Admins can delete Restaurants"
on storage.objects for delete
using (
  bucket_id = 'restaurants' 
  AND (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
);

-- ============================================================
-- SAMPLE DATA (Optional - run after schema)
-- ============================================================
insert into public.restaurants (name, description, image_url, location, address, phone, hours, category, cuisine, price_range, featured) values
('The Golden Fork', 'Experience an exquisite French fine dining atmosphere with a focus on seasonal ingredients and master craftsmanship.', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', 'Downtown, New York', '123 Fine St, New York, NY 10001', '+1 (212) 555-0101', 'Mon-Sun: 5pm - 11pm', 'Fine Dining', 'French', '$$$', true),
('Organic Coffee', 'Freshly roasted organic beans served in a cozy, modern environment. The perfect spot for breakfast or a mid-day break.', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', 'Banadir, Somalia', 'Hodan District, Mogadishu', '+252 61 9011656', 'Daily: 7am - 10pm', 'Cafe', 'International', '$$', true),
('The Burger Lab', 'Gourmet burgers crafted with premium wagyu beef, artisanal buns, and our signature secret sauces.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 'Brooklyn, New York', '456 Grill Ave, Brooklyn, NY 11201', '+1 (718) 555-0202', 'Daily: 11am - 12am', 'Fast Food', 'American', '$', true),
('Sakura Sushi', 'Traditional Japanese sushi and sashimi prepared by master chefs using the freshest fish flown in daily.', 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800', 'Upper East Side, New York', '789 Zen Way, New York, NY 10021', '+1 (212) 555-0303', 'Tue-Sun: 12pm - 10pm', 'Restaurant', 'Japanese', '$$$', true),
('La Piazza', 'A rustic Italian trattoria bringing the authentic flavors of Tuscany to the heart of the city with handmade pasta.', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', 'Little Italy, New York', '101 Pasta Blvd, New York, NY 10013', '+1 (212) 555-0404', 'Daily: 11am - 11pm', 'Restaurant', 'Italian', '$$', true),
('Ocean Blue', 'Contemporary seafood restaurant featuring a raw bar and coastal-inspired dishes in a stunning nautical setting.', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', 'Harbor District, New York', '202 Coast Rd, New York, NY 10004', '+1 (212) 555-0505', 'Wed-Sun: 4pm - 10pm', 'Seafood', 'Seafood', '$$$', false),
('Taco Loco', 'Vibrant Mexican street food atmosphere serving authentic tacos, fresh guacamole, and handcrafted margaritas.', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800', 'East Village, New York', '303 Spice St, New York, NY 10009', '+1 (212) 555-0606', 'Daily: 12pm - 11pm', 'Casual', 'Mexican', '$', false),
('Spice Garden', 'A journey through Indian flavors featuring traditional curries, tandoori specialties, and aromatic biryanis.', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', 'Midtown, New York', '505 Curry Ln, New York, NY 10018', '+1 (212) 555-0707', 'Daily: 11:30am - 10pm', 'Restaurant', 'Indian', '$$', true);
