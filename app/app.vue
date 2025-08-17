<script setup lang="ts">
// Toaster component for notifications
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'vue-sonner'
import 'vue-sonner/style.css'

// Setup database connection
const supabase = useSupabaseClient()

// Setup router
const router = useRouter()
const isDev = import.meta.dev

// Developer logout util, hidden in prod
async function devLogout() {
    await supabase.auth.signOut()
    toast.success('Logged out!')
    setTimeout(() => {
        router.push('/login')
    }, 600)
}
</script>

<template>
    <Toaster /> <!-- Hey look it's my laptop! -->
    <NuxtPage />
        <button
            v-if="isDev"
            @click="devLogout"
            style="position:fixed;top:24px;right:24px;z-index:1000;padding:10px 18px;background:#dc2626;color:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-weight:600;opacity:0.5;transition:background 0.2s;"
            title="Dev Logout"
        >
            Log out
        </button>
</template>
