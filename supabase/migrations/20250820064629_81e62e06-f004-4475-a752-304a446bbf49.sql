-- Fix the security definer function search path issue
CREATE OR REPLACE FUNCTION public.get_public_student_info(target_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  skills text[],
  experience_level text,
  preferred_job_types text[],
  preferred_location text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    sp.user_id,
    sp.skills,
    sp.experience_level,
    sp.preferred_job_types,
    sp.preferred_location
  FROM public.student_profiles sp
  WHERE sp.user_id = target_user_id;
$$;