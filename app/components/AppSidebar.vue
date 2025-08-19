<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";

import {
    Cloud,
    Cog,
    Compass,
    Frame,
    LayoutDashboard,
    Leaf,
    Lightbulb,
    Map,
    MessageCircleMore,
    PieChart,
    Trophy,
} from "lucide-vue-next";
import NavMain from "@/components/NavMain.vue";
import NavSecondary from "@/components/NavSecondary.vue";
import NavUser from "@/components/NavUser.vue";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const props = withDefaults(defineProps<SidebarProps>(), {
    variant: "inset",
});

const data = {
    user: {
        name: "John Doe",
        email: "john.doe@gmail.com",
        avatar: "",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "#",
            icon: LayoutDashboard,
            isActive: true,
        },
        {
            title: "Quests",
            url: "#",
            icon: Compass,
            notification: 3,
        },
        {
            title: "Leaderboard",
            url: "#",
            icon: Trophy,
            items: [],
        },
        {
            title: "Emissions",
            url: "#",
            icon: Cloud,
            items: [],
        },
        {
            title: "Tips",
            url: "#",
            icon: Lightbulb,
            items: [],
        },
    ],
    navSecondary: [
        {
            title: "Support",
            url: "#",
            icon: MessageCircleMore,
        },
        {
            title: "Settings",
            url: "#",
            icon: Cog,
        },
    ],
    projects: [
        {
            name: "Design Engineering",
            url: "#",
            icon: Frame,
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: PieChart,
        },
        {
            name: "Travel",
            url: "#",
            icon: Map,
        },
    ],
};
</script>

<template>
    <Sidebar v-bind="props">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <a href="#">
                            <div
                                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground"
                            >
                                <Leaf class="size-4" />
                            </div>
                            <div
                                class="grid flex-1 text-left text-sm leading-tight"
                            >
                                <span class="truncate font-semibold"
                                    >Greensteps</span
                                >
                            </div>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
            <NavMain :items="data.navMain" />
            <NavSecondary :items="data.navSecondary" class="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
            <NavUser :user="data.user" />
        </SidebarFooter>
    </Sidebar>
</template>
