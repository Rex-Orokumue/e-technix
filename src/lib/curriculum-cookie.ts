// Cookie that marks a visitor as having unlocked the full curriculum.
// Value = the curriculum_leads row UUID. Lives in its own module because Next.js
// route files may only export route handlers (GET/POST/…) and a few config keys.
export const UNLOCK_COOKIE = 'etx_curr_unlock';
