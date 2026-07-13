const logger = require('../config/logger')

/**
 * AI service — uses OpenAI when configured, otherwise returns graceful stubs.
 * All callers receive the same shape regardless of whether the API key is set.
 * Configure OPENAI_API_KEY in your environment to enable real AI responses.
 */

const hasOpenAI = Boolean(process.env.OPENAI_API_KEY)

let openai = null
if (hasOpenAI) {
  try {
    const { OpenAI } = require('openai')
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  } catch {
    logger.warn('[AI] openai package not installed — AI features will use stubs')
  }
}

const chatComplete = async (messages, model = 'gpt-4o-mini') => {
  if (!openai) {
    logger.debug('[AI] OpenAI not configured — returning stub response')
    return '[AI feature requires OPENAI_API_KEY configuration]'
  }
  const resp = await openai.chat.completions.create({ model, messages, temperature: 0.7 })
  return resp.choices[0].message.content
}

/**
 * Generate a plain-text summary for a course.
 */
const generateCourseSummary = async (course) => {
  const prompt = [
    { role: 'system', content: 'You are a helpful e-learning assistant. Summarise the given course in 2-3 engaging sentences for a student deciding whether to enrol. Be specific and highlight what makes this course valuable.' },
    { role: 'user', content: `Course: "${course.title}"\nDescription: ${course.description}\nLevel: ${course.level}\nCategory: ${course.category}` },
  ]
  return chatComplete(prompt)
}

/**
 * Generate N quiz questions from lecture content text.
 */
const generateQuizQuestions = async (lectureTitle, contentHint, count = 5) => {
  if (!openai) {
    return Array.from({ length: count }, (_, i) => ({
      text: `Sample question ${i + 1} about "${lectureTitle}"`,
      aiGenerated: true,
      options: [
        { text: 'Correct answer', isCorrect: true },
        { text: 'Wrong answer A', isCorrect: false },
        { text: 'Wrong answer B', isCorrect: false },
        { text: 'Wrong answer C', isCorrect: false },
      ],
      explanation: 'This is a stub explanation — configure OPENAI_API_KEY for real questions.',
    }))
  }

  const prompt = [
    { role: 'system', content: 'You are an e-learning content creator. Return ONLY a valid JSON array of quiz question objects. Each object must have: text (string), options (array of exactly 4 objects with {text, isCorrect}), explanation (string). isCorrect must be true for exactly one option per question.' },
    { role: 'user', content: `Generate ${count} multiple-choice questions for a lecture titled "${lectureTitle}". ${contentHint ? `Context: ${contentHint}` : ''}` },
  ]

  const raw = await chatComplete(prompt)
  try {
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim()
    const parsed = JSON.parse(clean)
    if (!Array.isArray(parsed)) throw new Error('Not an array')
    return parsed.map((q) => ({ ...q, aiGenerated: true }))
  } catch {
    logger.warn('[AI] Failed to parse quiz JSON from OpenAI response')
    return []
  }
}

/**
 * Generate course recommendations for a student.
 * Returns categories/topics the student should explore.
 */
const generateRecommendations = async (completedCourses, enrolledCategories) => {
  if (!openai) {
    return {
      topics: ['Data Science', 'Web Development', 'DevOps'],
      reason: 'Explore these popular categories to expand your skills. Configure OPENAI_API_KEY for personalised recommendations.',
    }
  }

  const prompt = [
    { role: 'system', content: 'You are a personalised learning advisor. Recommend 3 course topics for a student based on their history. Return JSON: { topics: string[], reason: string }' },
    { role: 'user', content: `Completed courses: ${completedCourses.join(', ') || 'none'}. Enrolled categories: ${enrolledCategories.join(', ') || 'none'}.` },
  ]

  const raw = await chatComplete(prompt)
  try {
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return { topics: [], reason: raw }
  }
}

/**
 * AI Tutor chatbot — context-aware, scoped to the current course/lecture.
 * history is an array of { role: 'user'|'assistant', content: string }.
 */
const chatWithTutor = async (courseTitle, lectureTitle, userMessage, history = []) => {
  const systemPrompt = `You are an AI Tutor for the e-learning platform EduNext. The student is currently taking the course "${courseTitle}"${lectureTitle ? ` and is on the lecture "${lectureTitle}"` : ''}.

Your role:
- Answer questions clearly and concisely, scoped to this course context.
- If a question is completely unrelated to the course, politely redirect back to the course topic.
- Never provide answers to quiz questions — encourage students to try themselves first.
- Keep responses under 300 words unless the question genuinely requires more detail.
- Use encouraging, supportive language appropriate for a learner.`

  if (!openai) {
    return `I'm your AI Tutor for "${courseTitle}". I'm not fully configured yet — ask your instructor or add an OpenAI API key to enable real AI responses. Your question was: "${userMessage}"`
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10),
    { role: 'user', content: userMessage },
  ]

  const reply = await chatComplete(messages)
  logger.debug(`[AI Chat] Course: ${courseTitle} | Lecture: ${lectureTitle || 'none'} | Response length: ${reply.length}`)
  return reply
}

module.exports = {
  generateCourseSummary,
  generateQuizQuestions,
  generateRecommendations,
  chatWithTutor,
  hasOpenAI,
}
