const sessions = new Map()

export const normalizeKnowPointId = knowPointId => {
  if (knowPointId === undefined || knowPointId === null || knowPointId === '') return '0'
  return String(knowPointId)
}

export const createSession = (studentId, questionIds = [], knowPointId = null) => {
  const session = {
    questionIds,
    answers: new Map(),
    knowPointId: normalizeKnowPointId(knowPointId),
    createdAt: Date.now(),
  }
  sessions.set(String(studentId), session)
  return session
}

export const getSession = studentId => sessions.get(String(studentId))

export const clearSession = studentId => sessions.delete(String(studentId))

export const answerQuestion = (studentId, topicId, studentAnswer = '') => {
  const session = getSession(studentId)
  if (!session) return
  if (topicId) {
    session.answers.set(Number(topicId), studentAnswer || '')
  }
}
