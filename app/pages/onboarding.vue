<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Home, Car, Leaf, CheckCircle2 } from 'lucide-vue-next';

definePageMeta({
  layout: 'app-shell',
  tagline: 'Tell us a little about your household & lifestyle so we can personalise your impact.'
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const loading = ref(true);
const submitting = ref(false);
const error = ref<string|null>(null);
const step = ref(0);

// Ordered steps definition (with icons)
const steps = [
  { key: 'household', title: 'Household', description: 'Where & how you live', icon: Home },
  { key: 'transport', title: 'Transport', description: 'How you get around', icon: Car },
  { key: 'lifestyle', title: 'Lifestyle', description: 'Daily habits & habits', icon: Leaf },
  { key: 'review', title: 'Review', description: 'Check & finish', icon: CheckCircle2 }
];

// Form state reflecting profiles columns we care about
interface FormState {
  household_size?: number;
  home_type: string;
  heating_type: string;
  green_power_percent?: number;
  diet_type: string;
  car_ownership?: boolean;
  car_make: string;
  car_model: string;
  car_fuel_type: string;
  car_year?: number;
  avg_weekly_car_km?: number;
  avg_weekly_pt_km?: number;
  flights_short_haul_per_year?: number;
  flights_long_haul_per_year?: number;
  recycles?: boolean;
  composts?: boolean;
  postcode: string;
}

const form = reactive<FormState>({
  household_size: undefined,
  home_type: '',
  heating_type: '',
  green_power_percent: undefined,
  diet_type: '',
  car_ownership: undefined,
  car_make: '',
  car_model: '',
  car_fuel_type: '',
  car_year: undefined,
  avg_weekly_car_km: undefined,
  avg_weekly_pt_km: undefined,
  flights_short_haul_per_year: undefined,
  flights_long_haul_per_year: undefined,
  recycles: undefined,
  composts: undefined,
  postcode: ''
});

// Vehicle search state
interface Vehicle { name: string; tailpipe_co2: number; }
const vehicles = ref<Vehicle[]>([]);
const vehiclesLoaded = ref(false);
const vehicleSearch = ref('');
const selectedVehicleName = ref('');
const vehicleLoading = ref(false);

async function loadVehicles() {
  if (vehiclesLoaded.value || vehicleLoading.value) return;
  if (!import.meta.client) return; // only client-side
  try {
    vehicleLoading.value = true;
    const res = await fetch('/vehicles.csv');
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    // remove header
    const dataLines = lines.slice(1);
    vehicles.value = dataLines.map(line => {
      const idx = line.lastIndexOf(',');
      if (idx === -1) return null as unknown as Vehicle;
      const name = line.slice(0, idx).trim();
      const co2Raw = line.slice(idx + 1).trim();
      return { name, tailpipe_co2: Number(co2Raw || '0') } as Vehicle;
    }).filter(v => v && v.name);
    vehiclesLoaded.value = true;
  } catch (e) {
    console.error('Failed to load vehicles.csv', e);
  } finally {
    vehicleLoading.value = false;
  }
}

// Filter logic (case-insensitive contains)
const filteredVehicles = computed(() => {
  const q = vehicleSearch.value.trim().toLowerCase();
  if (!q) return vehicles.value.slice(0, 50); // initial shortlist
  return vehicles.value.filter(v => v.name.toLowerCase().includes(q)).slice(0, 200);
});

watch([() => form.car_ownership, step], ([own]) => {
  if (own && (steps[step.value] as typeof steps[number]).key === 'transport') loadVehicles();
});

watch(selectedVehicleName, (val) => {
  if (!val) return;
  const brand = val.split(' ')[0];
  form.car_make = brand;
  form.car_model = val.replace(/^\s*"?/, '').replace(new RegExp('^' + brand + '\\s*'), '').trim();
});

// Preload existing profile (user may return to onboarding)
async function loadProfile() {
  if (!user.value?.id) return;
  loading.value = true;
  const { data, error: profileError } = await supabase
    .from('profiles')
    .select('household_size, home_type, heating_type, green_power_percent, diet_type, car_ownership, car_make, car_model, car_fuel_type, car_year, avg_weekly_car_km, avg_weekly_pt_km, flights_short_haul_per_year, flights_long_haul_per_year, recycles, composts, postcode, onboarding_completed')
    .eq('id', user.value.id)
    .single();
  if (profileError) {
    error.value = profileError.message;
  } else if (data) {
    Object.entries(data).forEach(([k,v]) => {
      // @ts-expect-error dynamic assign
      form[k] = v ?? (typeof form[k as keyof FormState] === 'string' ? '' : undefined);
    });
    // If user somehow already completed, push to dashboard
  if ((data as { onboarding_completed?: boolean }).onboarding_completed) navigateTo('/dashboard');
  }
  loading.value = false;
}

watch(() => user.value?.id, (id) => { if (id) loadProfile(); }, { immediate: true });

const progress = computed(() => Math.round(((step.value + 1) / steps.length) * 100));
// steps array is static & non-empty
const currentStep = computed(() => (steps[step.value] as typeof steps[number]));

function next() { if (step.value < steps.length - 1) step.value++; }
function prev() { if (step.value > 0) step.value--; }

const showReview = computed(() => (steps[step.value] as typeof steps[number]).key === 'review');

async function submit() {
  submitting.value = true;
  error.value = null;
  if (!user.value?.id) return; // safety
  const payload: Record<string, unknown> = { ...form, onboarding_completed: true };
  // Use upsert via any to bypass generated types if not present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client: any = supabase;
  const { error: updateError } = await client.from('profiles').upsert({ id: user.value.id, ...payload }, { onConflict: 'id' });
  submitting.value = false;
  if (updateError) {
    error.value = updateError.message;
    return;
  }
  navigateTo('/dashboard');
}

// Basic required checks per step (soft requirements; user can skip some optional fields)
const stepValid = computed(() => {
  const key = (steps[step.value] as typeof steps[number]).key;
  if (key === 'household') return form.household_size !== undefined && !!form.home_type && form.green_power_percent !== undefined;
  if (key === 'transport') return form.car_ownership !== undefined;
  if (key === 'lifestyle') return !!form.diet_type && form.recycles !== undefined && form.composts !== undefined;
  return true; // review
});
</script>

<template>
  <div class="space-y-8 relative">
    <!-- Decorative background -->
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
  <div class="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-300/20 via-emerald-500/10 to-transparent blur-3xl" />
  <div class="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-400/10 via-emerald-600/10 to-transparent blur-2xl" />
    </div>

    <!-- Header & progress -->
    <div class="flex flex-col gap-4">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">Getting to know you</h1>
          <p class="text-muted-foreground text-sm mt-1">Step {{ step + 1 }} of {{ steps.length }} · {{ currentStep.title }}</p>
        </div>
        <div class="text-xs font-medium px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{{ progress }}%</div>
      </div>
      <!-- Step navigation pills -->
      <ol class="flex flex-wrap gap-2">
        <li v-for="(s,i) in steps" :key="s.key">
          <button
            class="group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition
              hover:bg-emerald-50 dark:hover:bg-emerald-500/10
              "
            :class="[
              i === step ? 'bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500 shadow-sm' :
              i < step ? 'border-emerald-400 text-emerald-600 dark:text-emerald-400' : 'border-border text-muted-foreground'
            ]"
            type="button"
            @click="i < step ? step = i : null"
          >
            <component :is="s.icon" class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">{{ s.title }}</span>
          </button>
        </li>
      </ol>
      <!-- Progress bar -->
      <div class="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500" :style="{ width: progress + '%' }" />
      </div>
    </div>

    <div v-if="loading" class="p-16 text-center text-muted-foreground animate-pulse">Loading profile...</div>
    <div v-else class="transition-opacity duration-300">
      <Card class="backdrop-blur supports-[backdrop-filter]:bg-background/70 shadow-lg border-emerald-500/20">
        <CardHeader class="pb-4">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <component :is="currentStep.icon" class="h-5 w-5" />
            </div>
            <div>
              <CardTitle class="leading-tight">{{ currentStep.title }}</CardTitle>
              <CardDescription>{{ currentStep.description }}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-8">
          <!-- Household Step -->
          <div v-if="(steps[step] as typeof steps[number]).key==='household'" class="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Household size *</Label>
              <Input v-model.number="form.household_size" type="number" min="1" placeholder="e.g. 3" />
            </div>
            <div>
              <Label>Home type *</Label>
              <select v-model="form.home_type" class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="" disabled>Select</option>
                <option value="apartment">Apartment</option>
                <option value="detached">Detached house</option>
                <option value="semi_detached">Semi-detached / townhouse</option>
              </select>
            </div>
            <div>
              <Label>Heating type</Label>
              <select v-model="form.heating_type" class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="" disabled>Select</option>
                <option value="electric">Electric</option>
                <option value="gas">Gas</option>
                <option value="wood">Wood</option>
                <option value="heat_pump">Heat pump</option>
              </select>
            </div>
            <div>
              <Label>Green power subscription (%) *</Label>
              <Input v-model.number="form.green_power_percent" type="number" min="0" max="100" placeholder="e.g. 50" />
            </div>
            <div class="md:col-span-2">
              <Label>Postcode</Label>
              <Input v-model="form.postcode" placeholder="e.g. 3000" />
            </div>
          </div>

          <!-- Transport Step -->
          <div v-if="(steps[step] as typeof steps[number]).key==='transport'" class="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Do you own / regularly use a car? *</Label>
              <select v-model="form.car_ownership" class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option :value="null" disabled>Select</option>
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div>
            <template v-if="form.car_ownership">
              <div>
                <Label>Fuel type</Label>
                <select v-model="form.car_fuel_type" class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" disabled>Select</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
              <div>
                <Label>Year</Label>
                <Input v-model.number="form.car_year" type="number" min="1980" max="2100" placeholder="e.g. 2018" />
              </div>
              <div class="md:col-span-3 grid gap-4 md:grid-cols-3">
                <div class="md:col-span-3 space-y-2">
                  <Label>Select your vehicle</Label>
                  <div class="space-y-3">
                    <div class="relative">
                      <Input
                        v-model="vehicleSearch"
                        type="text"
                        placeholder="Search make or model (e.g. Tesla Model 3)"
                        class="pr-10"
                        @focus="loadVehicles()"
                      />
                      <div class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        <span v-if="vehicleLoading" class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        <span v-else>{{ filteredVehicles.length }}</span>
                      </div>
                    </div>
                    <!-- When results small (<=15) show select -->
                    <div v-if="filteredVehicles.length && filteredVehicles.length <= 15" class="space-y-1">
                      <select
                        v-model="selectedVehicleName"
                        size="15"
                        class="w-full text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option v-for="v in filteredVehicles" :key="v.name" :value="v.name">{{ v.name }}</option>
                      </select>
                    </div>
                    <!-- Else show scrollable suggestion list (limit) -->
                    <div
                      v-else-if="vehicleSearch && filteredVehicles.length > 0"
                      class="max-h-64 overflow-auto rounded-md border bg-background shadow-inner divide-y"
                    >
                      <button
                        v-for="v in filteredVehicles"
                        :key="v.name"
                        type="button"
                        class="w-full text-left px-3 py-1.5 text-sm hover:bg-emerald-500/10 focus:bg-emerald-500/20 transition"
                        @click="selectedVehicleName = v.name"
                      >
                        {{ v.name }}
                      </button>
                      <div v-if="filteredVehicles.length === 200" class="px-3 py-1 text-[10px] text-muted-foreground">Showing first 200 matches… refine search</div>
                    </div>
                    <div v-if="selectedVehicleName" class="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                      <span class="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      Selected: <strong class="font-medium">{{ selectedVehicleName }}</strong>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Weekly car km (avg)</Label>
                  <Input v-model.number="form.avg_weekly_car_km" type="number" min="0" placeholder="e.g. 150" />
                </div>
              </div>
            </template>
            <div>
              <Label>Weekly public transport km (avg)</Label>
              <Input v-model.number="form.avg_weekly_pt_km" type="number" min="0" placeholder="e.g. 40" />
            </div>
            <div>
              <Label>Short haul flights / year</Label>
              <Input v-model.number="form.flights_short_haul_per_year" type="number" min="0" placeholder="e.g. 2" />
            </div>
            <div>
              <Label>Long haul flights / year</Label>
              <Input v-model.number="form.flights_long_haul_per_year" type="number" min="0" placeholder="e.g. 1" />
            </div>
          </div>

          <!-- Lifestyle Step -->
          <div v-if="(steps[step] as typeof steps[number]).key==='lifestyle'" class="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Diet *</Label>
              <select v-model="form.diet_type" class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="" disabled>Select</option>
                <option value="omnivore">Omnivore</option>
                <option value="reduced_meat">Reduced meat</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
            <div class="flex flex-col space-y-2">
              <Label>Recycles *</Label>
              <div class="flex items-center space-x-2">
                <input id="recycles" v-model="form.recycles" type="checkbox" class="h-4 w-4">
                <Label for="recycles">I regularly recycle household waste</Label>
              </div>
            </div>
            <div class="flex flex-col space-y-2">
              <Label>Composts *</Label>
              <div class="flex items-center space-x-2">
                <input id="composts" v-model="form.composts" type="checkbox" class="h-4 w-4">
                <Label for="composts">I compost food / green waste</Label>
              </div>
            </div>
          </div>

          <!-- Review Step -->
          <div v-if="showReview" class="space-y-6 text-sm">
            <p class="text-muted-foreground">Quick summary of what you've told us. You can go back to adjust anything.</p>
            <div class="grid md:grid-cols-2 gap-3">
              <div
                v-for="(v,k) in form"
                :key="k"
                class="group relative overflow-hidden rounded border bg-gradient-to-br from-muted/60 to-background px-3 py-2 shadow-sm hover:shadow transition"
              >
                <span class="font-medium block text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{{ k.replace(/_/g,' ') }}</span>
                <span class="text-sm font-semibold text-foreground">{{ v === null || v === '' ? '—' : v }}</span>
                <div class="absolute inset-0 opacity-0 group-hover:opacity-100 bg-emerald-500/5 pointer-events-none transition" />
              </div>
            </div>
          </div>

          <div v-if="error" class="text-sm text-red-500">{{ error }}</div>
        </CardContent>
        <CardFooter class="flex flex-col gap-4 pt-0">
          <div class="flex justify-between w-full">
            <Button variant="outline" :disabled="step===0 || submitting" @click="prev">Back</Button>
            <div class="flex gap-2">
              <Button v-if="!showReview" class="relative" :disabled="!stepValid || submitting" @click="next">
                <span>Continue</span>
              </Button>
              <Button v-else class="relative" :disabled="submitting" @click="submit">
                <span v-if="!submitting">Finish & Start</span>
                <span v-else class="flex items-center gap-2"><span class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"/>Saving...</span>
              </Button>
            </div>
          </div>
          <div class="w-full text-[10px] text-muted-foreground text-center">
            You can revisit and edit these in your profile later.
          </div>
        </CardFooter>
      </Card>
      <p class="text-xs text-muted-foreground text-center">Your answers help us tailor emissions & streak insights.</p>
    </div>
  </div>
</template>
