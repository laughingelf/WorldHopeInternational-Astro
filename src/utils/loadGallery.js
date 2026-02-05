export async function loadGallery() {
  const res = await fetch("/content/gallery.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Missing gallery content");
  return res.json();
}
