<script setup>
const data = ref(null);

const fetchData = async () => {
    const response = await fetch('/api/getEmissionsFromActivity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activity: {
            type: 'electricity',
            location: 'au-vic',
            source: 'coal',
            amount: 1000, // in kWh
        } }),
    });
    data.value = await response.json();
};

fetchData();
</script>

<template>
    <div>
        <h1>Home Page</h1>
        <NuxtLink to="/signup" class="text-blue-500 mt-4"
            >Create Account</NuxtLink
        >
        <NuxtLink to="/login" class="text-blue-500 mt-4">Login</NuxtLink>

        <div v-if="data">
            <h2>Emissions Data</h2>
            <pre>{{ data }}</pre>
        </div>
    </div>
</template>
