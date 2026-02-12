-- C7: Enforce admin/moderator actions via RLS policies
-- These policies ensure that even if client-side checks are bypassed,
-- the database will reject unauthorized mutations.

-- ============================================================
-- Helper function: check if a user is admin
-- ============================================================
DROP FUNCTION IF EXISTS public.is_admin(uuid);
CREATE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- Helper function: check if a user is moderator or admin
-- ============================================================
DROP FUNCTION IF EXISTS public.is_moderator(uuid);
CREATE FUNCTION public.is_moderator(check_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND (is_moderator = true OR is_admin = true)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- forum_threads: moderators can update (pin/lock) and delete any thread
-- ============================================================
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "threads_select" ON public.forum_threads;
CREATE POLICY "threads_select" ON public.forum_threads
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "threads_insert" ON public.forum_threads;
CREATE POLICY "threads_insert" ON public.forum_threads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "threads_update" ON public.forum_threads;
CREATE POLICY "threads_update" ON public.forum_threads
  FOR UPDATE USING (
    auth.uid() = user_id OR public.is_moderator(auth.uid())
  );

DROP POLICY IF EXISTS "threads_delete" ON public.forum_threads;
CREATE POLICY "threads_delete" ON public.forum_threads
  FOR DELETE USING (
    auth.uid() = user_id OR public.is_moderator(auth.uid())
  );

-- ============================================================
-- forum_posts: moderators can delete any post
-- ============================================================
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_select" ON public.forum_posts;
CREATE POLICY "posts_select" ON public.forum_posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "posts_insert" ON public.forum_posts;
CREATE POLICY "posts_insert" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_update" ON public.forum_posts;
CREATE POLICY "posts_update" ON public.forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_delete" ON public.forum_posts;
CREATE POLICY "posts_delete" ON public.forum_posts
  FOR DELETE USING (
    auth.uid() = user_id OR public.is_moderator(auth.uid())
  );

-- ============================================================
-- forum_categories: only admins can modify
-- ============================================================
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select" ON public.forum_categories;
CREATE POLICY "categories_select" ON public.forum_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "categories_insert" ON public.forum_categories;
CREATE POLICY "categories_insert" ON public.forum_categories
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "categories_update" ON public.forum_categories;
CREATE POLICY "categories_update" ON public.forum_categories
  FOR UPDATE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "categories_delete" ON public.forum_categories;
CREATE POLICY "categories_delete" ON public.forum_categories
  FOR DELETE USING (public.is_admin(auth.uid()));

-- ============================================================
-- user_roles: only admins can modify other users' roles
-- ============================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roles_select" ON public.user_roles;
CREATE POLICY "roles_select" ON public.user_roles
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "roles_update" ON public.user_roles;
CREATE POLICY "roles_update" ON public.user_roles
  FOR UPDATE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "roles_delete" ON public.user_roles;
CREATE POLICY "roles_delete" ON public.user_roles
  FOR DELETE USING (public.is_admin(auth.uid()));
