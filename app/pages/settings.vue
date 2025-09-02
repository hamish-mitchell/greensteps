<template>
  <app-shell>
    <div class="flex min-h-screen">
      <!-- Sidebar -->
      <AppSidebar class="hidden md:block" />

      <!-- Main Content -->
      <main class="flex-1 px-4 md:px-8 py-10 w-full">
        <h1 class="text-3xl font-bold mb-8">Account Settings</h1>

        <!-- Profile Image Section -->
        <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 w-full">
          <div class="flex flex-col items-center">
            <img
              :src="avatarUrl || defaultAvatar"
              alt="Profile Image"
              class="w-32 h-32 rounded-full object-cover border-4 shadow-[0_4px_24px_rgba(0,0,0,0.7)] mb-4 transition-all duration-300"
            >
            <label class="shad-btn shad-btn-primary cursor-pointer px-6 py-2 font-semibold">
              Change Image
              <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" >
            </label>
            <p v-if="uploading" class="text-sm text-gray-500 mt-2">Uploading...</p>
          </div>
          <div class="flex-1 flex flex-col justify-center">
            <h2 class="text-xl font-semibold mb-2">Profile Image</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-2">
              This image will be shown across the site.
            </p>
            <p class="text-xs text-gray-400">Recommended: Square image, max 2MB.</p>
          </div>
        </div>

        <!-- Profile Section -->
        <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-8">
          <h2 class="text-xl font-semibold mb-4">Profile</h2>
          <form class="space-y-4" @submit.prevent="saveProfile">
            <div>
              <label class="block text-sm font-medium mb-1" for="name">Name</label>
              <input
                id="name"
                v-model="profile.name"
                type="text"
                class="shad-input w-full"
                placeholder="Your name"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1" for="email">Email</label>
              <input
                id="email"
                v-model="profile.email"
                type="email"
                class="shad-input w-full"
                placeholder="you@example.com"
                disabled
              >
            </div>
            <div>
              <button type="submit" class="shad-btn shad-btn-primary shadow-lg border-2 border-primary" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Password Section -->
        <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-8">
          <h2 class="text-xl font-semibold mb-4">Change Password</h2>
          <form class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1" for="current-password">Current Password</label>
              <input
                id="current-password"
                type="password"
                class="shad-input w-full"
                placeholder="Current password"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1" for="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                class="shad-input w-full"
                placeholder="New password"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1" for="confirm-password">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                class="shad-input w-full"
                placeholder="Confirm new password"
              >
            </div>
            <div>
              <button type="button" class="shad-btn shad-btn-primary shadow-lg border-2 border-primary">
                Update Password
              </button>
            </div>
          </form>
        </div>

        <!-- Danger Zone -->
        <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Delete Account</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">This action is irreversible.</p>
            </div>
            <button type="button" class="shad-btn shad-btn-destructive shadow-lg border-2 border-red-600">
              Delete
            </button>
          </div>
        </div>
      </main>
    </div>
  </app-shell>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppSidebar from '~/components/AppSidebar.vue'
import appShell from '~/layouts/app-shell.vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
// Use correct path for default avatar in public/avatars/
const defaultAvatar = '/avatars/default-avatar.png'

const profile = ref({
  name: '',
  email: '',
  avatar_url: ''
})
const avatarUrl = ref('')
const saving = ref(false)
const uploading = ref(false)

onMounted(async () => {
  if (user.value) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.value.id)
        .single()
      if (error) {
        console.error('Error fetching profile:', error)
      }
      if (data) {
  // profile name is stored in auth user metadata (display_name). Use that as editable name.
  profile.value.name = user.value?.user_metadata?.display_name || ''
  profile.value.email = user.value.email
        profile.value.avatar_url = data.avatar_url
        // Fallback to default avatar if not set or broken
        if (data.avatar_url) {
          avatarUrl.value = data.avatar_url + '?t=' + Date.now()
        } else {
          avatarUrl.value = defaultAvatar
        }
      } else {
  avatarUrl.value = defaultAvatar
      }
    } catch (err) {
      console.error('Exception in onMounted profile fetch:', err)
      avatarUrl.value = defaultAvatar
    }
  } else {
    avatarUrl.value = defaultAvatar
  }
})

async function onAvatarChange(e) {
  const files = e.target && e.target.files
  if (!files || !files[0]) return
  const file = files[0]
  if (file.size > 2 * 1024 * 1024) {
    alert('Image must be less than 2MB.')
    console.warn('Upload failed: file too large', { size: file.size })
    return
  }
  uploading.value = true
  const fileExt = file.name.split('.').pop()
  const filePath = `${user.value.id}_${Date.now()}.${fileExt}`
  try {
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { cacheControl: '3600', upsert: true })
    if (uploadError) {
      alert('Failed to upload image.')
      console.error('Supabase upload error:', uploadError, { uploadData, filePath, file })
      uploading.value = false
      avatarUrl.value = defaultAvatar
      return
    }
    // Get public URL using the returned path
    const { data: urlData, error: urlError } = supabase.storage.from('avatars').getPublicUrl(filePath)
    if (urlError || !urlData || !urlData.publicUrl) {
      alert('Failed to get public URL.')
      console.error('Supabase getPublicUrl error:', urlError, { filePath, urlData })
      uploading.value = false
      avatarUrl.value = defaultAvatar
      return
    }
    avatarUrl.value = urlData.publicUrl
    // Update profile
    const { error: updateError } = await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', user.value.id)
    if (updateError) {
      alert('Failed to update profile with new avatar.')
      console.error('Supabase profile update error:', updateError, { userId: user.value.id, avatarUrl: urlData.publicUrl })
      avatarUrl.value = defaultAvatar
    } else {
      profile.value.avatar_url = urlData.publicUrl
      avatarUrl.value = urlData.publicUrl + '?t=' + Date.now()
    }
  } catch (err) {
    alert('Unexpected error during image upload.')
    console.error('Exception in onAvatarChange:', err)
    avatarUrl.value = defaultAvatar
  } finally {
    uploading.value = false
  }
}
async function saveProfile() {
  saving.value = true
  try {
    // Update auth user metadata (display_name)
    try {
      const { error: userUpdateError } = await supabase.auth.updateUser({ data: { display_name: profile.value.name } })
      if (userUpdateError) console.error('Failed to update auth user metadata:', userUpdateError)
    } catch (e) {
      console.error('Exception updating auth user metadata:', e)
    }

    // Persist display_name into profiles for friend search (ensure column exists)
    const { error: updateError } = await supabase.from('profiles').update({ avatar_url: profile.value.avatar_url, display_name: profile.value.name }).eq('id', user.value.id)
    if (updateError) console.error('Failed to update profiles record:', updateError)
  } finally {
    saving.value = false
  }
  // Optionally, emit an event or use a global store to update avatar/display name elsewhere (e.g., AppSidebar)
}
</script>
<style>
/* Use shadcn and Tailwind utility classes for styling */
.custom-inset-shadow {
  box-shadow: inset 0px 0px 24px 6px rgba(0,0,0,0.3);
}
</style>