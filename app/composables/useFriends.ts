export interface FriendProfile {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    total_points: number | null;
    state: string | null;
    created_at: string; // friendship creation timestamp or request timestamp
    you: boolean;
    status?: "accepted" | "pending" | "incoming";
}

export function useFriends() {
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();
    const friends = ref<FriendProfile[]>([]);
    const incoming = ref<FriendProfile[]>([]); // pending requests where current user is recipient
    const outgoing = ref<FriendProfile[]>([]); // pending requests sent
    const loading = ref(false);
    const error = ref<string | null>(null);
    const searchResults = ref<FriendProfile[]>([]);
    const searching = ref(false);
    const searchError = ref<string | null>(null);

    async function load() {
        if (!user.value) return;
        loading.value = true;
        error.value = null;
        try {
            // accepted friendships via friend_requests where user is requester or recipient and status accepted
            const { data: accepted, error: accErr } = await supabase
                .from("friend_requests")
                .select(
                    "id, status, created_at, requester_id, recipient_id, requester:profiles!friend_requests_requester_id_fkey(id, display_name, avatar_url, total_points, state), recipient:profiles!friend_requests_recipient_id_fkey(id, display_name, avatar_url, total_points, state)"
                )
                .or(
                    `requester_id.eq.${user.value.id},recipient_id.eq.${user.value.id}`
                )
                .eq("status", "accepted");
            if (accErr) throw accErr;
            const me = user.value.id;
            friends.value = (accepted || []).map((r: any) => {
                const other = r.requester_id === me ? r.recipient : r.requester;
                return {
                    id: other?.id,
                    display_name: other?.display_name || "Anon",
                    avatar_url: other?.avatar_url || null,
                    total_points: other?.total_points ?? 0,
                    state: other?.state ?? null,
                    created_at: r.created_at,
                    you: false,
                    status: "accepted",
                } as FriendProfile;
            });
            // incoming pending
            const { data: inc, error: incErr } = await supabase
                .from("friend_requests")
                .select(
                    "id, created_at, requester:profiles!friend_requests_requester_id_fkey(id, display_name, avatar_url, total_points, state)"
                )
                .eq("recipient_id", me)
                .eq("status", "pending");
            if (incErr) throw incErr;
            incoming.value = (inc || []).map((r: any) => ({
                id: r.requester?.id,
                display_name: r.requester?.display_name || "Anon",
                avatar_url: r.requester?.avatar_url || null,
                total_points: r.requester?.total_points ?? 0,
                state: r.requester?.state ?? null,
                created_at: r.created_at,
                you: false,
                status: "incoming",
            }));
            // outgoing pending
            const { data: out, error: outErr } = await supabase
                .from("friend_requests")
                .select(
                    "id, created_at, recipient:profiles!friend_requests_recipient_id_fkey(id, display_name, avatar_url, total_points, state)"
                )
                .eq("requester_id", me)
                .eq("status", "pending");
            if (outErr) throw outErr;
            outgoing.value = (out || []).map(
                (r: {
                    id: number;
                    created_at: string;
                    recipient: {
                        id: string;
                        display_name: string | null;
                        avatar_url: string | null;
                        total_points: number | null;
                        state: string | null;
                    } | null;
                }) => ({
                    id: r.recipient?.id,
                    display_name: r.recipient?.display_name || "Anon",
                    avatar_url: r.recipient?.avatar_url || null,
                    total_points: r.recipient?.total_points ?? 0,
                    state: r.recipient?.state ?? null,
                    created_at: r.created_at,
                    you: false,
                    status: "pending",
                })
            );
        } catch (e: any) {
            // If friend_requests table doesn't exist yet, gracefully fallback to old friendships table so UI still works
            if (e?.code === "42P01") {
                // undefined_table
                try {
                    const { data: fr, error: frErr } = await supabase
                        .from("friendships")
                        .select(
                            "id, friend_id, created_at, profiles:profiles!friendships_friend_id_fkey(id, display_name, avatar_url, total_points, state)"
                        )
                        .eq("user_id", user.value!.id)
                        .order("created_at", { ascending: false });
                    if (frErr) throw frErr;
                    friends.value = (fr || []).map((r: any) => ({
                        id: r.friend_id,
                        display_name: r.profiles?.display_name || "Anon",
                        avatar_url: r.profiles?.avatar_url || null,
                        total_points: r.profiles?.total_points ?? 0,
                        state: r.profiles?.state ?? null,
                        created_at: r.created_at,
                        you: false,
                        status: "accepted",
                    }));
                    incoming.value = [];
                    outgoing.value = [];
                    error.value =
                        "Friend requests table missing; using legacy friendships data. Apply migration to enable requests.";
                } catch (legacyErr: unknown) {
                    error.value =
                        legacyErr instanceof Error
                            ? legacyErr.message
                            : "Failed to load friends";
                } finally {
                    loading.value = false;
                }
                return; // exit early after fallback
            }
            error.value = e.message || "Failed to load friends";
        } finally {
            loading.value = false;
        }
    }

    async function addFriend(friendId: string) {
        if (!user.value) return;
        if (friendId === user.value.id) return; // no self friendship
        // create pending request unless already exists or reciprocal
        const { error: insErr } = await supabase
            .from("friend_requests")
            .insert({ requester_id: user.value.id, recipient_id: friendId });
        if (insErr) {
            error.value = insErr.message;
        } else {
            await load();
        }
    }

    async function removeFriend(friendId: string) {
        if (!user.value) return;
        // remove accepted friendship by resetting to pending removal? Simpler: delete accepted rows both directions.
        const { error: delErr } = await supabase
            .from("friend_requests")
            .delete()
            .or(
                `and(requester_id.eq.${user.value.id},recipient_id.eq.${friendId}),and(requester_id.eq.${friendId},recipient_id.eq.${user.value.id}))`
            )
            .eq("status", "accepted");
        if (delErr) {
            error.value = delErr.message;
        } else {
            friends.value = friends.value.filter((f) => f.id !== friendId);
        }
    }

    // Define the type for friend_requests table
    type FriendRequestRow = {
        id: number;
        requester_id: string;
        recipient_id: string;
        status: string;
        created_at: string;
    };

    async function accept(friendId: string) {
        if (!user.value) return;
        const { error: updErr } = await supabase
            .from<FriendRequestRow>("friend_requests")
            .update({ status: "accepted" })
            .eq("recipient_id", user.value.id)
            .eq("requester_id", friendId)
            .eq("status", "pending");
        if (updErr) {
            error.value = updErr.message;
        } else {
            await load();
        }
    }

    async function decline(friendId: string) {
        if (!user.value) return;
        const { error: delErr } = await supabase
            .from("friend_requests")
            .delete()
            .eq("recipient_id", user.value.id)
            .eq("requester_id", friendId)
            .eq("status", "pending");
        if (delErr) {
            error.value = delErr.message;
        } else {
            await load();
        }
    }

    async function search(term: string) {
        searchResults.value = [];
        searchError.value = null;
        if (!user.value || !term || term.trim().length < 2) return; // require 2+ chars
        searching.value = true;
        try {
            // search display_name in profiles (synced from auth metadata)
            const { data, error: sErr } = await supabase
                .from("profiles")
                .select("id, display_name, avatar_url, total_points, state")
                .ilike("display_name", `%${term}%`)
                .limit(20);
            if (sErr) throw sErr;
            const existingIds = new Set(friends.value.map((f) => f.id));
            searchResults.value = (data || [])
                .filter((p: any) => p.id !== user.value?.id) // exclude self
                .map((p: any) => ({
                    id: p.id,
                    display_name: p.display_name || "Anon",
                    avatar_url: p.avatar_url,
                    total_points: p.total_points ?? 0,
                    state: p.state,
                    created_at: "",
                    you: false,
                    alreadyFriend:
                        existingIds.has(p.id) ||
                        incoming.value.some((r) => r.id === p.id) ||
                        outgoing.value.some((r) => r.id === p.id),
                }));
        } catch (e: any) {
            searchError.value = e.message || "Search failed";
        } finally {
            searching.value = false;
        }
    }

    watch(
        () => user.value?.id,
        (id) => {
            if (id) load();
        },
        { immediate: true }
    );

    const pendingCount = computed(() => incoming.value.length);
    return {
        friends,
        incoming,
        outgoing,
        loading,
        error,
        reload: load,
        addFriend,
        removeFriend,
        accept,
        decline,
        search,
        searchResults,
        searching,
        searchError,
        pendingCount,
    };
}
