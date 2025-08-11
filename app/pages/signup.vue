<!-- SignUpForm.vue -->
<template>
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
        <button type="submit">Sign Up</button>
        <p v-if="error" style="color: red">{{ error }}</p>
        <p v-if="success" style="color: green"
            >Signup successful! Check your email.</p
        >
    </form>
</template>

<script setup>
import { ref } from "vue";

const supabase = useSupabaseClient();
const email = ref("");
const password = ref("");
const displayName = ref("");
const error = ref(null);
const success = ref(false);

const signUp = async () => {
    error.value = null;
    success.value = false;
    const { data, error: signupError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
            data: {
                display_name: displayName.value,
            },
        },
    });

    if (signupError) {
        error.value = signupError.message;
    } else {
        success.value = true;
        console.log("Signup response:", data);
    }
};
</script>
