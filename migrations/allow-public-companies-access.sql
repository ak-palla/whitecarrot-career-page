create policy "Any user can view companies"
on "public"."companies"
as permissive
for select
to public
using (true);
