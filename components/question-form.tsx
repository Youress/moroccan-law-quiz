"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Category, Difficulty } from "@prisma/client"

interface Answer {
  id?: string
  text: string
  isCorrect: boolean
}

interface Question {
  id: string
  text: string
  explanation?: string
  category: Category
  difficulty: Difficulty
  examTag?: string
  isActive: boolean
  answers: Answer[]
}

interface QuestionFormProps {
  question?: Question
}

export default function QuestionForm({ question }: QuestionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    text: question?.text || "",
    explanation: question?.explanation || "",
    category: question?.category || ("" as Category),
    difficulty: question?.difficulty || ("" as Difficulty),
    examTag: question?.examTag || "",
    isActive: question?.isActive ?? true,
  })

  const [answers, setAnswers] = useState<Answer[]>(
    question?.answers || [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  )

  const categories = [
    { value: "GENERAL", label: "عام" },
    { value: "FAMILY", label: "أسرة" },
    { value: "CIVIL", label: "مدني" },
    { value: "CRIMINAL", label: "جنائي" },
    { value: "COMMERCIAL", label: "تجاري" },
    { value: "ADMINISTRATIVE", label: "إداري" },
    { value: "LABOR", label: "شغل" },
    { value: "CONSTITUTIONAL", label: "دستوري" },
    { value: "PROCEDURE", label: "مسطرة" },
  ]

  const difficulties = [
    { value: "EASY", label: "سهل", color: "bg-green-100 text-green-800" },
    { value: "MEDIUM", label: "متوسط", color: "bg-yellow-100 text-yellow-800" },
    { value: "HARD", label: "صعب", color: "bg-red-100 text-red-800" },
  ]


  const handleAnswerChange = (index: number, field: keyof Answer, value: string | boolean) => {
    const newAnswers = [...answers]
    newAnswers[index] = { ...newAnswers[index], [field]: value }
    setAnswers(newAnswers)
  }

  const addAnswer = () => {
    setAnswers([...answers, { text: "", isCorrect: false }])
  }

  const removeAnswer = (index: number) => {
    if (answers.length > 2) {
      setAnswers(answers.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation
      if (!formData.text.trim()) {
        alert("يرجى إدخال نص السؤال")
        return
      }

      if (!formData.category) {
        alert("يرجى اختيار التصنيف")
        return
      }

      if (!formData.difficulty) {
        alert("يرجى اختيار مستوى الصعوبة")
        return
      }

      const validAnswers = answers.filter((a) => a.text.trim())
      if (validAnswers.length < 2) {
        alert("يجب إدخال خيارين على الأقل")
        return
      }

      const correctAnswers = validAnswers.filter((a) => a.isCorrect)
      if (correctAnswers.length === 0) {
        alert("يجب تحديد إجابة صحيحة واحدة على الأقل")
        return
      }

      const url = question ? `/api/admin/questions/${question.id}` : "/api/admin/questions"

      const method = question ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          answers: validAnswers,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/admin/questions/${result.question.id}`)
      } else {
        const error = await response.json()
        alert(error.error || "حدث خطأ في الحفظ")
      }
    } catch (error) {
      console.error("Submit error:", error)
      alert("حدث خطأ في الحفظ")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question Details */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل السؤال</CardTitle>
          <CardDescription>أدخل نص السؤال والمعلومات الأساسية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">نص السؤال *</Label>
            <Textarea
              id="text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="أدخل نص السؤال هنا..."
              rows={4}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">التصنيف *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">مستوى الصعوبة *</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value as Difficulty })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر مستوى الصعوبة" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((diff) => (
                    <SelectItem key={diff.value} value={diff.value}>
                      <Badge className={diff.color}>{diff.label}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="examTag">امتحان محدد (اختياري)</Label>

            <Select
              value={formData.examTag}
              onValueChange={(value) =>
                setFormData({ ...formData, examTag: value })
              }
            />

            <Input
              id="examTag"
              value={formData.examTag}
              onChange={(e : any) =>
                setFormData({ ...formData, examTag: e.target.value })
              }
              placeholder=" امتحان حدد"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">تعليل الجواب (اختياري)</Label>
            <Textarea
              id="explanation"
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="أدخل تعليل الجواب الصحيح..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
            />
            <Label htmlFor="isActive">السؤال نشط</Label>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>خيارات الإجابة</CardTitle>
              <CardDescription>أدخل خيارات الإجابة وحدد الصحيح منها</CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addAnswer}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة خيار
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {answers.map((answer, index) => (
            <div key={index} className="flex items-center space-x-4 space-x-reverse p-4 border rounded-lg">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  checked={answer.isCorrect}
                  onCheckedChange={(checked) => handleAnswerChange(index, "isCorrect", checked as boolean)}
                />
                <Label className="text-sm font-medium">صحيح</Label>
              </div>

              <Input
                value={answer.text}
                onChange={(e) => handleAnswerChange(index, "text", e.target.value)}
                placeholder={`الخيار ${index + 1}`}
                className="flex-1"
              />

              {answers.length > 2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeAnswer(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Link href={question ? `/admin/questions/${question.id}` : "/admin/questions"}>
          <Button type="button" variant="outline">
            <ArrowLeft className="ml-2 h-4 w-4" />
            إلغاء
          </Button>
        </Link>

        <Button type="submit" disabled={isLoading}>
          <Save className="ml-2 h-4 w-4" />
          {isLoading ? "جاري الحفظ..." : question ? "تحديث السؤال" : "إنشاء السؤال"}
        </Button>
      </div>
    </form>
  )
}
