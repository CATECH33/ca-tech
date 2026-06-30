-- RLS policies for devis_items (missing — caused empty lignes in Manager)
CREATE POLICY "anon_all_devis_items" ON public.devis_items
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all_devis_items" ON public.devis_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
