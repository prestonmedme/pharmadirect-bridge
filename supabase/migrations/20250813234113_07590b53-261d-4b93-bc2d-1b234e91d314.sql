-- Fix the security definer view issue by dropping it
-- The view was causing security warnings, we'll use functions instead

DROP VIEW IF EXISTS public.appointments_safe_view;