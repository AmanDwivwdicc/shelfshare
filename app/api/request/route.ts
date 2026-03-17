import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Book from "../../../models/Book";

export async function POST(req: Request) {
  try {
    const { bookId, user } = await req.json();

    await connectDB();

    const book = await Book.findById(bookId);

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (!book.available) {
      return NextResponse.json({ error: "Already requested" }, { status: 400 });
    }

    book.available = false;
    book.requestedBy = user;

    await book.save();

    return NextResponse.json({ message: "Book requested successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}