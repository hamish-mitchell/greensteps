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
                <input
                    v-model="password"
                    type="password"
                    placeholder="Password"
                    class="input"
                />
                <button class="btn" @click="signIn">Sign In</button>
                <p v-if="error" class="text-red-500">{{ error }}</p>
            </div>
            <NuxtLink to="/signup" class="text-blue-500 mt-4"
                >Create Account</NuxtLink
            >
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const email = ref("");
const password = ref("");
const error = ref("");

async function signIn() {
    //this is infact the signin function
    try {
        error.value = "";
        const { _data, error: signInError } =
            await supabase.auth.signInWithPassword({
                //I'm in
                email: email.value,
                password: password.value,
            });
        if (signInError) {
            error.value = signInError.message;
            console.error("Sign in error:", signInError);
        }
    } catch (e) {
        console.error("Unexpected error:", e);
        error.value = "An unexpected error occurred";
    }
}

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

<style scoped>
.center-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-box {
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.441);
    background: rgb(0, 0, 0);
    width: 100%;
    max-width: 400px;
}

.input {
    margin: 4px;
    padding: 8px;
    width: 100%;
    border: 1px solid #000000;
    border-radius: 4px;
}

.btn {
    margin: 8px;
    padding: 8px 16px;
    background: #000000;
    color: white;
    border: none;
    border-radius: 4px;
    width: 100%;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn:hover {
    background: #828282;
}
</style>
