<script setup>
const supabase = useSupabaseClient();
const user = useSupabaseUser(); // reactive; updates on auth state changes

// Form state
const email = ref("");
const password = ref("");
const error = ref("");

// Email/password sign-in
async function signIn() {
    try {
        error.value = "";
        const { _data, error: signInError } =
            await supabase.auth.signInWithPassword({
                email: email.value,
                password: password.value,
            });
        if (signInError) {
            error.value = signInError.message;
            console.error("Sign in error:", signInError);
        }
        // _data contains session info if successful
    } catch (e) {
        console.error("Unexpected error:", e);
        error.value = "An unexpected error occurred";
    }
}

// Sign out current session
async function signOut() {
    try {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
            console.error("Sign out error:", signOutError);
        }
    } catch (e) {
        console.error("Unexpected error:", e);
    }
}
</script>

<template>
    <div class="center-container">
        <div class="login-box">
            <div class="text-3xl font-bold mb-6 text-center">Greensteps</div>
            <div v-if="user" class="flex flex-col items-center">
                <p>Signed in as: {{ user.email }}</p>
                <button class="btn" @click="signOut">Sign Out</button>
            </div>
            <div v-else class="flex flex-col items-center">
                <input v-model="email" placeholder="Email" class="input" />
                <input v-model="password" type="password" placeholder="Password" class="input" />
                <button class="btn p-2 bg-blue-500 hover:bg-blue-700 border border-blue-100" @click="signIn">Sign
                    In</button>
                <p v-if="error" class="text-red-500">{{ error }}</p>
            </div>
            <NuxtLink to="/signup" class="text-blue-500 mt-4">Create Account</NuxtLink>
        </div>
    </div>
</template>
