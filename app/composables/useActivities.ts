// Composable for creating activities from the dashboard input sheet via server RPC.
// Uses add_activity() PostgreSQL function (you must create it) which:
//  - looks up emission factor by key
//  - computes emission
//  - inserts into activities & fires triggers (streak, quests, badges)
// Returns inserted row.


type RawFormPayload = {
  category: string;
  food: null | { subcategory: string; amountKg: number | null };
  transport: null | { mode: string; durationHours: number; durationMinutes: number; totalMinutes: number };
  electricity: null | { kWh: number | null };
  waste: null | { amountKg: number | null };
};

export interface ActivityInsertResult {
  id: string;
  user_id: string;
  type: string;
  category: string;
  quantity: number;
  unit: string;
  emission_kg: number;
  meta: Record<string, unknown> | null;
  created_at: string;
}

// Rough average speeds (km/h) for converting duration to distance – simplistic placeholder.
const AVG_SPEED_KMH: Record<string, number> = {
  Car: 50,
  'Walk/Ride': 5,
  Bus: 30,
  Train: 60,
  Tram: 25,
  Plane: 800,
};

// Map UI selections to emission factor keys stored in emission_factors.
function factorKeyFor(payload: RawFormPayload): string {
  if (payload.food) {
    switch (payload.food.subcategory) {
      case 'Red Meat': return 'food.red_meat.kg';
      case 'White Meat': return 'food.white_meat.kg';
      case 'Dairy': return 'food.dairy.kg';
      case 'Baked Goods': return 'food.baked_goods.kg';
      case 'Fruit/Veg.': return 'food.fruit_veg.kg';
    }
  } else if (payload.transport) {
    switch (payload.transport.mode) {
      case 'Car': return 'transport.car.km.petrol';
      case 'Walk/Ride': return 'transport.walk_ride.km';
      case 'Bus': return 'transport.bus.km';
      case 'Train': return 'transport.train.km';
      case 'Tram': return 'transport.tram.km';
      case 'Plane': return 'transport.plane.km';
    }
  } else if (payload.electricity) {
    return 'energy.electricity.kwh';
  } else if (payload.waste) {
    return 'waste.mixed.kg';
  }
  return '';
}

function round2(n: number) { return Math.round(n * 100) / 100; }

export function useActivities() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function addFromForm(raw: RawFormPayload) {
    error.value = null;
    if (!user.value) {
      error.value = 'Not authenticated';
      return null;
    }
    try {
      loading.value = true;
      let category = '';
      let quantity = 0;
      let unit = '';
      let type = '';
      let meta: Record<string, unknown> = {};

  if (raw.food) {
        category = 'food';
        unit = 'kg';
        type = raw.food.subcategory || 'food';
        quantity = Number(raw.food.amountKg || 0);
        meta = raw.food;
      } else if (raw.transport) {
        category = 'transport';
        type = raw.transport.mode;
        // Convert duration -> hours -> km
        const totalMinutes = raw.transport.totalMinutes;
        const hours = totalMinutes / 60;
        const speed = AVG_SPEED_KMH[raw.transport.mode] ?? 0;
        const distanceKm = hours * speed;
        quantity = round2(distanceKm);
        unit = 'km';
        meta = raw.transport;
      } else if (raw.electricity) {
        category = 'energy';
        type = 'electricity';
        unit = 'kWh';
        quantity = Number(raw.electricity.kWh || 0);
        meta = raw.electricity;
      } else if (raw.waste) {
        category = 'waste';
        type = 'waste';
        unit = 'kg';
        quantity = Number(raw.waste.amountKg || 0);
        meta = raw.waste;
      } else {
        throw new Error('Unsupported activity payload');
      }

      if (!quantity || quantity <= 0) {
        throw new Error('Quantity must be > 0');
      }

      const newId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
        ? (crypto as any).randomUUID()
        : Math.random().toString(36).slice(2);

      const factorKey = factorKeyFor(raw);
      if (!factorKey) throw new Error('No emission factor key resolved');

      // RPC call performs calculation + insert. (Ensure SQL function exists.)
      const { data, error: dbError } = await (supabase as any)
        .rpc('add_activity', {
          p_factor_key: factorKey,
          p_quantity: quantity,
          p_type: type,
          p_category: category,
            p_unit: unit,
          p_meta: meta,
        });

      if (dbError) throw dbError;
      return data;
    } catch (e: any) {
      error.value = e.message || 'Failed to add activity';
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { addFromForm, loading, error };
}
