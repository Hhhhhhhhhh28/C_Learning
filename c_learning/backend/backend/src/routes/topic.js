import express from "express";
import { auth } from "../middleware/auth.js";
import { query } from "../db.js";
import { ok, fail } from "../utils/response.js";
import {
  createSession,
  getSession,
  clearSession,
  answerQuestion,
  normalizeKnowPointId,
} from "../utils/testSession.js";

const router = express.Router();
const EXAM_COUNT = 10;
const QUIZ_COMPLETE_POINTS = 20;
const QUIZ_ACCURACY_BONUS_POINTS = 50;

const parseOptions = row => {
  if (!row) return null;
  const option = row.options_json ? JSON.parse(row.options_json) : [];
  const tags = row.tags_json ? JSON.parse(row.tags_json) : [];
  return {
    id: row.id,
    title: row.title,
    option,
    answer: row.answer,
    difficulty: row.difficulty,
    hierarchy: row.hierarchy,
    analysis: row.analysis,
    tags,
    knowPointName: row.knowPointName,
  };
};

const getTopicByIds = async ids => {
  if (!ids.length) return [];
  const placeholders = ids.map(() => "?").join(",");
  const rows = await query(
    `SELECT t.*, kp.know_name AS knowPointName
     FROM topics t
     LEFT JOIN knowledge_points kp ON kp.id = t.knowledge_point_id
     WHERE t.id IN (${placeholders})`,
    ids
  );
  const rowMap = new Map(rows.map(row => [row.id, row]));
  return ids.map(id => parseOptions(rowMap.get(id))).filter(Boolean);
};

const saveRecord = async ({
  studentId,
  topicId,
  studentAnswer = "",
  answerTime = 0,
  source = "normal",
}) => {
  if (!topicId) return;
  const rows = await query("SELECT answer, knowledge_point_id FROM topics WHERE id = ? LIMIT 1", [
    topicId,
  ]);
  if (!rows.length) return;
  const answer = rows[0].answer;
  const isCorrect = studentAnswer && studentAnswer === answer ? 1 : 0;
  await query(
    `INSERT INTO student_topic_records
      (student_id, topic_id, student_answer, is_correct, answer_time, source, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [studentId, topicId, studentAnswer || "", isCorrect, Number(answerTime) || 0, source]
  );
};

const getQuizType = async ({ knowPointId, topicIds = [] }) => {
  const fallback = "HTML";
  const textParts = [];

  if (Number(knowPointId)) {
    const rows = await query(
      `SELECT know_name
       FROM knowledge_points
       WHERE id = ?
       LIMIT 1`,
      [Number(knowPointId)]
    );
    if (rows.length) {
      textParts.push(rows[0].know_name);
    }
  }

  if (topicIds.length) {
    const placeholders = topicIds.map(() => "?").join(",");
    const rows = await query(
      `SELECT title, tags_json
       FROM topics
       WHERE id IN (${placeholders})`,
      topicIds
    );
    rows.forEach(row => textParts.push(row.title, row.tags_json));
  }

  const text = textParts.filter(Boolean).join(" ").toLowerCase();
  if (text.includes("javascript") || text.includes("js")) return "JavaScript";
  if (text.includes("css")) return "CSS";
  if (text.includes("html")) return "HTML";
  return fallback;
};

const awardQuizPoints = async ({ studentId, topicId, knowPointId, topicIds, correctRate }) => {
  if (!studentId || !topicIds.length) {
    return { earnedPoints: 0, quizType: "HTML", awards: [] };
  }

  const quizType = await getQuizType({ knowPointId, topicIds });
  const awards = [
    {
      points: QUIZ_COMPLETE_POINTS,
      source: "quiz",
      sourceId: Number(topicId) || topicIds[topicIds.length - 1] || null,
    },
  ];

  if (correctRate >= 0.8) {
    awards.push({
      points: QUIZ_ACCURACY_BONUS_POINTS,
      source: "quiz_bonus",
      sourceId: Number(topicId) || topicIds[topicIds.length - 1] || null,
    });
  }

  for (const award of awards) {
    await query(
      "INSERT INTO student_points (student_id, points, source, source_id) VALUES (?, ?, ?, ?)",
      [studentId, award.points, award.source, award.sourceId]
    );
  }

  return {
    earnedPoints: awards.reduce((sum, item) => sum + item.points, 0),
    quizType,
    awards,
  };
};

router.post("/nextTopic", auth, async (req, res) => {
  try {
    const { sectionId, knowPointId, topicId, stuAnswer, answerTime } = req.body || {};

    if (!sectionId) {
      return fail(res, "sectionId不能为空", 40000);
    }

    const studentId = req.user.id;
    let session = getSession(studentId);

    if (
      !topicId ||
      Number(topicId) === 0 ||
      !session ||
      session.knowPointId !== normalizeKnowPointId(knowPointId)
    ) {
      clearSession(studentId);
      console.log("查询参数:", { sectionId, knowPointId });
      // 先按 sectionId 和 knowPointId 查询
      let rows = knowPointId
        ? await query(
            `SELECT id FROM topics
             WHERE section_id = ? AND knowledge_point_id = ?
             ORDER BY id
             LIMIT ${EXAM_COUNT}`,
            [sectionId, knowPointId]
          )
        : [];

      console.log("按sectionId和knowPointId查询结果:", rows.length);

      // 如果没有找到题目，只按 sectionId 查询
      if (!rows.length) {
        rows = await query(
          `SELECT id FROM topics
           WHERE section_id = ?
           ORDER BY id
           LIMIT ${EXAM_COUNT}`,
          [sectionId]
        );
        console.log("只按sectionId查询结果:", rows.length);
      }

      const ids = rows.map(item => item.id);
      console.log("最终题目ID列表:", ids);
      if (!ids.length) {
        return ok(res, { hasNext: false, topicType: 0, showTopicResultList: [] });
      }
      session = createSession(studentId, ids, knowPointId);
    } else {
      answerQuestion(studentId, Number(topicId), stuAnswer);
      await saveRecord({
        studentId,
        topicId: Number(topicId),
        studentAnswer: stuAnswer,
        answerTime,
        source: "normal",
      });
    }

    const answeredCount = session.answers.size;
    const askedCount = Math.min(answeredCount + 1, session.questionIds.length);
    const currentListIds = session.questionIds.slice(0, askedCount);
    const showTopicResultList = await getTopicByIds(currentListIds);

    ok(res, {
      hasNext: askedCount < session.questionIds.length,
      topicType: 0,
      currentQuestionNumber: askedCount,
      totalQuestionCount: session.questionIds.length,
      showTopicResultList,
    });
  } catch (error) {
    fail(res, error.message);
  }
});

router.post("/result", auth, async (req, res) => {
  try {
    const { topicId, stuAnswer, answerTime, knowPointId } = req.body || {};
    const studentId = req.user.id;
    const session = getSession(studentId);

    if (session && topicId && !session.answers.has(Number(topicId))) {
      answerQuestion(studentId, Number(topicId), stuAnswer);
      await saveRecord({
        studentId,
        topicId: Number(topicId),
        studentAnswer: stuAnswer,
        answerTime,
        source: "normal",
      });
    }

    const ids = session?.questionIds || [];
    const topics = await getTopicByIds(ids);
    const showTopicResponses = topics.map(item => {
      const studentAnswer = session?.answers.get(item.id) || "";
      return {
        ...item,
        studentAnswer,
      };
    });

    const correctCount = showTopicResponses.filter(
      item => item.studentAnswer && item.studentAnswer === item.answer
    ).length;
    const total = showTopicResponses.length;
    const correctRate = total > 0 ? correctCount / total : 0;
    const maturity = total > 0 ? Math.min(1, Number((correctRate * 0.9 + 0.1).toFixed(2))) : 0;

    if (Number(knowPointId) && maturity >= 0.6) {
      await query(
        `INSERT INTO student_knowledge_progress (student_id, knowledge_point_id, status, last_study_at)
         VALUES (?, ?, 1, NOW())
         ON DUPLICATE KEY UPDATE status = 1, last_study_at = NOW()`,
        [studentId, Number(knowPointId)]
      );
      await query(
        `UPDATE knowledge_points kp
         JOIN (
            SELECT AVG(is_correct) AS avg_correct
            FROM student_topic_records r
            JOIN topics t ON t.id = r.topic_id
            WHERE r.student_id = ? AND t.knowledge_point_id = ?
         ) x
         SET kp.expertly = ROUND(COALESCE(x.avg_correct, 0) * 100)
         WHERE kp.id = ?`,
        [studentId, Number(knowPointId), Number(knowPointId)]
      );
    }

    const pointResult = await awardQuizPoints({
      studentId,
      topicId: Number(topicId),
      knowPointId,
      topicIds: ids,
      correctRate,
    });
    clearSession(studentId);

    ok(res, {
      correctRate,
      correctCount,
      maturity,
      earnedPoints: pointResult.earnedPoints,
      quizType: pointResult.quizType,
      pointAwards: pointResult.awards,
      showTopicResponses,
    });
  } catch (error) {
    fail(res, error.message);
  }
});

router.get("/wrong", auth, async (req, res) => {
  try {
    const sectionId = Number(req.query.sectionId || 0);
    const studentId = req.user.id;
    const rows = sectionId
      ? await query(
          `SELECT t.*, r.student_answer AS studentAnswer, kp.know_name AS knowPointName
           FROM student_topic_records r
           JOIN topics t ON t.id = r.topic_id
           LEFT JOIN knowledge_points kp ON kp.id = t.knowledge_point_id
           WHERE r.student_id = ? AND r.is_correct = 0 AND t.section_id = ?
           ORDER BY r.created_at DESC`,
          [studentId, sectionId]
        )
      : await query(
          `SELECT t.*, r.student_answer AS studentAnswer, kp.know_name AS knowPointName
           FROM student_topic_records r
           JOIN topics t ON t.id = r.topic_id
           LEFT JOIN knowledge_points kp ON kp.id = t.knowledge_point_id
           WHERE r.student_id = ? AND r.is_correct = 0
           ORDER BY r.created_at DESC`,
          [studentId]
        );
    const showTopicResults = rows.map(row => {
      console.log(row);

      return {
        ...parseOptions(row),
        studentAnswer: row.studentAnswer,
      };
    });

    ok(res, { showTopicResults });
  } catch (error) {
    fail(res, error.message);
  }
});

router.post("/sameType", auth, async (req, res) => {
  try {
    const topicId = Number(req.query.topicId || req.body?.topicId);
    if (!topicId) {
      return ok(res, []);
    }
    const baseRows = await query(
      "SELECT id, knowledge_point_id, section_id FROM topics WHERE id = ? LIMIT 1",
      [topicId]
    );
    if (!baseRows.length) {
      return ok(res, []);
    }
    const base = baseRows[0];
    const rows = await query(
      `SELECT * FROM topics
       WHERE knowledge_point_id = ?
       ORDER BY id
       LIMIT 5`,
      [base.knowledge_point_id]
    );

    const result = rows.map(row => ({
      ...parseOptions(row),
      topicType: 0,
    }));
    ok(res, result);
  } catch (error) {
    fail(res, error.message);
  }
});

router.post("/sameTypeResult", auth, async (req, res) => {
  try {
    const list = Array.isArray(req.body?.showMistakesInfos) ? req.body.showMistakesInfos : [];
    const ids = list.map(item => Number(item.topicId)).filter(Boolean);
    const topics = await getTopicByIds(ids);
    const answerMap = new Map(list.map(item => [Number(item.topicId), item.studentAnswer || ""]));

    for (const item of list) {
      await saveRecord({
        studentId: req.user.id,
        topicId: Number(item.topicId),
        studentAnswer: item.studentAnswer,
        source: "sameType",
      });
    }

    const showTopicResponses = topics.map(topic => ({
      ...topic,
      studentAnswer: answerMap.get(topic.id) || "",
    }));

    const correctCount = showTopicResponses.filter(
      item => item.studentAnswer && item.studentAnswer === item.answer
    ).length;
    const total = showTopicResponses.length || 1;
    const correctRate = correctCount / total;
    const maturity = Math.min(1, Number((correctRate * 0.9 + 0.1).toFixed(2)));

    ok(res, {
      correctRate,
      correctCount,
      maturity,
      showTopicResponses,
    });
  } catch (error) {
    fail(res, error.message);
  }
});

export default router;
