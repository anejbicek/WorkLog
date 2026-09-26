-- Razširitev CNC knjižnice: dodatne vrste orodij in poti do vizualnih sredstev.

alter table public.cnc_tool_types
  add column if not exists image_path text,
  add column if not exists geometry_image_path text;

update public.cnc_tool_types
set
  image_path = case code
    when 'face_mill' then '/cnc-tools/thumbnails/face-mill.jpg'
    when 'end_mill_flat' then '/cnc-tools/thumbnails/end-mill-flat.jpg'
    when 'ball_end_mill' then '/cnc-tools/thumbnails/ball-end-mill.jpg'
    when 'bull_nose_end_mill' then '/cnc-tools/thumbnails/bull-nose.jpg'
    when 't_slot_cutter' then '/cnc-tools/thumbnails/t-slot.jpg'
    when 'dovetail_cutter' then '/cnc-tools/thumbnails/dovetail.jpg'
    when 'drill' then '/cnc-tools/thumbnails/twist-drill.jpg'
    when 'gun_drill' then '/cnc-tools/thumbnails/gun-drill.jpg'
    when 'chamfer_mill' then '/cnc-tools/thumbnails/countersink.jpg'
    when 'slot_mill' then '/cnc-tools/thumbnails/t-slot.jpg'
    when 'tapered_end_mill' then '/cnc-tools/thumbnails/bull-nose.jpg'
    when 'angular_mill' then '/cnc-tools/thumbnails/dovetail.jpg'
    when 'custom_mill' then '/cnc-tools/thumbnails/end-mill-flat.jpg'
    else image_path
  end,
  geometry_image_path = case code
    when 'face_mill' then '/cnc-tools/geometry/face-mill.jpg'
    when 'end_mill_flat' then '/cnc-tools/geometry/end-mill-flat.jpg'
    when 'drill' then '/cnc-tools/geometry/twist-drill.jpg'
    when 'gun_drill' then '/cnc-tools/geometry/gun-drill.jpg'
    else geometry_image_path
  end;

insert into public.cnc_tool_types (
  code,
  name,
  description,
  image_path,
  geometry_image_path
)
values
  ('lollipop', 'Lollipop rezkar', 'Rezkar s kroglasto ali segmentno rezalno glavo.', '/cnc-tools/thumbnails/lollipop.jpg', '/cnc-tools/thumbnails/lollipop.jpg'),
  ('thread_mill', 'Navojni rezkar', 'Rezkalo za izdelavo notranjih in zunanjih navojev.', '/cnc-tools/thumbnails/thread-mill.jpg', '/cnc-tools/thumbnails/thread-mill.jpg'),
  ('center_drill', 'Centrirni sveder', 'Kratko orodje za izdelavo centrirne luknje.', '/cnc-tools/thumbnails/center-drill.jpg', '/cnc-tools/thumbnails/center-drill.jpg'),
  ('step_drill', 'Stopničasti sveder', 'Večpremerno stopničasto vrtalno orodje.', '/cnc-tools/thumbnails/step-drill.jpg', '/cnc-tools/thumbnails/step-drill.jpg'),
  ('reamer', 'Povrtalo', 'Večrezno orodje za fino obdelavo izvrtine.', '/cnc-tools/thumbnails/reamer.jpg', '/cnc-tools/thumbnails/reamer.jpg'),
  ('countersink', 'Vgrezilo', 'Orodje za izdelavo stožčastih vgrezov.', '/cnc-tools/thumbnails/countersink.jpg', '/cnc-tools/thumbnails/countersink.jpg')
on conflict (code) do nothing;

insert into public.cnc_operations (
  code,
  name,
  description
)
values
  ('helical_pocket', 'Žep – helikalno', 'Helikalno potapljanje v žep z enakomernim korakom po Z.'),
  ('drilling', 'Vrtanje', 'Standardno vrtanje skozi material.'),
  ('deep_drilling', 'Globoko vrtanje', 'Globoko vrtanje z notranjim hlajenjem.'),
  ('face_milling', 'Čelno rezkanje', 'Obdelava večjih ravnih površin s čelno glavo.'),
  ('side_milling', 'Bočno rezkanje', 'Bočna obdelava stene z rezkarjem.'),
  ('thread_milling', 'Rezkanje navoja', 'Izdelava navoja z navojnim rezkarjem.')
on conflict (code) do nothing;
