import { createQuestion } from "@/lib/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { text, explanation , examTag, isActive, answers } = body

    // Validation
    if (!text  || !answers || answers.length < 2) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const validAnswers = answers.filter((a: any) => a.text.trim())
    const correctAnswers = validAnswers.filter((a: any) => a.isCorrect)

    if (correctAnswers.length === 0) {
      return NextResponse.json({ error: "At least one correct answer is required" }, { status: 400 })
    }

    const question = await createQuestion({
      text,
      explanation: explanation || undefined,
      examTag: examTag || undefined,
      isActive: isActive ?? true,
      answers: validAnswers,
    })

    return NextResponse.json({ question })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
