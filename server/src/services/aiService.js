const logger = require('../config/logger')

/**
 * AI service — uses Google Gemini when configured, otherwise returns
 * graceful stubs. All callers receive the same shape regardless of whether
 * the API key is set. Configure GEMINI_API_KEY in your environment to
 * enable real AI responses.
 *
 * (Legacy note: an earlier revision used OpenAI. Gemini is now the
 * supported provider — see DECISIONS.md.)
 */

const hasGemini = Boolean(process.env.GEMINI_API_KEY)
const GEMINI_MODEL = 'gemini-2.0-flash'

let geminiModel = null
if (hasGemini) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    geminiModel = genAI.getGenerativeModel({ model: GEMINI_MODEL })
  } catch {
    logger.warn('[AI] @google/generative-ai package not installed — AI features will use stubs')
  }
}

/**
 * messages: array of { role: 'system'|'user'|'assistant', content: string }.
 * Gemini has no dedicated "system" role for chat turns, so the system
 * message is folded into the first user turn as an instruction preamble.
 */
// Thrown when Gemini is configured but the call itself failed (quota,
// network, invalid key, etc.) — distinct from "not configured at all" so
// callers can fall back to a friendly message instead of leaking the raw
// provider error (rate limits, API error JSON, etc.) to end users.
class AiProviderError extends Error {}

const chatComplete = async (messages) => {
  if (!geminiModel) {
    logger.debug('[AI] Gemini not configured — returning stub response')
    return '[AI feature requires GEMINI_API_KEY configuration]'
  }

  const systemMessages = messages.filter((m) => m.role === 'system').map((m) => m.content)
  const turns = messages.filter((m) => m.role !== 'system')

  const history = turns.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const lastTurn = turns[turns.length - 1]
  const lastMessage = systemMessages.length
    ? `${systemMessages.join('\n')}\n\n${lastTurn.content}`
    : lastTurn.content

  try {
    const chat = geminiModel.startChat({ history })
    const result = await chat.sendMessage(lastMessage)
    return result.response.text()
  } catch (err) {
    logger.error(`[AI] Gemini request failed: ${err.message}`)
    throw new AiProviderError('AI provider request failed')
  }
}

/**
 * Generate a plain-text summary for a course.
 */
const generateCourseSummary = async (course) => {
  const prompt = [
    { role: 'system', content: 'You are a helpful e-learning assistant. Summarise the given course in 2-3 engaging sentences for a student deciding whether to enrol. Be specific and highlight what makes this course valuable.' },
    { role: 'user', content: `Course: "${course.title}"\nDescription: ${course.description}\nLevel: ${course.level}\nCategory: ${course.category}` },
  ]
  try {
    return await chatComplete(prompt)
  } catch (err) {
    if (err instanceof AiProviderError) {
      return '[AI summary is temporarily unavailable — please try again later.]'
    }
    throw err
  }
}

/**
 * Generate N quiz questions from lecture content text.
 */
const generateQuizQuestions = async (lectureTitle, contentHint, count = 5) => {
  if (!geminiModel) {
    return Array.from({ length: count }, (_, i) => ({
      text: `Sample question ${i + 1} about "${lectureTitle}"`,
      aiGenerated: true,
      options: [
        { text: 'Correct answer', isCorrect: true },
        { text: 'Wrong answer A', isCorrect: false },
        { text: 'Wrong answer B', isCorrect: false },
        { text: 'Wrong answer C', isCorrect: false },
      ],
      explanation: 'This is a stub explanation — configure GEMINI_API_KEY for real questions.',
    }))
  }

  const prompt = [
    { role: 'system', content: 'You are an e-learning content creator. Return ONLY a valid JSON array of quiz question objects. Each object must have: text (string), options (array of exactly 4 objects with {text, isCorrect}), explanation (string). isCorrect must be true for exactly one option per question.' },
    { role: 'user', content: `Generate ${count} multiple-choice questions for a lecture titled "${lectureTitle}". ${contentHint ? `Context: ${contentHint}` : ''}` },
  ]

  let raw
  try {
    raw = await chatComplete(prompt)
  } catch (err) {
    if (err instanceof AiProviderError) {
      logger.warn('[AI] Quiz generation unavailable — provider error, returning empty list')
      return []
    }
    throw err
  }

  try {
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim()
    const parsed = JSON.parse(clean)
    if (!Array.isArray(parsed)) throw new Error('Not an array')
    return parsed.map((q) => ({ ...q, aiGenerated: true }))
  } catch {
    logger.warn('[AI] Failed to parse quiz JSON from Gemini response')
    return []
  }
}

/**
 * Generate course recommendations for a student.
 * Returns categories/topics the student should explore.
 */
const generateRecommendations = async (completedCourses, enrolledCategories) => {
  if (!geminiModel) {
    return {
      topics: ['Data Science', 'Web Development', 'DevOps'],
      reason: 'Explore these popular categories to expand your skills. Configure GEMINI_API_KEY for personalised recommendations.',
    }
  }

  const prompt = [
    { role: 'system', content: 'You are a personalised learning advisor. Recommend 3 course topics for a student based on their history. Return JSON: { topics: string[], reason: string }' },
    { role: 'user', content: `Completed courses: ${completedCourses.join(', ') || 'none'}. Enrolled categories: ${enrolledCategories.join(', ') || 'none'}.` },
  ]

  let raw
  try {
    raw = await chatComplete(prompt)
  } catch (err) {
    if (err instanceof AiProviderError) {
      return {
        topics: ['Data Science', 'Web Development', 'DevOps'],
        reason: 'Personalised recommendations are temporarily unavailable — here are some popular categories in the meantime.',
      }
    }
    throw err
  }

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

  if (!geminiModel) {
    return `I'm your AI Tutor for "${courseTitle}". I'm not fully configured yet — ask your instructor or add a Gemini API key to enable real AI responses. Your question was: "${userMessage}"`
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10),
    { role: 'user', content: userMessage },
  ]

  try {
    const reply = await chatComplete(messages)
    logger.debug(`[AI Chat] Course: ${courseTitle} | Lecture: ${lectureTitle || 'none'} | Response length: ${reply.length}`)
    return reply
  } catch (err) {
    if (err instanceof AiProviderError) {
      return "I'm having trouble reaching the AI service right now. Please try again in a moment."
    }
    throw err
  }
}

module.exports = {
  generateCourseSummary,
  generateQuizQuestions,
  generateRecommendations,
  chatWithTutor,
  hasGemini,
  AiProviderError,
}
