import { ClothingItem } from "../types/database";
import { supabase } from "./supabase";

// Ucitaj svu odecu ulogovanog korisnika
export async function getClothingItems() {
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as ClothingItem[];
}

// Dodaj novi odevni predmet
export async function addClothingItem(item: {
  naziv: string;
  kategorija: string;
  boja?: string;
  sezona?: string;
  image_url?: string;
}) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Korisnik nije ulogovan");

  const { data, error } = await supabase
    .from("clothing_items")
    .insert({ ...item, user_id: userData.user.id })
    .select()
    .single();

  if (error) throw error;
  return data as ClothingItem;
}

// Izmeni postojeci predmet
export async function updateClothingItem(
  id: string,
  updates: Partial<ClothingItem>,
) {
  const { data, error } = await supabase
    .from("clothing_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ClothingItem;
}

// Obrisi predmet
export async function deleteClothingItem(id: string) {
  const { error } = await supabase.from("clothing_items").delete().eq("id", id);
  if (error) throw error;
}

// Ucitaj jedan predmet po ID-u
export async function getClothingItemById(id: string) {
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ClothingItem;
}
