-- Create 'menus' storage bucket
select storage.create_bucket('menus', public => true);

-- Allow public read of files in 'menus'
create policy "Public can read menus"
  on storage.objects
  for select
  using ( bucket_id = 'menus' );

-- Allow anonymous uploads to 'menus' (demo-friendly)
create policy "Anon can upload to menus"
  on storage.objects
  for insert
  to public
  with check ( bucket_id = 'menus' );
