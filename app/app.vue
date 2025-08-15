
<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
const supabase = useSupabaseClient()
const router = useRouter()
const isDev = process.dev
import { toast } from 'vue-sonner'
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
            style="position:fixed;bottom:24px;left:24px;z-index:1000;padding:10px 18px;background:#dc2626;color:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-weight:600;opacity:0.95;transition:background 0.2s;"
            title="Dev Logout"
        >
            Log out
        </button>
</template>
