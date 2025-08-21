<script setup lang="ts">
import AppSidebar from "@/components/AppSidebar.vue";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSupabaseClient, useSupabaseUser } from "#imports";
import { ref } from "vue";
import { Button } from "@/components/ui/button"; 

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const quests = ref<any[]>([]);

async function startQuest() {
    console.log("startQuest called"); // Debug
    if (!user.value) {
        errorMsg.value = "You must be signed in.";
        return;
    }
    loading.value = true;
    errorMsg.value = null;
    try {
        const token = await supabase.auth.getSession().then((r) => r.data.session?.access_token ?? "");
        console.log("Token acquired:", token);
        const res = await $fetch<{ error?: string, quests?: any[] }>("/api/getQuest", {
            method: "POST",
            body: { questId: 0 },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("API response:", res);
        if (res && res.error) {
            errorMsg.value = res.error;
        } else if (res && res.quests) {
            quests.value = res.quests;
        }
    } catch (e: any) {
        console.error("Caught error:", e);
        errorMsg.value = e.message || String(e);
    } finally {
        loading.value = false;
        console.log("Loading set to false");
    }
}

async function activateQuest(questId: number) {
    loading.value = true;
    errorMsg.value = null;
    try {
        const token = await supabase.auth.getSession().then((r) => r.data.session?.access_token ?? "");
        console.log("Token acquired for activation:", token);
        const res = await $fetch<{ error?: string }>("/api/activateQuest", {
            method: "POST",
            body: { questId },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Activate API response:", res);
        if (res && res.error) {
            errorMsg.value = res.error;
        } else {
            // Quest activated, you can update the UI or quests state here if needed
            startQuest(); // Refresh the quests
        }
    } catch (e: any) {
        console.error("Caught error during quest activation:", e);
        errorMsg.value = e.message || String(e);
    } finally {
        loading.value = false;
        console.log("Loading set to false after activation");
    }
}

async function fetchQuests() {
    const response = await fetch(
  'https://your-project.supabase.co/functions/create-active-quest', 
  {
    method: 'POST',
    headers: {
    'Authorization': `Bearer ${await supabase.auth.getSession().then(r => r.data.session?.access_token ?? "")}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quest_id: 'your_quest_id' })
  }
);
}
</script>

<template>
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <header
                class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-out group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
            >
                <div class="flex items-center gap-2 px-4">
                    <SidebarTrigger class="-ml-1" />
                    <Separator orientation="vertical" class="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem class="hidden md:block">
                                <BreadcrumbLink href="#">
                                    Greensteps
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator class="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Quests</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div>
                    <div class="grid auto-rows-min gap-4 md:grid-cols-3">
                        <Button @click="fetchQuests" :disabled="loading">
                            <span v-if="loading">Starting...</span>
                            <span v-else>start quest</span>
                        </Button>
                        <div v-if="errorMsg" class="text-red-500">{{ errorMsg }}</div>
                    </div>
                </div>
                <div v-if="quests.length">
                    <h2>Quests:</h2>
                    <ul>
                        <li v-for="quest in quests" :key="quest.id">
                            {{ quest.name || quest.title || quest.id }}
                        </li>
                    </ul>
                </div>
            </div>
        </SidebarInset>
    </SidebarProvider>
</template>
