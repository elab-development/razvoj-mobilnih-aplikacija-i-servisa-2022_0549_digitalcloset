import { ClothingItem, Outfit } from "../types/database";
import { supabase } from "./supabase";

// Ucitaj sve autfite ulogovanog korisnika, sortirano po datumu
export async function getOutfits() {
  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .order("datum", { ascending: false });

  if (error) throw error;
  return data as Outfit[];
}

// Ucitaj jedan autfit po ID-u
export async function getOutfitById(id: string) {
  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Outfit;
}

// Ucitaj komade odece koji pripadaju odredjenom autfitu
// (spaja outfit_items sa clothing_items da dobijemo pune podatke o odeci)
export async function getOutfitItems(outfitId: string) {
  const { data, error } = await supabase
    .from("outfit_items")
    .select("id, clothing_item_id, clothing_items(*)")
    .eq("outfit_id", outfitId);

  if (error) throw error;
  // clothing_items dolazi kao ugnjezdeni objekat - izvlacimo ga u ravnu listu
  return (data ?? []).map((row: any) => row.clothing_items as ClothingItem);
}

// Kreiraj novi autfit
export async function createOutfit(outfit: {
  datum: string; // format 'YYYY-MM-DD'
  naziv?: string;
  napomena?: string;
}) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Korisnik nije ulogovan");

  const { data, error } = await supabase
    .from("outfits")
    .insert({ ...outfit, user_id: userData.user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Outfit;
}

// Dodaj komad odece u autfit (many-to-many veza)
export async function addItemToOutfit(
  outfitId: string,
  clothingItemId: string,
) {
  const { error } = await supabase
    .from("outfit_items")
    .insert({ outfit_id: outfitId, clothing_item_id: clothingItemId });

  if (error) throw error;
}

// Obrisi autfit (outfit_items se brisu automatski preko "on delete cascade")
export async function deleteOutfit(id: string) {
  const { error } = await supabase.from("outfits").delete().eq("id", id);
  if (error) throw error;
}
// Ucitaj sve autfite SA slikama njihovih komada (za prikaz na Planer listi)
export async function getOutfitsWithItems() {
  const outfits = await getOutfits();

  const outfitsWithImages = await Promise.all(
    outfits.map(async (outfit) => {
      const items = await getOutfitItems(outfit.id);
      const itemImages = items
        .map((item) => item.image_url)
        .filter(Boolean) as string[];
      return { ...outfit, itemImages };
    }),
  );

  return outfitsWithImages;
}
