-- Enable realtime for odontogram tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.pep_odontograma_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pep_tooth_surfaces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pep_odontograma_history;