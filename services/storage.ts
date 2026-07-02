import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "./supabase";

export async function uploadClothingImage(localUri: string): Promise<string> {
  // Ucitaj fajl kao base64
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Generisi jedinstveno ime fajla
  const fileExt = localUri.split(".").pop() ?? "jpg";
  const fileName = `${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("clothing-images")
    .upload(fileName, decode(base64), {
      contentType: `image/${fileExt}`,
    });

  if (error) throw error;

  // Uzmi javni URL za upload-ovanu sliku
  const { data } = supabase.storage
    .from("clothing-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
