
-- Create enum for user types
CREATE TYPE public.user_type AS ENUM ('student', 'company');

-- Add user_type column to profiles table
ALTER TABLE public.profiles ADD COLUMN user_type public.user_type DEFAULT 'student';

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.profiles(user_id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  salary_range TEXT,
  location TEXT,
  job_type TEXT, -- 'internship', 'full-time', 'part-time'
  skills_required TEXT[], -- Array of skills
  experience_level TEXT, -- 'entry', 'mid', 'senior'
  application_deadline DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student profiles table for detailed student information
CREATE TABLE public.student_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id) NOT NULL UNIQUE,
  resume_url TEXT,
  skills TEXT[], -- Array of skills
  experience_level TEXT,
  preferred_job_types TEXT[], -- Array of preferred job types
  preferred_location TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  certificates TEXT[], -- Array of certificates
  education JSONB, -- Store education details as JSON
  work_experience JSONB, -- Store work experience as JSON
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company profiles table
CREATE TABLE public.company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id) NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  company_description TEXT,
  website_url TEXT,
  industry TEXT,
  company_size TEXT,
  headquarters TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) NOT NULL,
  student_id UUID REFERENCES public.profiles(user_id) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, student_id)
);

-- Create job swipes table (for Tinder-like functionality)
CREATE TABLE public.job_swipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) NOT NULL,
  student_id UUID REFERENCES public.profiles(user_id) NOT NULL,
  swipe_direction TEXT NOT NULL, -- 'left' (reject), 'right' (like)
  swiped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, student_id)
);

-- Enable RLS on all tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_swipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs table
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Companies can create their own jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = company_id);
CREATE POLICY "Companies can update their own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = company_id);
CREATE POLICY "Companies can delete their own jobs" ON public.jobs FOR DELETE USING (auth.uid() = company_id);

-- RLS Policies for student_profiles table
CREATE POLICY "Students can view all student profiles" ON public.student_profiles FOR SELECT USING (true);
CREATE POLICY "Students can create their own profile" ON public.student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students can update their own profile" ON public.student_profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for company_profiles table
CREATE POLICY "Company profiles are viewable by everyone" ON public.company_profiles FOR SELECT USING (true);
CREATE POLICY "Companies can create their own profile" ON public.company_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Companies can update their own profile" ON public.company_profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for job_applications table
CREATE POLICY "Students can view their own applications" ON public.job_applications FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Companies can view applications for their jobs" ON public.job_applications FOR SELECT USING (
  auth.uid() IN (SELECT company_id FROM public.jobs WHERE id = job_id)
);
CREATE POLICY "Students can create applications" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Companies can update application status" ON public.job_applications FOR UPDATE USING (
  auth.uid() IN (SELECT company_id FROM public.jobs WHERE id = job_id)
);

-- RLS Policies for job_swipes table
CREATE POLICY "Students can view their own swipes" ON public.job_swipes FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can create their own swipes" ON public.job_swipes FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_profiles_updated_at BEFORE UPDATE ON public.company_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get unswiped jobs for a student
CREATE OR REPLACE FUNCTION public.get_unswiped_jobs_for_student(student_user_id uuid)
RETURNS TABLE(
  job_id uuid,
  title text,
  description text,
  company_name text,
  location text,
  salary_range text,
  job_type text,
  skills_required text[],
  company_logo text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id as job_id,
    j.title,
    j.description,
    cp.company_name,
    j.location,
    j.salary_range,
    j.job_type,
    j.skills_required,
    cp.logo_url as company_logo
  FROM public.jobs j
  JOIN public.company_profiles cp ON j.company_id = cp.user_id
  WHERE j.is_active = true
    AND j.id NOT IN (
      SELECT job_id FROM public.job_swipes WHERE student_id = student_user_id
    )
    AND j.application_deadline > CURRENT_DATE
  ORDER BY j.created_at DESC;
END;
$$;
