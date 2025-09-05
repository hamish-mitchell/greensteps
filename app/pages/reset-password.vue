<script setup lang="ts">
// Supabase password recovery page
// User arrives here from the password reset email. Supabase may redirect with either:
// 1. A hash fragment (#access_token=...&refresh_token=...&type=recovery)
// 2. A query param (?code=...&type=recovery) that must be exchanged via exchangeCodeForSession
// We establish the session (if not already) and allow user to set a new password.

</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <!-- Left column (form) -->
    <div class="flex flex-col gap-4 p-6 md:p-10">
      <div class="flex justify-center gap-2 md:justify-start fixed">
        <a href="/" class="flex items-center gap-2 font-medium">
          <svg width="160" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill="#00DC33" />
          </svg>
        </a>
      </div>
      <div class="flex flex-1 h-full items-center justify-center">
        <div class="w-full max-w-sm">
          <Card class="mx-auto max-w-sm border-none shadow-none">
            <CardHeader>
              <CardTitle class="text-2xl">Set a new password</CardTitle>
              <CardDescription>
                Choose a strong password to finish resetting your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="success" class="space-y-4 text-center">
                <p class="text-sm text-green-600">Password updated successfully. Redirecting…</p>
                <Button variant="outline" @click="router.push('/login')">Go now</Button>
              </div>
              <form v-else class="grid gap-4" @submit.prevent="handleUpdatePassword">
                <div v-if="!sessionReady && !error" class="text-sm text-muted-foreground">
                  Validating recovery link…
                </div>
                <div v-if="sessionReady" class="grid gap-2">
                  <Label for="password">New Password</Label>
                  <Input id="password" v-model="password" type="password" placeholder="••••••••" required minlength="8" />
                </div>
                <div v-if="sessionReady" class="grid gap-2">
                  <Label for="confirm">Confirm Password</Label>
                  <Input id="confirm" v-model="confirmPassword" type="password" placeholder="••••••••" required minlength="8" />
                </div>
                <Button type="submit" class="w-full flex items-center justify-center" :disabled="loading || !sessionReady">
                  <svg
                    v-if="loading"
                    class="animate-spin mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>Update password</span>
                </Button>
                <div v-if="error" class="text-red-500 text-sm mt-2 text-center">{{ error }}</div>
                <div v-if="!error && sessionReady" class="text-xs text-muted-foreground text-center">
                  After updating you'll be redirected to sign in.
                </div>
              </form>
              <div v-if="error && !sessionReady" class="mt-4 text-center text-sm">
                <NuxtLink to="/login" class="underline">Request a new link</NuxtLink>
              </div>
            </CardContent>
          </Card>
            <div v-if="debug" class="mt-4 text-xs bg-black/5 p-3 rounded">
              <div class="font-medium">Debug</div>
              <div class="truncate">href: {{ debugInfo.href }}</div>
              <div>branch: {{ debugInfo.branch }}</div>
              <div>code: {{ debugInfo.code }}</div>
              <div>token: {{ debugInfo.token }}</div>
              <div>token_type: {{ debugInfo.token_type }}</div>
              <div class="truncate">hash: {{ debugInfo.hash }}</div>
            </div>
        </div>
      </div>
    </div>
    <!-- Right column (image) -->
    <div class="relative hidden bg-muted lg:block">
      <img
        src="/placeholder.svg"
        alt="Image"
        class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      >
    </div>
  </div>
</template>

<script lang="ts">
// Import UI components (separate <script> so <script setup> remains clean)
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
const supabase = useSupabaseClient();
const router = useRouter();

// Attach route-specific middleware (defined in app/middleware/reset-password.ts)
definePageMeta({
  middleware: ['reset-password']
});

// Form state
const password = ref("");
const confirmPassword = ref("");

// UI state
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);
const sessionReady = ref(false);
// Debug state (visible on localhost or when ?debug=true)
const debug = ref(false);
const debugInfo = ref({ href: '', code: null as string | null, token: null as string | null, token_type: null as string | null, hash: '', branch: '' });

function parseHashParams() {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
  const params = new URLSearchParams(hash);
  return {
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
    type: params.get('type')
  };
}

async function establishSession() {
  // Already have session?
  const { data: existing } = await supabase.auth.getSession();
  if (existing.session) {
    sessionReady.value = true;
    return;
  }

  // 0. Newer pattern: token + token_type=recovery (+ optional email)
  try {
    const url0 = new URL(window.location.href);
    const token = url0.searchParams.get('token');
    const tokenType = url0.searchParams.get('token_type');
    const email = url0.searchParams.get('email');
    if (token && tokenType === 'recovery') {
      // Attempt verifyOtp if email present (required by supabase)
      if (email) {
        const { data, error: verifyErr } = await supabase.auth.verifyOtp({ type: 'recovery', token, email });
        if (!verifyErr && data.session) {
          if (debug.value) {
            debugInfo.value.token = token;
            debugInfo.value.token_type = tokenType;
            debugInfo.value.branch = 'verifyOtp';
            console.debug('[reset-password] verifyOtp success', { token, email, data });
          }
          sessionReady.value = true;
          // Clean sensitive params
          ['token','token_type','email'].forEach(p=>url0.searchParams.delete(p));
          history.replaceState(null, document.title, url0.pathname + url0.search + url0.hash);
          return;
        }
        if (debug.value) console.debug('[reset-password] verifyOtp failed', verifyErr);
      }
      // If no email, fall through to other mechanisms
    }
  } catch {
    // ignore parse errors
  }

  // Prefer code exchange if present (newer flow)
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const type = url.searchParams.get('type');
  if (code && (!type || type === 'recovery')) {
    if (debug.value) {
      debugInfo.value.code = code;
      debugInfo.value.branch = 'exchangeCodeForSession';
      console.debug('[reset-password] exchanging code for session', { code, type });
    }
    const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
    if (exchErr) {
      if (debug.value) console.debug('[reset-password] exchangeCodeForSession failed', exchErr);
      // Fall back to hash method next
    } else {
      sessionReady.value = true;
      // Clean query params to avoid reuse
      url.searchParams.delete('code');
      url.searchParams.delete('type');
      history.replaceState(null, document.title, url.pathname + url.search + url.hash);
      return;
    }
  }

  // Hash fallback
  const { access_token, refresh_token, type: hashType } = parseHashParams();
  if (hashType === 'recovery' && access_token && refresh_token) {
    if (debug.value) {
      debugInfo.value.hash = window.location.hash;
      debugInfo.value.branch = 'setSession';
      console.debug('[reset-password] setting session from hash', { access_token: access_token ? 'present' : 'missing' });
    }
    const { error: setErr } = await supabase.auth.setSession({ access_token, refresh_token });
    if (setErr) {
      error.value = 'Could not validate recovery link. Please request a new one.';
      return;
    }
    sessionReady.value = true;
    // Clean hash
    if (window.location.hash) {
      history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }
    return;
  }

  error.value = 'Invalid or expired password recovery link.';
}

onMounted(() => {
  // determine debug visibility
  try {
    const u = new URL(window.location.href);
    debug.value = u.hostname.includes('localhost') || u.searchParams.get('debug') === 'true';
    debugInfo.value.href = window.location.href;
  } catch {
    debug.value = false;
  }
  establishSession();
});

async function handleUpdatePassword() {
  error.value = null;
  if (!sessionReady.value) {
    error.value = "Session not ready. Use the link from your email again.";
    return;
  }
  if (!password.value || password.value.length < 8) {
    error.value = "Password must be at least 8 characters.";
    return;
  }
  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match.";
    return;
  }
  loading.value = true;
  const { error: updateErr } = await supabase.auth.updateUser({ password: password.value });
  loading.value = false;
  if (updateErr) {
    error.value = updateErr.message;
    return;
  }
  success.value = true;
  // Clear hash for cleanliness
  if (window.location.hash) {
    history.replaceState(null, document.title, window.location.pathname + window.location.search);
  }
  // // Redirect after short delay
  // setTimeout(() => router.push("/login"), 2500);
}
</script>

<style scoped>
</style>
