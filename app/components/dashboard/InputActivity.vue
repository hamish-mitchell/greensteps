<!--
  Activity Input Component - Carbon Activity Tracker
  
  Modal form component for inputting user activities and tracking carbon emissions.
  Supports multiple activity types: transport, energy, waste, and food consumption.
-->
<script setup lang="ts">
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { reactive, computed, watch } from "vue";

// Types
type Category = 'Food' | 'Transport' | 'Electricity' | 'Waste';
type FoodSub = 'Red Meat' | 'White Meat' | 'Dairy' | 'Baked Goods' | 'Fruit/Veg.';
type TransportMode = 'Car' | 'Walk/Ride' | 'Bus' | 'Train' | 'Tram' | 'Plane';

// Options
const categories: Category[] = ['Food','Transport','Electricity','Waste'];
const foodSubs: FoodSub[] = ['Red Meat','White Meat','Dairy','Baked Goods','Fruit/Veg.'];
const transportModes: TransportMode[] = ['Car','Walk/Ride','Bus','Train','Tram','Plane'];

// Form state
const form = reactive({
    category: '' as Category | '',
    foodSubcategory: '' as FoodSub | '',
    transportMode: '' as TransportMode | '',
    amountKg: null as number | null,
    durationHours: 0,
    durationMinutes: 0,
    electricityKWh: null as number | null,
    wasteKg: null as number | null,
});

// Reset irrelevant fields when category changes
watch(() => form.category, () => {
    form.foodSubcategory = '';
    form.transportMode = '';
    form.amountKg = null;
    form.durationHours = 0;
    form.durationMinutes = 0;
    form.electricityKWh = null;
    form.wasteKg = null;
});

// Computed helpers
const isFood = computed(() => form.category === 'Food');
const isTransport = computed(() => form.category === 'Transport');
const isElectricity = computed(() => form.category === 'Electricity');
const isWaste = computed(() => form.category === 'Waste');

const canSave = computed(() => {
    if (!form.category) return false;
    if (isFood.value) return !!form.foodSubcategory && !!form.amountKg && form.amountKg > 0;
    if (isTransport.value) return !!form.transportMode && (form.durationHours > 0 || form.durationMinutes > 0);
    if (isElectricity.value) return !!form.electricityKWh && form.electricityKWh > 0;
    if (isWaste.value) return !!form.wasteKg && form.wasteKg > 0;
    return false;
});

type ActivityPayload = {
    category: Category | '';
    food: { subcategory: FoodSub | ''; amountKg: number | null } | null;
    transport: { mode: TransportMode | ''; durationHours: number; durationMinutes: number; totalMinutes: number } | null;
    electricity: { kWh: number | null } | null;
    waste: { amountKg: number | null } | null;
};

const emit = defineEmits<{ (e: 'save', payload: ActivityPayload): void }>();

function onSave() {
    if (!canSave.value) return;
    const payload = {
        category: form.category,
        food: isFood.value
            ? { subcategory: form.foodSubcategory, amountKg: form.amountKg }
            : null,
        transport: isTransport.value
            ? {
                  mode: form.transportMode,
                  durationHours: form.durationHours,
                  durationMinutes: form.durationMinutes,
                  totalMinutes: form.durationHours * 60 + form.durationMinutes,
              }
            : null,
        electricity: isElectricity.value
            ? { kWh: form.electricityKWh }
            : null,
        waste: isWaste.value
            ? { amountKg: form.wasteKg }
            : null,
        // timestamp: new Date().toISOString()
    };
    emit('save', payload);
}
</script>

<template>
    <Sheet>
        <SheetTrigger as-child>
            <slot name="trigger" />
        </SheetTrigger>
        <SheetContent class="w-md">
            <SheetHeader>
                <SheetTitle class="text-xl">New Activity 🥳</SheetTitle>
                <SheetDescription>
                    Enter the details of your new activity below. Click save
                    when you're done.
                </SheetDescription>
            </SheetHeader>
            <div class="p-4 space-y-6">
                <!-- Category -->
                <div class="space-y-2">
                    <Label class="text-sm font-medium">Category</Label>
                    <Select v-model="form.category">
                        <SelectTrigger class="w-full">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Categories</SelectLabel>
                                <SelectItem
                                    v-for="c in categories"
                                    :key="c"
                                    :value="c"
                                >{{ c }}</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <!-- Food -->
                <div v-if="isFood" class="space-y-4">
                    <div class="space-y-2">
                        <Label class="text-sm font-medium">Food Subcategory</Label>
                        <Select v-model="form.foodSubcategory">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Select subcategory" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Food</SelectLabel>
                                    <SelectItem
                                        v-for="f in foodSubs"
                                        :key="f"
                                        :value="f"
                                    >{{ f }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div class="space-y-2">
                        <Label for="foodKg" class="text-sm font-medium"
                            >Amount (kg)</Label
                        >
                        <Input
                            id="foodKg"
                            v-model.number="form.amountKg as number"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="e.g. 0.45"
                        />
                    </div>
                </div>

                <!-- Transport -->
                <div v-if="isTransport" class="space-y-4">
                    <div class="space-y-2">
                        <Label class="text-sm font-medium">Mode</Label>
                        <Select v-model="form.transportMode">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Transport Modes</SelectLabel>
                                    <SelectItem
                                        v-for="m in transportModes"
                                        :key="m"
                                        :value="m"
                                    >{{ m }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div class="flex gap-4">
                        <div class="flex-1 space-y-2">
                            <Label for="hrs" class="text-sm font-medium"
                                >Hours</Label
                            >
                            <Input
                                id="hrs"
                                v-model.number="form.durationHours"
                                type="number"
                                min="0"
                                placeholder="0"
                            />
                        </div>
                        <div class="flex-1 space-y-2">
                            <Label for="mins" class="text-sm font-medium"
                                >Minutes</Label
                            >
                            <Input
                                id="mins"
                                v-model.number="form.durationMinutes"
                                type="number"
                                min="0"
                                max="59"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                <!-- Electricity -->
                <div v-if="isElectricity" class="space-y-2">
                    <Label for="kwh" class="text-sm font-medium"
                        >Electricity (kWh)</Label
                    >
                    <Input
                        id="kwh"
                        v-model.number="form.electricityKWh as number"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 12.5"
                    />
                </div>

                <!-- Waste -->
                <div v-if="isWaste" class="space-y-2">
                    <Label for="wasteKg" class="text-sm font-medium"
                        >Waste (kg)</Label
                    >
                    <Input
                        id="wasteKg"
                        v-model.number="form.wasteKg as number"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 1.2"
                    />
                </div>

                <!-- Preview (optional minimal) -->
                <div
                    v-if="form.category"
                    class="text-xs text-muted-foreground border rounded p-3 space-y-1"
                >
                    <div><strong>Category:</strong> {{ form.category }}</div>
                    <div v-if="isFood">
                        <strong>Food:</strong> {{ form.foodSubcategory }} -
                        {{ form.amountKg || 0 }} kg
                    </div>
                    <div v-if="isTransport">
                        <strong>Transport:</strong> {{ form.transportMode }} -
                        {{ form.durationHours }}h {{ form.durationMinutes }}m
                    </div>
                    <div v-if="isElectricity">
                        <strong>Electricity:</strong> {{ form.electricityKWh || 0 }} kWh
                    </div>
                    <div v-if="isWaste">
                        <strong>Waste:</strong> {{ form.wasteKg || 0 }} kg
                    </div>
                </div>
            </div>
            <SheetFooter>
                <SheetClose as-child>
                    <Button
                        type="button"
                        :disabled="!canSave"
                        class="w-full"
                        @click="onSave"
                    >
                        Save Activity
                    </Button>
                </SheetClose>
            </SheetFooter>
        </SheetContent>
    </Sheet>
</template>
