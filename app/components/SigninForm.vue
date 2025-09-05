<!--
  Sign In Form Component - User Authentication
  
  Form component for user sign-in with email and password.
  Includes validation, error handling, and integration with Supabase auth.
-->
<script setup lang="ts">
// Component imports
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const emit = defineEmits<{
    (e: "switch-form", form: "signup" | "signin" | "reset"): void;
    (e: "submit"): void;
}>();

defineProps<{
    email: string;
    password: string;
    loading: boolean;
    error: string | null;
}>();

const modelEmail = defineModel<string>("email");
const modelPassword = defineModel<string>("password");
</script>

<template>
    <Card class="mx-auto max-w-sm border-none shadow-none">
        <CardHeader>
            <CardTitle class="text-2xl"> Welcome back 😎 </CardTitle>
            <CardDescription>
                Sign in to your
                <span class="font-medium text-emerald-500">Greensteps</span>
                account
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
                <div class="grid gap-2">
                    <div class="flex items-center">
                        <Label for="password">Password</Label>
                        <a
                            href="#"
                            class="ml-auto inline-block text-sm underline"
                            @click.prevent="emit('switch-form', 'reset')"
                        >
                            Forgot your password?
                        </a>
                    </div>
                    <Input
                        id="password"
                        v-model="modelPassword"
                        type="password"
                        placeholder="••••••••"
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
                    <span>Sign in</span>
                </Button>
                <div v-if="error" class="text-red-500 text-sm mt-2 text-center">
                    {{ error }}
                </div>
                <div
                    class="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border"
                >
                    <span
                        class="relative z-10 bg-background px-2 text-muted-foreground"
                    >
                        Or
                    </span>
                </div>
                <Button type="button" variant="outline" class="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                            d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                            fill="currentColor"
                        />
                    </svg>
                    Sign in with Apple
                </Button>
                <Button type="button" variant="outline" class="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                            fill="currentColor"
                        />
                    </svg>
                    Sign in with Google
                </Button>
            </form>
            <div class="mt-4 text-center text-sm">
                Don't have an account?
                <a
                    href="#"
                    class="underline"
                    @click.prevent="emit('switch-form', 'signup')"
                >
                    Sign up
                </a>
            </div>
        </CardContent>
    </Card>
</template>
