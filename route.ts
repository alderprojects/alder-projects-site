import { NextRequest, NextResponse } from "next/server";
import { FORM_ENDPOINT } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    const required = ["homeowner_name", "email", "phone", "town", "category"];
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Build the payload
    const payload = {
      homeowner_name: String(body.homeowner_name).trim(),
      email: String(body.email).trim().toLowerCase(),
      phone: String(body.phone || "").trim(),
      town: String(body.town || "").trim(),
      zip: String(body.zip || "").trim(),
      category: String(body.category || "").trim(),
      budget_band: String(body.budget_band || "").trim(),
      timeline: String(body.timeline || "").trim(),
      property_type: String(body.property_type || "").trim(),
      description: String(body.description || "").trim(),
      submitted_at: new Date().toISOString(),
    };

    // Forward to configured endpoint (Google Apps Script or similar)
    const endpoint = FORM_ENDPOINT;

    if (
      !endpoint ||
      endpoint.includes("YOUR_SCRIPT_ID") ||
      endpoint === "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
    ) {
      // Dev mode: simulate success
      console.log("[DEV] Form submission (no real endpoint set):", payload);
      return NextResponse.json(
        { success: true, message: "Received (dev mode)" },
        { status: 200 }
      );
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Upstream endpoint returned ${response.status}`);
    }

    return NextResponse.json(
      { success: true, message: "Your project request has been received." },
      { status: 200 }
    );
  } catch (err) {
    console.error("[submit] Error:", err);
    return NextResponse.json(
      {
        error:
          "Something went wrong on our end. Please try again or email us directly.",
      },
      { status: 500 }
    );
  }
}
