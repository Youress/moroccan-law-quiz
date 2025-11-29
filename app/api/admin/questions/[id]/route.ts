import { getQuestionById, updateQuestion, deleteQuestion } from "@/lib/admin"
import { NextResponse } from "next/server"

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const question = await getQuestionById(id)

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({ question })
  } catch (error) {
    console.error("Error fetching question:", error)
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 })
  }
}

export async function PUT(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { text, explanation, examTag, isActive, answers } = body

    // Validation
    if (!text || !answers || answers.length < 2) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const validAnswers = answers.filter((a: any) => a.text.trim())
    const correctAnswers = validAnswers.filter((a: any) => a.isCorrect)

    if (correctAnswers.length === 0) {
      return NextResponse.json({ error: "At least one correct answer is required" }, { status: 400 })
    }

    const question = await updateQuestion(id, {
      text,
      explanation: explanation || undefined,
      examTag: examTag || undefined,
      isActive: isActive ?? true,
      answers: validAnswers,
    })

    return NextResponse.json({ question })
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteQuestion(id)
    return NextResponse.json({ message: "Question deleted successfully" })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}