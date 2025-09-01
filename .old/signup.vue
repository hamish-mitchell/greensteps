<!-- SignUpForm.vue -->
<template>
    <!-- Collect email/password + display name (stored in user metadata) -->
    <form @submit.prevent="signUp">
        <input v-model="email" type="email" placeholder="Email" required />
        <input
            v-model="password"
            type="password"
            placeholder="Password"
            required
        />
        <input
            v-model="displayName"
            type="text"
            placeholder="Display Name"
            required
        />
        <button type="submit" class="p-2 bg-blue-300">Sign Up</button>
        <p v-if="error" style="color: red">{{ error }}</p>
        <p v-if="success" style="color: green"
            >Signup successful! Check your email.</p
        >
    </form>
</template>

<script setup>
import { ref } from "vue";

const supabase = useSupabaseClient();

// Reactive form state
const email = ref("");
const password = ref("");
const displayName = ref("");
const error = ref(null);
const success = ref(false);

const signUp = async () => {
    // Reset feedback
    error.value = null;
    success.value = false;

    // Sign up (Supabase sends confirmation email if enabled)
    const { data, error: signupError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
            data: {
                display_name: displayName.value, // custom user metadata
            },
        },
    });

    if (signupError) {
        error.value = signupError.message;
    } else {
        success.value = true;
        console.log("Signup response:", data); // useful for debugging
    }
};
</script>
