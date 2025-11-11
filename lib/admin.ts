import { prisma } from "./prisma"
export async function getAllQuestions(limit?: number, offset?: number) {
  return await prisma.question.findMany({
    include: {
      answers: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: offset,
  })
}

export async function getQuestionsCount() {
  return await prisma.question.count()
}

export async function getQuestionById(id: string) {
  return await prisma.question.findUnique({
    where: { id },
    include: {
      answers: true,
    },
  })
}

export async function searchQuestions(
  query: string,
  examTag?: string,
  isActive?: boolean,
) {
  const whereClause: any = {}

  if (query) {
    whereClause.text = {
      contains: query,
      mode: "insensitive",
    }
  }

 
  if (examTag) whereClause.examTag = examTag
  if (isActive !== undefined) whereClause.isActive = isActive

  return await prisma.question.findMany({
    where: whereClause,
    include: {
      answers: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function createQuestion(data: {
  text: string
  explanation?: string
  examTag?: string
  isActive?: boolean
  answers: Array<{
    text: string
    isCorrect: boolean
  }>
}) {
  return await prisma.question.create({
    data: {
      text: data.text,
      explanation: data.explanation,
      examTag: data.examTag,
      isActive: data.isActive ?? true,
      answers: {
        create: data.answers,
      },
    },
    include: {
      answers: true,
    },
  })
}

export async function updateQuestion(
  id: string,
  data: {
    text?: string
    explanation?: string
    examTag?: string
    isActive?: boolean
    answers?: Array<{
      id?: string
      text: string
      isCorrect: boolean
    }>
  },
) {
  // If answers are provided, we need to handle them separately
  if (data.answers) {
    // Delete existing answers
    await prisma.answer.deleteMany({
      where: { questionId: id },
    })

    // Create new answers
    const { answers, ...questionData } = data
    return await prisma.question.update({
      where: { id },
      data: {
        ...questionData,
        answers: {
          create: answers,
        },
      },
      include: {
        answers: true,
      },
    })
  }

  return await prisma.question.update({
    where: { id },
    data,
    include: {
      answers: true,
    },
  })
}

export async function deleteQuestion(id: string) {
  return await prisma.question.delete({
    where: { id },
  })
}

export async function toggleQuestionStatus(id: string) {
  const question = await prisma.question.findUnique({
    where: { id },
  })

  if (!question) {
    throw new Error("Question not found")
  }

  return await prisma.question.update({
    where: { id },
    data: {
      isActive: !question.isActive,
    },
  })
}
