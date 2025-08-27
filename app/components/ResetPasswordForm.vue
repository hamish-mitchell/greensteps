<template>
  <Card class="mx-auto max-w-sm border-none shadow-none">
    <CardHeader>
      <CardTitle class="text-2xl">Reset your password</CardTitle>
      <CardDescription>
        Enter your email to receive a password reset link.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="grid gap-4" @submit.prevent="emit('submit')">
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="modelEmail"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <Button type="submit" class="w-full" :disabled="loading">
          <svg
            v-if="loading"
            class="animate-spin mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>Send reset link</span>
        </Button>
        <div v-if="error" class="text-red-500 text-sm mt-2 text-center">
          {{ error }}
        </div>
        <div class="mt-4 text-center text-sm">
          <a href="#" class="underline" @click.prevent="emit('switch-form', 'signin')">
            Back to sign in
          </a>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script lang="ts" setup>
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emit = defineEmits<{
  (e: "switch-form", form: "signin" | "signup"): void;
  (e: "submit"): void;
}>();

defineProps<{
  email: string;
  loading: boolean;
  error: string | null;
}>();

const modelEmail = defineModel<string>("email");
</script>

<style>

</style>