<!--
  Friends Page - Social Network Management
  
  Manages user's social connections, friend requests, and friend activity.
  Provides interface for adding friends and viewing friend profiles.
-->
<script setup lang="ts">
import { ref } from "vue";
import { useFriends } from "@/composables/useFriends";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Avatar from "@/components/ui/avatar/Avatar.vue";
import AvatarImage from "@/components/ui/avatar/AvatarImage.vue";
import AvatarFallback from "@/components/ui/avatar/AvatarFallback.vue";
import Separator from "@/components/ui/separator/Separator.vue";
definePageMeta({
    layout: "app-shell",
    tagline: "Connect with people and compare progress.",
});
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
const term = ref("");
function doSearch() {
    search(term.value);
}
function initials(name: string) {
    return name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2);
}
</script>

<template>
    <div class="flex flex-col h-full max-h-full">
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
                    <li
                        v-if="!friends.length"
                        class="text-xs text-muted-foreground"
                        >No friends yet. Use search to add some.</li
                    >
                </ul>
            </div>

            <Separator class="hidden md:block" orientation="vertical" />

            <!-- Search -->
            <div class="md:col-span-2 space-y-4">
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
                            <li
                                v-if="!incoming.length"
                                class="text-[10px] text-muted-foreground"
                                >None</li
                            >
                        </ul>
                    </div>
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
                            <li
                                v-if="!outgoing.length"
                                class="text-[10px] text-muted-foreground"
                                >None</li
                            >
                        </ul>
                    </div>
                </div>
                <div v-if="searching" class="text-xs text-muted-foreground"
                    >Searching...</div
                >
                <div v-else-if="searchError" class="text-xs text-red-500">{{
                    searchError
                }}</div>
                <ul v-else class="space-y-2">
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
.custom-scroll::-webkit-scrollbar {
    width: 8px;
}
</style>
