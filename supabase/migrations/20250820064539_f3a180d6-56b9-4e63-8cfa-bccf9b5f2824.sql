-- Fix security vulnerability: Restrict access to student_profiles table
-- Remove the overly permissive policy that allows all users to view all student profiles
DROP POLICY IF EXISTS "Students can view all student profiles" ON public.student_profiles;

-- Create more restrictive policies
-- 1. Students can view their own profiles
CREATE POLICY "Students can view their own profile"
ON public.student_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Companies can view student profiles for recruitment purposes
CREATE POLICY "Companies can view student profiles for recruitment"
ON public.student_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'company'
  )
);

-- 3. Create a function to get public student info (non-sensitive fields only)
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

-- Grant execute permission to authenticated users for the public info function
GRANT EXECUTE ON FUNCTION public.get_public_student_info(uuid) TO authenticated;