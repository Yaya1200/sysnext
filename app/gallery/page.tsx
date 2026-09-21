import { createClient } from "../../lib/supabase/server";

interface GalleryImage {
  id: number;
  name: string;
  url: string;
  storage_path: string;
  category: string;
  created_at: string;
}

export default async function GalleryPage() {
  let images: GalleryImage[] = [];

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gallery fetch error:", error.message);
    } else {
      images = data || [];
    }
  } catch (error) {
    console.error("Gallery page error:", error);
  }

  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="bg-slate-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-sm text-slate-500">
            Home -{" "}
            <span className="font-semibold text-slate-700">
              Gallery
            </span>
          </div>

          <h1 className="mt-4 text-4xl font-bold text-slate-900">
            Gallery
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Explore our projects, activities, events, and technology
            solutions.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {images.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                No gallery images yet
              </h2>

              <p className="mt-3 text-slate-600">
                Images added from the admin dashboard will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Details */}
                  <div className="p-5">
                    <h2 className="text-lg font-bold text-slate-900">
                      {image.name}
                    </h2>

                    {image.category && (
                      <p className="mt-1 text-sm capitalize text-slate-500">
                        {image.category}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}