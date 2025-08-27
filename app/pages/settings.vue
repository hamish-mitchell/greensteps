<template>
  <app-shell>
    <div class="flex min-h-screen">
      <!-- Sidebar -->
      <AppSidebar class="hidden md:block" />

      <!-- Main Content -->
      <main class="flex-1 px-4 md:px-8 py-10 max-w-3xl mx-auto w-full">
        <h1 class="text-3xl font-bold mb-8">Account Settings</h1>

        <!-- Profile Section -->
        <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-8">
          <h2 class="text-xl font-semibold mb-4">Profile</h2>
          <form class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1" for="name">Name</label>
              <input
                id="name"
                type="text"
                class="shad-input w-full"
                placeholder="Your name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1" for="email">Email</label>
              <input
                id="email"
                type="email"
                class="shad-input w-full"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <button type="button" class="shad-btn shad-btn-primary">
                Save Changes
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
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1" for="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                class="shad-input w-full"
                placeholder="New password"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1" for="confirm-password">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                class="shad-input w-full"
                placeholder="Confirm new password"
              />
            </div>
            <div>
              <button type="button" class="shad-btn shad-btn-primary">
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
            <button type="button" class="shad-btn shad-btn-destructive">
              Delete
            </button>
          </div>
        </div>
      </main>
    </div>
  </app-shell>
</template>

<script lang="ts" setup>
import AppSidebar from '~/components/AppSidebar.vue'
import appShell from '~/layouts/app-shell.vue'
// No logic yet
</script>

<style>
/* Use shadcn and Tailwind utility classes for styling */
</style>