<script setup>
// Supabase client + current user composables supplied by @nuxtjs/supabase
const supabase = useSupabaseClient();
const user = useSupabaseUser(); // reactive user object (null if signed out)

// Reactive form state
const loading = ref(true);
const username = ref("");
const website = ref("");
const avatar_path = ref("");

// Initial profile fetch
loading.value = true;
const { data } = await supabase
    .from("profiles")
    .select(`username, website, avatar_url`)
    .eq("id", user.value.id) // filter by authenticated user id
    .single();

if (data) {
    // Populate local form fields
    username.value = data.username;
    website.value = data.website;
    avatar_path.value = data.avatar_url;
}

loading.value = false;

async function updateProfile() {
    // Upsert merges (insert if not exists, update if exists)
    try {
        loading.value = true;
        const user = useSupabaseUser(); // re-grab in case of reactivity changes

        const updates = {
            id: user.value.id, // row primary key
            username: username.value,
            website: website.value,
            avatar_url: avatar_path.value,
            updated_at: new Date(), // server-side could also set this
        };

        const { error } = await supabase.from("profiles").upsert(updates, {
            returning: "minimal", // reduces payload
        });
        if (error) throw error;
    } catch (error) {
        alert(error.message);
    } finally {
        loading.value = false;
    }
}

async function signOut() {
    // Clears session; useSupabaseUser() ref becomes null
    try {
        loading.value = true;
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        user.value = null;
    } catch (error) {
        alert(error.message);
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <!-- Simple profile edit form bound to reactive refs -->
    <!-- Email is read-only from auth metadata -->
    <form class="form-widget" @submit.prevent="updateProfile">
        <div>
            <label for="email">Email</label>
            <input id="email" type="text" :value="user.email" disabled />
        </div>
        <div>
            <label for="username">Username</label>
            <input id="username" v-model="username" type="text" />
        </div>
        <div>
            <label for="website">Website</label>
            <input id="website" v-model="website" type="url" />
        </div>

        <div>
            <input
                type="submit"
                class="button primary block"
                :value="loading ? 'Loading ...' : 'Update'"
                :disabled="loading"
            />
        </div>

        <div>
            <button class="button block" :disabled="loading" @click="signOut"
                >Sign Out</button
            >
        </div>
    </form>
</template>
