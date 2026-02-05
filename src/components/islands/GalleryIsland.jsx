import { useEffect, useMemo, useState } from "react";
import { loadGallery } from "../../utils/loadGallery";

function titleCase(str = "") {
  return str
    .trim()
    .split(/[\s-_]+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getTags(photo) {
  return (photo.tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function GalleryIsland() {
  const [data, setData] = useState(null);
  const [activeTag, setActiveTag] = useState("all");
  const [selected, setSelected] = useState(null);

  // viewMode:
  // - "grouped": show sections by tag (cleaner, default)
  // - "grid": show one grid (what you had)
  const [viewMode, setViewMode] = useState("grouped");

  useEffect(() => {
    loadGallery().then(setData).catch(console.error);
  }, []);

  const allTags = useMemo(() => {
    if (!data?.photos) return ["all"];
    const tags = new Set();
    data.photos.forEach((p) => {
      getTags(p).forEach((t) => tags.add(t));
    });
    return ["all", ...Array.from(tags).sort((a, b) => a.localeCompare(b))];
  }, [data]);

  const filteredPhotos = useMemo(() => {
    if (!data?.photos) return [];
    if (activeTag === "all") return data.photos;

    const active = activeTag.toLowerCase();
    return data.photos.filter((p) =>
      getTags(p).some((t) => t.toLowerCase() === active)
    );
  }, [data, activeTag]);

  // Group photos by tag (used for the "grouped" mode)
  const groupedByTag = useMemo(() => {
    if (!filteredPhotos.length) return [];

    // If "all", we want sections for every tag
    // If a specific tag is selected, we only show that one section
    const wantedTags =
      activeTag === "all"
        ? allTags.filter((t) => t !== "all")
        : [activeTag];

    const sections = wantedTags
      .map((tag) => {
        const items = filteredPhotos.filter((p) =>
          getTags(p).some((t) => t.toLowerCase() === tag.toLowerCase())
        );
        return { tag, items };
      })
      .filter((s) => s.items.length > 0);

    // Nice: sort sections by count desc, then alpha
    sections.sort((a, b) => b.items.length - a.items.length || a.tag.localeCompare(b.tag));

    return sections;
  }, [filteredPhotos, activeTag, allTags]);

  if (!data) return null;

  return (
    <>
      <section className="bg-white py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-green-900 mb-2">
                Photo Gallery
              </h1>
              <p className="text-green-800">
                Moments from clinics, schools, farms, and ministry in the community.
              </p>
            </div>

            {/* View mode toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode("grouped")}
                className={`px-4 py-2 rounded-md border text-sm font-semibold transition ${
                  viewMode === "grouped"
                    ? "bg-green-900 text-white border-green-900"
                    : "bg-white text-green-900 border-green-300 hover:bg-green-50"
                }`}
              >
                Browse by Category
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-md border text-sm font-semibold transition ${
                  viewMode === "grid"
                    ? "bg-green-900 text-white border-green-900"
                    : "bg-white text-green-900 border-green-300 hover:bg-green-50"
                }`}
              >
                All Photos
              </button>
            </div>
          </div>

          {/* Tag filter */}
          <div className="flex flex-wrap gap-3 mb-10">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-full border transition text-sm font-semibold ${
                  activeTag === tag
                    ? "bg-[#e01b24] text-white border-[#e01b24]"
                    : "bg-white text-green-900 border-green-300 hover:bg-green-50"
                }`}
              >
                {titleCase(tag)}
              </button>
            ))}
          </div>

          {/* GROUPED MODE */}
          {viewMode === "grouped" ? (
            <div className="space-y-14">
              {groupedByTag.map((section) => (
                <div key={section.tag}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-green-900">
                        {titleCase(section.tag)}
                      </h2>
                      <p className="text-green-700 text-sm mt-1">
                        {section.items.length} photo{section.items.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="text-sm font-semibold text-[#e01b24] hover:opacity-80"
                      onClick={() => {
                        setActiveTag(section.tag);
                        setViewMode("grid");
                        window?.scrollTo?.({ top: 0, behavior: "smooth" });
                      }}
                    >
                      View all →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.items.slice(0, 9).map((p, idx) => (
                      <button
                        key={p.src + idx}
                        type="button"
                        className="text-left group cursor-pointer"
                        onClick={() => setSelected(p)}
                      >
                        <div className="relative overflow-hidden rounded-lg shadow-md">
                          <img
                            src={p.src}
                            alt={p.alt || "Gallery image"}
                            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            loading="lazy"
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          />
                          {/* Hover affordance */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition">
                            <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-green-900">
                              {titleCase(section.tag)}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-green-900">
                              View
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* If more than 9, show hint */}
                  {section.items.length > 9 && (
                    <p className="text-sm text-green-700 mt-4">
                      Showing 9 of {section.items.length}. Switch to “All Photos” to see everything in this category.
                    </p>
                  )}
                </div>
              ))}

              {groupedByTag.length === 0 && (
                <p className="text-green-800">No photos found for this category.</p>
              )}
            </div>
          ) : (
            /* GRID MODE (your original grid, but cleaner cards) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotos.map((p, idx) => (
                <button
                  key={p.src + idx}
                  type="button"
                  className="text-left group cursor-pointer"
                  onClick={() => setSelected(p)}
                >
                  <div className="relative overflow-hidden rounded-lg shadow-md">
                    <img
                      src={p.src}
                      alt={p.alt || "Gallery image"}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition" />

                    {/* show tags as chips on hover */}
                    <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition">
                      {getTags(p)
                        .slice(0, 2)
                        .map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-green-900"
                          >
                            {titleCase(t)}
                          </span>
                        ))}
                      <span className="ml-auto inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-green-900">
                        View
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selected.src}
              alt={selected.alt || "Selected image"}
              className="w-full max-h-[80vh] object-contain rounded-lg shadow-xl"
            />

            {(selected.caption || selected.alt) && (
              <p className="text-white/90 mt-3 text-center">
                {selected.caption || selected.alt}
              </p>
            )}

            {/* show tags in lightbox (optional, looks premium) */}
            {getTags(selected).length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {getTags(selected).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-green-900"
                  >
                    {titleCase(t)}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-md bg-white text-black hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
