"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SavedAddress, OrderAddress } from "@/lib/types";
import { Trash2, Star } from "lucide-react";

const emptyAddress: OrderAddress = {
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
};

export function AddressesClient() {
  const supabase = createClient();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState("Home");
  const [form, setForm] = useState<OrderAddress>(emptyAddress);
  const [message, setMessage] = useState("");

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("saved_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });
    setAddresses(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const isFirst = addresses.length === 0;
    const { error } = await supabase.from("saved_addresses").insert({
      user_id: user.id,
      label,
      ...form,
      is_default: isFirst,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setForm(emptyAddress);
      setLabel("Home");
      setMessage("Address saved!");
      await load();
    }
    setSaving(false);
  };

  const setDefault = async (id: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("saved_addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("saved_addresses").update({ is_default: true }).eq("id", id);
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("saved_addresses").delete().eq("id", id);
    await load();
  };

  if (loading) return <p className="text-gray-500">Loading addresses...</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Saved Addresses</h2>
        {addresses.length > 0 ? (
          <div className="mt-4 space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {addr.label}
                      {addr.is_default && (
                        <span className="ml-2 text-xs text-brand-800">Default</span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">{addr.full_name}</p>
                    <p className="text-sm text-gray-600">
                      {addr.address_line1}, {addr.city} - {addr.pincode}
                    </p>
                    <p className="text-sm text-gray-500">{addr.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    {!addr.is_default && (
                      <button
                        type="button"
                        onClick={() => setDefault(addr.id)}
                        className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-800"
                        title="Set as default"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(addr.id)}
                      className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No saved addresses yet.</p>
        )}
      </div>

      <form onSubmit={handleSave} className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-semibold">Add New Address</h3>
        {message && <p className="text-sm text-brand-800">{message}</p>}
        <Input
          label="Label (e.g. Home, Office)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
        <Input
          label="Full Name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <Input
          label="Address Line 1"
          value={form.address_line1}
          onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
          required
        />
        <Input
          label="Address Line 2"
          value={form.address_line2 || ""}
          onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
          <Input
            label="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            required
          />
        </div>
        <Input
          label="Pincode"
          value={form.pincode}
          onChange={(e) => setForm({ ...form, pincode: e.target.value })}
          required
        />
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Address"}
        </Button>
      </form>
    </div>
  );
}
