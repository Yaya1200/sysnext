import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { products as defaultProducts } from "../../data/siteData";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json(defaultProducts);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Products GET error:", err);
    return NextResponse.json(defaultProducts);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, category, image, description, in_stock } = body;

    if (!name || price === undefined || !category) {
      return NextResponse.json({ error: "Name, price, and category are required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        price: Number(price),
        category,
        image: image || "/products/product1.jpg",
        description: description || "",
        in_stock: in_stock !== false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid product payload." }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, price, category, image, description, in_stock } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .update({
        name,
        price: Number(price),
        category,
        image,
        description,
        in_stock,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid product update payload." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
