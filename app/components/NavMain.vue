<script setup lang="ts">
import type { LucideIcon } from "lucide-vue-next";
import { ChevronRight } from "lucide-vue-next";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";

const _props = defineProps<{
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
        isActive?: boolean;
        items?: {
            title: string;
            url: string;
        }[];
        notification?: number;
    }[];
}>();

// Active route helpers
const route = useRoute();
const isActive = (url: string) => {
    const path = route.path;
    if (!url) return false;
    return path === url || path.startsWith(url + "/");
};
const isParentActive = (item: (typeof _props.items)[number]) => {
    if (isActive(item.url)) return true;
    return item.items?.some((s) => isActive(s.url)) ?? false;
};
</script>

<template>
    <SidebarGroup>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarMenu>
            <Collapsible
                v-for="item in items"
                :key="item.title"
                as-child
                :default-open="isParentActive(item)"
            >
                <SidebarMenuItem>
                    <SidebarMenuButton
                        as-child
                        :tooltip="item.title"
                        :is-active="isParentActive(item)"
                    >
                        <a
                            :href="item.url"
                            class="flex items-center justify-between w-full"
                        >
                            <div class="flex items-center gap-2">
                                <component :is="item.icon" />
                                <span>{{ item.title }}</span>
                            </div>
                            <span
                                v-if="item.notification"
                                class="ml-2 inline-flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold px-2 py-0.5 min-w-[1.5em] h-5"
                            >
                                {{ item.notification }}
                            </span>
                        </a>
                    </SidebarMenuButton>
                    <template v-if="item.items?.length">
                        <CollapsibleTrigger as-child>
                            <SidebarMenuAction
                                class="data-[state=open]:rotate-90"
                            >
                                <ChevronRight />
                                <span class="sr-only">Toggle</span>
                            </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem
                                    v-for="subItem in item.items"
                                    :key="subItem.title"
                                >
                                    <SidebarMenuSubButton
                                        as-child
                                        :is-active="isActive(subItem.url)"
                                    >
                                        <a :href="subItem.url">
                                            <span>{{ subItem.title }}</span>
                                        </a>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </template>
                </SidebarMenuItem>
            </Collapsible>
        </SidebarMenu>
    </SidebarGroup>
</template>
