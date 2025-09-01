<script setup lang="ts">
// Lazy import sidebar to reduce synchronous work on navigation.
const AppSidebar = defineAsyncComponent(() => import('@/components/AppSidebar.vue'));
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

import { capitalise } from "@/utils/capitalise";

const route = useRoute();
</script>

<template>
    <SidebarProvider>
        <Suspense>
            <template #default>
                <AppSidebar />
            </template>
            <template #fallback>
                <div class="w-[240px] shrink-0 animate-pulse p-4 space-y-4 hidden md:block">
                    <div class="h-8 bg-muted rounded" />
                    <div class="h-6 bg-muted rounded w-3/4" />
                    <div class="h-6 bg-muted rounded w-1/2" />
                </div>
            </template>
        </Suspense>
        <SidebarInset>
            <header
                class="flex p-4 shrink-0 items-center gap-2 transition-[width,height] ease-out group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b mb-6 border-muted"
            >
                <div class="flex-col gap-2 px-4 w-full">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <SidebarTrigger class="-ml-1" />
                            <Separator
                                orientation="vertical"
                                class="mr-2 h-4"
                            />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem class="hidden md:block">
                                        <BreadcrumbLink href="#">
                                            Greensteps
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator
                                        class="hidden md:block"
                                    />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>
                                            {{
                                                capitalise(
                                                    route.name?.toString() ?? ""
                                                )
                                            }}
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                            <Separator orientation="vertical" class="h-4" />
                        </div>
                        <div class="text-muted-foreground text-sm">
                            <!--tagline-->
                        </div>
                    </div>
                </div>
            </header>
            <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
                <Suspense>
                    <template #default>
                        <slot />
                    </template>
                    <template #fallback>
                        <div class="space-y-4">
                            <div class="h-8 w-1/3 bg-muted animate-pulse rounded" />
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div v-for="i in 6" :key="i" class="h-24 bg-muted rounded animate-pulse" />
                            </div>
                        </div>
                    </template>
                </Suspense>
            </div>
        </SidebarInset>
    </SidebarProvider>
</template>
