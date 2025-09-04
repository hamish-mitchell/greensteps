<!--
    friends.vue
    Friends management page for GreenSteps app.
    Allows users to view, add, and manage friends, including incoming and outgoing friend requests.
    Features:
        - List of current friends with remove option
        - Incoming and outgoing friend requests with accept/decline
        - Search for new friends and send requests
        - Uses composable useFriends for state and actions
-->

<script setup lang="ts">
/*
    Imports - decrease size of file
    - Vue core and composables
    - UI components
*/
import { ref } from "vue";
import { useFriends } from "@/composables/useFriends";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Avatar from "@/components/ui/avatar/Avatar.vue";
import AvatarImage from "@/components/ui/avatar/AvatarImage.vue";
import AvatarFallback from "@/components/ui/avatar/AvatarFallback.vue";
import Separator from "@/components/ui/separator/Separator.vue";

// Page metadata for layout and tagline
definePageMeta({
        layout: "app-shell",
        tagline: "Connect with people and compare progress.",
});

// Destructure friend management state and actions from useFriends composable
const {
        friends,
        incoming,
        outgoing,
        loading,
        error,
        reload,
        addFriend,
        removeFriend,
        accept,
        decline,
        search,
        searchResults,
        searching,
        searchError,
} = useFriends();

// setup for the searching term
const term = ref("");

// Trigger search using the current term
function doSearch() {
        search(term.value);
}

// Utility: Get initials from a display name (max 2 chars)
function initials(name: string) {
        return name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2);
}
</script>

<template>
        <!--
            Friends Page Layout
            - Header and description
            - 3-column grid: Friends list, separator, search/requests
        -->
        <div class="flex flex-col h-full max-h-full">
                <!-- Page header -->
                <div class="mb-4">
                        <h1 class="text-xl font-semibold">Friends</h1>
                        <p class="text-sm text-muted-foreground"
                                >Add friends to compare stats in the friends leaderboard.</p
                        >
                </div>
                <div
                        class="grid gap-6 md:grid-cols-3 flex-1 overflow-y-auto pr-2"
                        style="max-height: calc(100vh - 140px)"
                >
                        <!-- Friends list -->
                        <div class="md:col-span-1 space-y-4">
                                <div class="flex items-center justify-between">
                                        <h2 class="text-sm font-medium">Your Friends</h2>
                                        <Button
                                                size="sm"
                                                variant="outline"
                                                :disabled="loading"
                                                @click="reload"
                                                >Refresh</Button
                                        >
                                </div>
                                <div v-if="loading" class="text-xs text-muted-foreground"
                                        >Loading...</div
                                >
                                <div v-else-if="error" class="text-xs text-red-500">{{
                                        error
                                }}</div>
                                <ul v-else class="space-y-2">
                                        <!-- Friend item -->
                                        <li
                                                v-for="f in friends"
                                                :key="f.id"
                                                class="flex items-center gap-3 rounded-md border px-3 py-2"
                                        >
                                                <Avatar class="h-8 w-8">
                                                        <AvatarImage :src="f.avatar_url || ''" />
                                                        <AvatarFallback>{{
                                                                initials(f.display_name || "Anon")
                                                        }}</AvatarFallback>
                                                </Avatar>
                                                <div class="flex flex-col flex-1">
                                                        <span class="text-sm font-medium leading-tight">{{
                                                                f.display_name || "Anon"
                                                        }}</span>
                                                        <span class="text-[10px] text-muted-foreground"
                                                                >{{
                                                                        (f.total_points || 0).toLocaleString()
                                                                }}
                                                                pts</span
                                                        >
                                                </div>
                                                <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        class="h-7 text-[10px] px-2"
                                                        @click="removeFriend(f.id)"
                                                        >Remove</Button
                                                >
                                        </li>
                                        <!-- No friends message -->
                                        <li
                                                v-if="!friends.length"
                                                class="text-xs text-muted-foreground"
                                                >No friends yet. Use search to add some.</li
                                        >
                                </ul>
                        </div>

                        <!-- Vertical separator for desktop -->
                        <Separator class="hidden md:block" orientation="vertical" />

                        <!-- Search and Requests section -->
                        <div class="md:col-span-2 space-y-4">
                                <!-- Friend search input -->
                                <div class="flex items-center gap-2">
                                        <Input
                                                v-model="term"
                                                placeholder="Search by display name"
                                                @keyup.enter="doSearch"
                                        />
                                        <Button
                                                :disabled="searching || term.length < 2"
                                                @click="doSearch"
                                                >Search</Button
                                        >
                                </div>
                                <p class="text-[10px] text-muted-foreground"
                                        >Enter at least 2 characters.</p
                                >
                                <div class="grid gap-4 md:grid-cols-2">
                                        <!-- Incoming friend requests -->
                                        <div class="space-y-2">
                                                <h3
                                                        class="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                                        >Incoming Requests ({{ incoming.length }})</h3
                                                >
                                                <ul class="space-y-2">
                                                        <li
                                                                v-for="r in incoming"
                                                                :key="'in-' + r.id"
                                                                class="flex items-center gap-3 rounded-md border px-3 py-2"
                                                        >
                                                                <Avatar class="h-7 w-7"
                                                                        ><AvatarImage
                                                                                :src="r.avatar_url || ''"
                                                                        /><AvatarFallback>{{
                                                                                initials(r.display_name || "A")
                                                                        }}</AvatarFallback></Avatar
                                                                >
                                                                <span class="text-xs font-medium flex-1">{{
                                                                        r.display_name
                                                                }}</span>
                                                                <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        class="h-6 text-[10px] px-2"
                                                                        @click="accept(r.id)"
                                                                        >Accept</Button
                                                                >
                                                                <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        class="h-6 text-[10px] px-2"
                                                                        @click="decline(r.id)"
                                                                        >Decline</Button
                                                                >
                                                        </li>
                                                        <!-- No incoming requests message -->
                                                        <li
                                                                v-if="!incoming.length"
                                                                class="text-[10px] text-muted-foreground"
                                                                >None</li
                                                        >
                                                </ul>
                                        </div>
                                        <!-- Outgoing friend requests -->
                                        <div class="space-y-2">
                                                <h3
                                                        class="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                                        >Sent Requests ({{ outgoing.length }})</h3
                                                >
                                                <ul class="space-y-2">
                                                        <li
                                                                v-for="r in outgoing"
                                                                :key="'out-' + r.id"
                                                                class="flex items-center gap-3 rounded-md border px-3 py-2"
                                                        >
                                                                <Avatar class="h-7 w-7"
                                                                        ><AvatarImage
                                                                                :src="r.avatar_url || ''"
                                                                        /><AvatarFallback>{{
                                                                                initials(r.display_name || "A")
                                                                        }}</AvatarFallback></Avatar
                                                                >
                                                                <span class="text-xs font-medium flex-1">{{
                                                                        r.display_name
                                                                }}</span>
                                                                <span class="text-[10px] text-muted-foreground"
                                                                        >Pending</span
                                                                >
                                                        </li>
                                                        <!-- No outgoing requests message -->
                                                        <li
                                                                v-if="!outgoing.length"
                                                                class="text-[10px] text-muted-foreground"
                                                                >None</li
                                                        >
                                                </ul>
                                        </div>
                                </div>
                                <!-- Search results and status -->
                                <div v-if="searching" class="text-xs text-muted-foreground"
                                        >Searching...</div
                                >
                                <div v-else-if="searchError" class="text-xs text-red-500">{{
                                        searchError
                                }}</div>
                                <ul v-else class="space-y-2">
                                        <!-- Search result item -->
                                        <li
                                                v-for="r in searchResults"
                                                :key="r.id"
                                                class="flex items-center gap-3 rounded-md border px-3 py-2"
                                        >
                                                <Avatar class="h-8 w-8">
                                                        <AvatarImage :src="r.avatar_url || ''" />
                                                        <AvatarFallback>{{
                                                                initials(r.display_name || "Anon")
                                                        }}</AvatarFallback>
                                                </Avatar>
                                                <div class="flex flex-col flex-1">
                                                        <span class="text-sm font-medium leading-tight">{{
                                                                r.display_name || "Anon"
                                                        }}</span>
                                                        <span class="text-[10px] text-muted-foreground"
                                                                >{{
                                                                        (r.total_points || 0).toLocaleString()
                                                                }}
                                                                pts</span
                                                        >
                                                </div>
                                                <Button
                                                        v-if="!(r as any).alreadyFriend"
                                                        size="sm"
                                                        variant="outline"
                                                        class="h-7 text-[10px] px-2"
                                                        @click="addFriend(r.id)"
                                                        >Add</Button
                                                >
                                                <span v-else class="text-[10px] text-muted-foreground"
                                                        >Already added</span
                                                >
                                        </li>
                                        <!-- No search results message -->
                                        <li
                                                v-if="
                                                        !searchResults.length &&
                                                        term.length >= 2 &&
                                                        !searching
                                                "
                                                class="text-xs text-muted-foreground"
                                                >No matches.</li
                                        >
                                </ul>
                        </div>
                </div>
        </div>
</template>

<style scoped>
/* Custom scrollbar for overflow areas */
.custom-scroll::-webkit-scrollbar {
        width: 8px;
}
</style>
