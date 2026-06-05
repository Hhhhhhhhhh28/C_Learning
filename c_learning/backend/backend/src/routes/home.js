import express from 'express'
import { auth } from '../middleware/auth.js'
import { query } from '../db.js'
import { ok, fail } from '../utils/response.js'

const router = express.Router()

router.get('/getstudystatus', auth, async (req, res) => {
  try {
    const learned = await query(
      `SELECT kp.id, kp.know_name AS knowName, kp.section_id AS sectionId, kp.know_id AS knowId
       FROM student_knowledge_progress skp
       JOIN knowledge_points kp ON kp.id = skp.knowledge_point_id
       WHERE skp.student_id = ? AND skp.status = 1
       ORDER BY skp.last_study_at DESC
       LIMIT 1`,
      [req.user.id],
    )

    let current = learned[0]
    if (!current) {
      const first = await query(
        'SELECT id, know_name AS knowName, section_id AS sectionId, know_id AS knowId FROM knowledge_points ORDER BY section_id, know_id LIMIT 1',
      )
      current = first[0]
    }

    const next = await query(
      `SELECT id, know_name AS knowName, section_id AS sectionId, know_id AS knowId
       FROM knowledge_points
       WHERE (section_id > ? OR (section_id = ? AND know_id > ?))
       ORDER BY section_id, know_id
       LIMIT 1`,
      [current.sectionId, current.sectionId, current.knowId],
    )

    ok(res, {
      pointName: current?.knowName || '',
      nextPointName: next[0]?.knowName || '',
      knowPointId: current?.id || null,
      sectionId: current?.sectionId || null,
    })
  } catch (error) {
    fail(res, error.message)
  }
})

router.get('/getStudyPoints', auth, async (req, res) => {
  try {
    const rows = await query(
      'SELECT knowledge_point_id AS knowPointId FROM student_knowledge_progress WHERE student_id = ? AND status = 1 ORDER BY knowledge_point_id',
      [req.user.id],
    )
    ok(res, rows)
  } catch (error) {
    fail(res, error.message)
  }
})

export default router
