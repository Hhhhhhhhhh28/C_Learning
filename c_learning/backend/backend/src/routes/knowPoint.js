import express from 'express'
import { auth } from '../middleware/auth.js'
import { query } from '../db.js'
import { ok, fail } from '../utils/response.js'

const router = express.Router()

const normalizePointState = (allPoints, learnedPointIds) => {
  const learnedSet = new Set(learnedPointIds)
  const unlockedGivenPerSection = {}
  return allPoints.map(item => {
    if (learnedSet.has(item.id)) {
      return { ...item, knowState: 0 }
    }
    if (!unlockedGivenPerSection[item.sectionId]) {
      unlockedGivenPerSection[item.sectionId] = true
      return { ...item, knowState: 1 }
    }
    return { ...item, knowState: 2 }
  })
}

router.get('/allKnowPoint', auth, async (req, res) => {
  try {
    const pointsRaw = await query(
      `SELECT id, know_id AS knowId, know_name AS knowName, section_id AS sectionId,
              hierarchy, difficulty, expertly, description AS describeText
       FROM knowledge_points
       ORDER BY section_id, know_id`,
    )
    const points = pointsRaw.map(item => ({ ...item, describe: item.describeText }))

    const learned = await query(
      'SELECT knowledge_point_id FROM student_knowledge_progress WHERE student_id = ? AND status = 1',
      [req.user.id],
    )
    const learnedIds = learned.map(item => item.knowledge_point_id)
    const knowPointList = normalizePointState(points, learnedIds)
    ok(res, { knowPointList })
  } catch (error) {
    fail(res, error.message)
  }
})

router.post('/info', auth, async (req, res) => {
  try {
    const { pointId } = req.body || {}
    const rows = await query(
      `SELECT id, course_md AS course, video_url AS context, summary, relation_name_json AS relationName
       FROM knowledge_points
       WHERE id = ? LIMIT 1`,
      [pointId],
    )
    if (!rows.length) {
      return fail(res, '知识点不存在', 40000)
    }
    const point = rows[0]
    point.relationName = point.relationName ? JSON.parse(point.relationName) : []
    ok(res, point)
  } catch (error) {
    fail(res, error.message)
  }
})

router.post('/next', auth, async (req, res) => {
  try {
    const { knowPointId, sectionId } = req.body || {}
    const rows = await query(
      `SELECT id AS knowPointId, section_id AS sectionId
       FROM knowledge_points
       WHERE (section_id > ? OR (section_id = ? AND id > ?))
       ORDER BY section_id, know_id
       LIMIT 1`,
      [sectionId, sectionId, knowPointId],
    )
    ok(res, rows[0] || { knowPointId: knowPointId, sectionId })
  } catch (error) {
    fail(res, error.message)
  }
})

export default router
