<script setup lang="ts">
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
</script>

<template>
    <Sheet>
        <SheetTrigger as-child>
            <slot name="trigger" />
        </SheetTrigger>
        <SheetContent class="w-md">
            <SheetHeader>
                <SheetTitle class="text-lg font-semibold"
                    >Input Activity</SheetTitle
                >
                <SheetDescription>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                    Eum eveniet minus doloremque dolor, repellat inventore at
                    accusantium esse id aliquam illum asperiores, quam ad eius
                    temporibus natus ullam nesciunt omnis!
                </SheetDescription>
            </SheetHeader>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officia, sed alias labore ad assumenda distinctio, totam earum recusandae minus, expedita reprehenderit at exercitationem natus facere blanditiis porro libero dolorem odit!
        </SheetContent>
    </Sheet>
</template>
