import connectDB from "../../../lib/mongodb";
import Book from "../../../models/Book";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const rawBooks = await Book.find({}).sort({ createdAt: -1 }).lean();
    const books = rawBooks.map((b: any) => ({
      ...b,
      // Older documents may not have these fields; keep UI usable.
      available: b.available ?? true,
      requestedBy: b.requestedBy ?? null,
    }));
    return NextResponse.json({ books });
  } catch (err) {
    console.error("GET /api/books error:", err);
    // Avoid breaking the UI on initial load if DB auth/network is misconfigured.
    // Surface the error, but return a successful response with an empty list.
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ books: [], dbError: message });
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();

    await connectDB();

    const book = await Book.create({
      title: body.title,
      author: body.author,
      genre: body.genre || "General",
      condition: body.condition || "Good",
      ownerId: body.ownerId || "demoUser",

      // FORCE these fields
      available: true,
      requestedBy: null,
    });

    return NextResponse.json({ book });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add book" },
      { status: 500 }
    );
  }
}