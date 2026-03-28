DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.navettes CASCADE;
CREATE TABLE public.navettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jour_date DATE NOT NULL,
  nom TEXT NOT NULL,
  horaire TEXT NOT NULL,
  places_max INTEGER NOT NULL DEFAULT 19,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  navette_id UUID NOT NULL REFERENCES public.navettes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(navette_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_navettes_jour ON public.navettes(jour_date);
CREATE INDEX IF NOT EXISTS idx_res_navette ON public.reservations(navette_id);
CREATE INDEX IF NOT EXISTS idx_res_user ON public.reservations(user_id);
ALTER TABLE public.navettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Voir navettes" ON public.navettes;
DROP POLICY IF EXISTS "Gérer navettes" ON public.navettes;
DROP POLICY IF EXISTS "Voir reservations" ON public.reservations;
DROP POLICY IF EXISTS "Créer reservation" ON public.reservations;
DROP POLICY IF EXISTS "Supprimer reservation" ON public.reservations;
CREATE POLICY "Voir navettes" ON public.navettes FOR SELECT USING (true);
CREATE POLICY "Gérer navettes" ON public.navettes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Voir reservations" ON public.reservations FOR SELECT USING (true);
CREATE POLICY "Créer reservation" ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Supprimer reservation" ON public.reservations FOR DELETE USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.navettes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
SELECT 'OK !' AS resultat;
