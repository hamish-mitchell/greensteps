// Fetches aggregated metrics for the dashboard via RPC dashboard_summary()
// Expects a Postgres function: dashboard_summary() RETURNS json (see SQL in assistant response)

interface DashboardSummaryData {
  total_emitted_kg: number;
  total_saved_kg: number;
  net_kg: number;
  month_emitted_kg: number;
  month_saved_kg: number;
  transport_km_month: number;
  energy_kwh_month: number;
  waste_kg_month: number;
  food_kg_month: number;
  baseline_annual_kg: number;
  baseline_to_date_kg: number;
  variance_vs_baseline_kg: number;
  streak: number;
  updated_at: string;
}

export function useDashboardSummary() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const loading = ref(false);
  const error = ref<string | null>(null);
  const data = ref<DashboardSummaryData | null>(null);

  async function refresh() {
    if (!user.value) return;
    loading.value = true;
    error.value = null;
    const { data: rpcData, error: rpcError } = await (supabase as any).rpc('dashboard_summary');
    if (rpcError) {
      error.value = rpcError.message;
    } else if (rpcData) {
      data.value = rpcData as DashboardSummaryData;
    }
    loading.value = false;
  }

  watch(() => user.value?.id, (id) => { if (id) refresh(); }, { immediate: true });

  return { data, loading, error, refresh };
}
