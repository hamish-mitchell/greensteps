<script setup lang="ts">
// Lazy import sidebar to reduce synchronous work on navigation.
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
const AppSidebar = defineAsyncComponent(() => import('@/components/AppSidebar.vue'));

// Get the current route for breadcrumb display
const route = useRoute();
</script>

<template>
    <!-- Main sidebar provider wrapping the app layout -->
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
            <!-- Header section with breadcrumb and optional tagline -->
            <header
                class="flex p-4 shrink-0 items-center gap-2 transition-[width,height] ease-out group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b mb-6 border-muted"
            >
                <div class="flex-col gap-2 px-4 w-full">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <!-- Sidebar trigger button -->
                            <SidebarTrigger class="-ml-1" />
                            <!-- Vertical separator -->
                            <Separator
                                orientation="vertical"
                                class="mr-2 h-4"
                            />
                            <!-- Breadcrumb navigation -->
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <!-- Home link (hidden on small screens) -->
                                    <BreadcrumbItem class="hidden md:block">
                                        <BreadcrumbLink href="#">
                                            Greensteps
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <!-- Separator (hidden on small screens) -->
                                    <BreadcrumbSeparator
                                        class="hidden md:block"
                                    />
                                    <!-- Current page name -->
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
                            <!-- Vertical separator -->
                            <Separator orientation="vertical" class="h-4" />
                        </div>
                        <!-- Optional tagline area -->
                        <div class="text-muted-foreground text-sm">
                            <!-- Tagline -->
                        </div>
                    </div>
                </div>
            </header>
            <!-- Main content area for page slots -->
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
