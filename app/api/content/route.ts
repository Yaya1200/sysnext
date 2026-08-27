import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import {
  heroSlides,
  services,
  partners,
  blogs,
  projects,
  teamMembers,
} from "../../data/siteData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    const supabase = await createClient();
    let query = supabase.from("content_items").select("*").order("id", { ascending: false });

    if (type) {
      query = query.eq("content_type", type);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Supabase content query warning, returning fallback defaults:", error.message);
      return NextResponse.json(getDefaultFallback(type));
    }

    // If database returned items, return them. If database has no items for this type, merge with fallback
    if (!data || data.length === 0) {
      return NextResponse.json(getDefaultFallback(type));
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Content API GET error:", err);
    return NextResponse.json(getDefaultFallback(type));
  }
}

function getDefaultFallback(type: string | null) {
  switch (type) {
    case "slider":
      return heroSlides.map((item, index) => ({
        id: item.id || index + 1,
        content_type: "slider",
        title: item.title,
        subtitle: item.subtitle,
        image: item.image,
        extra_data: { link: item.link, buttonText: item.buttonText },
      }));
    case "service":
      return services.map((item, index) => ({
        id: item.id || index + 1,
        content_type: "service",
        title: item.name,
        slug: item.slug,
        description: item.shortDescription,
        content: item.description,
        image: item.image,
        extra_data: { features: item.features },
      }));
    case "partner":
      return partners.map((item, index) => ({
        id: item.id || index + 1,
        content_type: "partner",
        title: item.name,
        image: item.logo,
        extra_data: { website: item.website },
      }));
    case "blog":
      return blogs.map((item, index) => ({
        id: item.id || index + 1,
        content_type: "blog",
        title: item.title,
        slug: item.slug,
        description: item.excerpt,
        content: item.content,
        image: item.image,
        category: item.category,
        extra_data: { author: item.author, date: item.date },
      }));
    case "project":
      return projects.map((item, index) => ({
        id: item.id || index + 1,
        content_type: "project",
        title: item.title,
        subtitle: item.client,
        description: item.description,
        image: item.image,
        category: item.category,
        extra_data: { year: item.year },
      }));
    case "team":
      return teamMembers.map((item, index) => ({
        id: item.id || index + 1,
        content_type: "team",
        title: item.name,
        subtitle: item.role,
        description: item.bio,
        image: item.image,
      }));
    default:
      return [];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content_type, title, subtitle, slug, description, content, image, category, extra_data } = body;

    if (!content_type || !title) {
      return NextResponse.json({ error: "Content type and title are required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_items")
      .insert({
        content_type,
        title,
        subtitle: subtitle || null,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        description: description || null,
        content: content || null,
        image: image || null,
        category: category || null,
        extra_data: extra_data || {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, subtitle, slug, description, content, image, category, extra_data } = body;

    if (!id) {
      return NextResponse.json({ error: "Item ID is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_items")
      .update({
        title,
        subtitle: subtitle || null,
        slug: slug || null,
        description: description || null,
        content: content || null,
        image: image || null,
        category: category || null,
        extra_data: extra_data || {},
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Item ID is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("content_items").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete item." }, { status: 500 });
  }
}
