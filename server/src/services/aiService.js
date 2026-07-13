const logger = require('../config/logger')

/**
 * AI service — uses OpenAI when configured, otherwise returns graceful stubs.
 * All callers receive the same shape regardless of whether the API key is set.
 */

const hasOpenAI = Boolean(process.env.OPENAI_API_KEY)

let openai = null
if (hasOpenAI) {
  const { OpenAI } = require('openai')
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const chatComplete = async (messages, model = 'gpt-4o-mini') => {
  if (!openai) {
    logger.debug('[AI] OpenAI not configured — returning stub response')
    return '[AI feature requires OpenAI API key configuration]'
  }
  const resp = await openai.chat.completions.create({ model, messages, temperature: 0.7 })
  return resp.choices[0].message.content
}

/**
 * Generate a plain-text summary for a course.
 */
const generateCourseSummary = async (course) => {
  const prompt = [
    { role: 'system', content: 'You are a helpful e-learning assistant. Summarise the given course in 2-3 engaging sentences for a student deciding whether to enrol.' },
    { role: 'user', content: `Course: "${course.title}"\nDescription: ${course.description}\nLevel: ${course.level}\nCategory: ${course.category}` },
  ]
  return chatComplete(prompt)
}

/**
 * Generate N quiz questions from lecture content text.
 */
const generateQuizQuestions = async (lectureTitle, contentHint, count = 5) => {
  if (!openai) {
    // Return stub questions so the route still works
    return Array.from({ length: count }, (_, i) => ({
      text: `Sample question ${i + 1} about "${lectureTitle}"`,
      aiGenerated: true,
      options: [
        { text: 'Correct answer', isCorrect: true },
        { text: 'Wrong answer A', isCorrect: false },
        { text: 'Wrong answer B', isCorrect: false },
        { text: 'Wrong answer C', isCorrect: false },
      ],
      explanation: 'This is a stub explanation.',
    }))
  }

  const prompt = [
    { role: 'system', content: 'You are an e-learning content creator. Return ONLY a valid JSON array of quiz question objects. Each object must have: text (string), options (array of {text, isCorrect}), explanation (string). isCorrect must be true for exactly one option.' },
    { role: 'user', content: `Generate ${count} multiple-choice questions for a lecture titled "${lectureTitle}". ${contentHint ? `Context: ${contentHint}` : ''}` },
  ]

  const raw = await chatComplete(prompt)
  try {
    const parsed = JSON.parse(raw)
    return parsed.map((q) => ({ ...q, aiGenerated: true }))
  } catch {
    logger.warn('[AI] Failed to parse quiz JSON from OpenAI response')
    return []
  }
}

/**
 * Generate course recommendations for a student.
 * Returns an array of category/topic strings the student should explore.
 */
const generateRecommendations = async (completedCourses, enrolledCategories) => {
  if (!openai) {
    return { topics: ['Data Science', 'Web Development', 'DevOps'], reason: 'Stub recommendations — configure OpenAI for personalised suggestions.' }
  }

  const prompt = [
    { role: 'system', content: 'You are a personalised learning advisor. Recommend 3 course topics for a student based on their history. Return JSON: { topics: string[], reason: string }' },
    { role: 'user', content: `Completed courses: ${completedCourses.join(', ') || 'none'}. Enrolled categories: ${enrolledCategories.join(', ') || 'none'}.` },
  ]

  const raw = await chatComplete(prompt)
  try {
    return JSON.parse(raw)
  } catch {
    return { topics: [], reason: raw }
  }
}

module.exports = { generateCourseSummary, generateQuizQuestions, generateRecommendations, hasOpenAI }
