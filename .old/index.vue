<script setup>
import { ref } from "vue";

const supabase = useSupabaseClient();
        

const data = ref(null);
const electricityUsage = ref(0);
const foodAmount = ref(0);
const selectedState = ref("au-vic");
const selectedFoodType = ref("red_meat");
const loading = ref(false);
const activityType = ref("electricity");

const states = [
    { code: "au-vic", name: "Victoria" },
    { code: "au-nsw", name: "New South Wales" },
    { code: "au-qld", name: "Queensland" },
    { code: "au-wa", name: "Western Australia" },
    { code: "au-nt", name: "Northern Territory" },
    { code: "au-tas", name: "Tasmania" },
    { code: "au-act", name: "Australian Capital Territory" },
    { code: "au-sa", name: "South Australia" },
];

const foodTypes = [
    { code: "red_meat", name: "Red Meat" },
    { code: "white_meat", name: "White Meat" },
    { code: "grain", name: "Grain" },
    { code: "grain_alternative", name: "Grain Alternative" },
    { code: "fruit_vegetable", name: "Fruit & Vegetable" },
    { code: "dairy", name: "Dairy" },
    { code: "dairy_alternative", name: "Dairy Alternative" },
    { code: "other", name: "Other" },
];

const fetchData = async () => {
    loading.value = true;
    data.value = null;
    try {
        let activity;
        if (activityType.value === "electricity") {
            activity = {
                type: "electricity",
                location: selectedState.value,
                source: "coal",
                amount: electricityUsage.value,
            };
            await supabase
            .from('activities')
            .insert({
                'type': 'electricity',
                amount: electricityUsage.value
            })
        } else if (activityType.value === "food") {
            if (selectedFoodType.value === "other") {
                data.value = {
                    error: `eat something on the list`,
                };
                return;
            } else {
                activity = {
                    type: "food",
                    location: selectedFoodType.value,
                    amount: foodAmount.value,
                };
            }
        }
        const response = await fetch("/api/getEmissionsFromActivity", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ activity }),
        });
        data.value = await response.json();
    } finally {
        loading.value = false;
    }
};


</script>

<template>
    <div class="max-w-xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
        <h1 class="text-3xl font-bold mb-6 text-center">Home Page</h1>
        <div class="flex justify-center gap-4 mb-6">
            <NuxtLink
                to="/signup"
                class="text-blue-500 underline hover:text-blue-700 font-medium"
                >Create Account</NuxtLink
            >
            <NuxtLink
                to="/login"
                class="text-blue-500 underline hover:text-blue-700 font-medium"
                >Login</NuxtLink
            >
        </div>

        <div class="flex gap-6 mb-6 justify-center">
            <label class="flex items-center gap-2 cursor-pointer">
                <input
                    v-model="activityType"
                    type="radio"
                    value="electricity"
                    class="accent-blue-500"
                />
                <span class="font-medium">Electricity</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
                <input
                    v-model="activityType"
                    type="radio"
                    value="food"
                    class="accent-blue-500"
                />
                <span class="font-medium">Food</span>
            </label>
        </div>

        <div v-if="activityType === 'electricity'" class="mb-6">
            <p class="mb-2 font-semibold">How many electricity</p>
            <input
                v-model="electricityUsage"
                type="number"
                placeholder="Enter electricity usage in kWh"
                class="border rounded px-3 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <p class="mb-2 font-semibold">live</p>
            <select
                v-model="selectedState"
                class="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
                <option
                    v-for="state in states"
                    :key="state.code"
                    :value="state.code"
                >
                    {{ state.name }}
                </option>
            </select>
        </div>

        <div v-if="activityType === 'food'" class="mb-6">
            <p class="mb-2 font-semibold">What consume</p>
            <select
                v-model="selectedFoodType"
                class="border rounded px-3 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
                <option
                    v-for="food in foodTypes"
                    :key="food.code"
                    :value="food.code"
                >
                    {{ food.name }}
                </option>
            </select>
            <p class="mb-2 font-semibold">how much kilogam</p>
            <input
                v-model="foodAmount"
                type="number"
                placeholder="Enter amount in kilograms"
                class="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
        </div>

        <button
            class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded shadow transition mb-6 w-full"
            @click="fetchData"
        >
            Calculate Emissions
        </button>

        <div v-if="loading" class="text-center text-gray-500">
            <p>Loading...</p>
        </div>
        <div v-else-if="data" class="bg-gray-50 rounded p-4 mt-4">
            <h2 class="text-xl font-bold mb-2">Emissions Data</h2>
            <div class="bg-gray-100 rounded p-2 text-sm overflow-x-auto">{{
                JSON.stringify(data, null, 2)
            }}</div>
        </div>
    </div>
</template>
