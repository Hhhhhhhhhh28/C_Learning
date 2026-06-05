import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db.js";
import { config } from "../config.js";
import { auth } from "../middleware/auth.js";
import { ok, fail } from "../utils/response.js";

const router = express.Router();

const ensureAvatarColumn = async () => {
  try {
    await query("ALTER TABLE students ADD COLUMN avatar_url MEDIUMTEXT");
  } catch (error) {
    if (error.code !== "ER_DUP_FIELDNAME") {
      throw error;
    }
  }
};

router.post("/login", async (req, res) => {
  try {
    const studentId = req.query.studentId || req.body?.studentId;
    const password = req.query.password || req.body?.password;
    if (!studentId || !password) {
      return fail(res, "学号或密码不能为空", 40000);
    }

    try {
      const rows = await query(
        "SELECT id, student_id, password_hash, authority FROM students WHERE student_id = ? LIMIT 1",
        [studentId]
      );
      if (!rows.length) {
        return fail(res, "账号或密码错误", 40000);
      }

      const user = rows[0];
      const passOk = user.password_hash?.startsWith("$2")
        ? await bcrypt.compare(password, user.password_hash)
        : password === user.password_hash;
      if (!passOk) {
        return fail(res, "账号或密码错误", 40000);
      }

      const jwtToken = jwt.sign(
        { id: user.id, studentId: user.student_id, authority: user.authority },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      ok(res, { jwt: jwtToken, authority: user.authority });
    } catch (dbError) {
      if (dbError.message.includes("ECONNREFUSED")) {
        return fail(res, "数据库连接失败，请稍后重试", 50001);
      }
      throw dbError;
    }
  } catch (error) {
    fail(res, error.message);
  }
});

router.get("/logout", auth, async (_req, res) => {
  ok(res, true);
});

router.get("/info", auth, async (req, res) => {
  try {
    await ensureAvatarColumn();
    const rows = await query(
      `SELECT id,
              student_id AS studentId,
              student_id AS student_id,
              name,
              class_name AS className,
              class_name AS class_name,
              stu_num AS stuNum,
              stu_num AS stu_num,
              avatar_url AS avatarUrl,
              avatar_url AS avatar_url
       FROM students
       WHERE id = ? LIMIT 1`,
      [req.user.id]
    );
    if (!rows.length) {
      return fail(res, "用户不存在", 40000);
    }
    ok(res, rows[0]);
  } catch (error) {
    fail(res, error.message);
  }
});

router.put("/update", auth, async (req, res) => {
  try {
    const { name } = req.body || {};
    const className = req.body?.className || req.body?.class_name;
    await query(
      `UPDATE students
       SET name = COALESCE(?, name),
           class_name = COALESCE(?, class_name)
       WHERE id = ?`,
      [name ?? null, className ?? null, req.user.id]
    );
    ok(res, true);
  } catch (error) {
    fail(res, error.message);
  }
});

router.put("/password", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body || {};
    if (!oldPassword || !newPassword || !confirmPassword) {
      return fail(res, "原密码、新密码、确认新密码不能为空", 40000);
    }
    if (newPassword !== confirmPassword) {
      return fail(res, "两次输入的新密码不一致", 40000);
    }
    if (newPassword.length < 6) {
      return fail(res, "新密码长度不能少于6位", 40000);
    }

    const rows = await query("SELECT password_hash FROM students WHERE id = ? LIMIT 1", [
      req.user.id,
    ]);
    if (!rows.length) {
      return fail(res, "用户不存在", 40000);
    }

    const savedPassword = rows[0].password_hash || "";
    const oldPasswordOk = savedPassword.startsWith("$2")
      ? await bcrypt.compare(oldPassword, savedPassword)
      : oldPassword === savedPassword;

    if (!oldPasswordOk) {
      return fail(res, "原密码错误", 40000);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await query("UPDATE students SET password_hash = ? WHERE id = ?", [
      passwordHash,
      req.user.id,
    ]);
    ok(res, true);
  } catch (error) {
    fail(res, error.message);
  }
});

router.put("/avatar", auth, async (req, res) => {
  try {
    const avatarUrl = req.body?.avatar_url || req.body?.avatarUrl;
    if (!avatarUrl) {
      return fail(res, "头像不能为空", 40000);
    }
    await ensureAvatarColumn();
    await query("UPDATE students SET avatar_url = ? WHERE id = ?", [avatarUrl, req.user.id]);
    ok(res, { avatarUrl, avatar_url: avatarUrl });
  } catch (error) {
    fail(res, error.message);
  }
});

router.get("/authority", auth, async (req, res) => {
  try {
    const rows = await query("SELECT authority FROM students WHERE id = ? LIMIT 1", [req.user.id]);
    ok(res, rows[0]?.authority ?? 0);
  } catch (error) {
    fail(res, error.message);
  }
});

// 注册接口
router.post("/register", async (req, res) => {
  try {
    const { studentId, password, name } = req.body || {};
    const className = req.body?.class_name || req.body?.className;

    // 验证必填字段
    if (!studentId || !password || !name || !className) {
      return fail(res, "学号、密码、姓名、班级不能为空", 40000);
    }

    // 检查学号是否已存在
    const existingStudent = await query("SELECT id FROM students WHERE student_id = ? LIMIT 1", [
      studentId,
    ]);

    if (existingStudent.length) {
      return fail(res, "学号已存在", 40000);
    }

    // 密码加密
    const passwordHash = await bcrypt.hash(password, 10);

    // 插入新学生
    const result = await query(
      `INSERT INTO students (student_id, password_hash, name, class_name, stu_num, authority)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [studentId, passwordHash, name, className, studentId]
    );

    ok(res, { id: result.insertId, studentId });
  } catch (error) {
    fail(res, error.message);
  }
});

export default router;
