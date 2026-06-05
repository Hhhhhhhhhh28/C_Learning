import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { ok, fail } from "./utils/response.js";
import { query } from "./db.js";

import studentRoutes from "./routes/student.js";
import homeRoutes from "./routes/home.js";
import knowPointRoutes from "./routes/knowPoint.js";
import topicRoutes from "./routes/topic.js";
import notebookRoutes from "./routes/notebook.js";
import gameRoutes from "./routes/game.js";
import aiRoutes from "./routes/ai.js";
import compilerRoutes from "./routes/compiler.js";

const app = express();
const isAllowedCorsOrigin = origin => {
  if (!origin) return true;
  if (config.corsOrigins.includes(origin)) return true;

  try {
    const { protocol, hostname, port } = new URL(origin);
    const isDevPort = protocol === "http:" && port === "5173";
    const isPrivateLanHost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

    return isDevPort && isPrivateLanHost;
  } catch (_error) {
    return false;
  }
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedCorsOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS origin not allowed: ${origin}`));
      }
    },
    credentials: false,
    allowedHeaders: ["Content-Type", "token", "Authorization"],
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => ok(res, { status: "ok" }));

app.use("/api/student", studentRoutes);
app.use("/api/currentKnow", homeRoutes);
app.use("/api/plan", homeRoutes);
app.use("/api/knowPoint", knowPointRoutes);
app.use("/api/topic", topicRoutes);
app.use("/api/notebook", notebookRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/compiler", compilerRoutes);

app.use((err, _req, res, _next) => {
  fail(res, err.message || "服务异常");
});

// 初始化数据库表结构
const initDatabase = async () => {
  try {
    // 创建等级表
    await query(`
      CREATE TABLE IF NOT EXISTS levels (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        level_name VARCHAR(128) NOT NULL,
        level_number INT NOT NULL UNIQUE,
        required_points INT NOT NULL DEFAULT 0,
        required_tasks INT NOT NULL DEFAULT 0,
        description VARCHAR(500) DEFAULT '',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建任务表
    await query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        task_name VARCHAR(128) NOT NULL,
        task_type VARCHAR(32) NOT NULL COMMENT 'daily, weekly, monthly, one-time',
        points_reward INT NOT NULL DEFAULT 0,
        description VARCHAR(500) NOT NULL,
        is_active TINYINT NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME DEFAULT NULL
      )
    `);

    // 创建学生等级表
    await query(`
      CREATE TABLE IF NOT EXISTS student_levels (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        student_id BIGINT NOT NULL,
        level_id BIGINT NOT NULL,
        status TINYINT NOT NULL DEFAULT 0 COMMENT '0: locked, 1: unlocked, 2: completed',
        completed_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_student_level (student_id, level_id),
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (level_id) REFERENCES levels(id)
      )
    `);

    // 创建学生任务表
    await query(`
      CREATE TABLE IF NOT EXISTS student_tasks (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        student_id BIGINT NOT NULL,
        task_id BIGINT NOT NULL,
        status TINYINT NOT NULL DEFAULT 0 COMMENT '0: pending, 1: completed, 2: expired',
        completed_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_student_task (student_id, task_id),
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (task_id) REFERENCES tasks(id)
      )
    `);

    // 创建学生积分表
    await query(`
      CREATE TABLE IF NOT EXISTS student_points (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        student_id BIGINT NOT NULL,
        points INT NOT NULL DEFAULT 0,
        source VARCHAR(32) NOT NULL COMMENT 'task, quiz, study',
        source_id BIGINT DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    // 创建学习路径表
    await query(`
      CREATE TABLE IF NOT EXISTS learning_paths (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        path_name VARCHAR(128) NOT NULL,
        description VARCHAR(500) DEFAULT '',
        difficulty TINYINT NOT NULL DEFAULT 2,
        recommended_for VARCHAR(128) DEFAULT '',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建路径知识点表
    await query(`
      CREATE TABLE IF NOT EXISTS path_knowledge_points (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        path_id BIGINT NOT NULL,
        knowledge_point_id BIGINT NOT NULL,
        order_number INT NOT NULL DEFAULT 1,
        FOREIGN KEY (path_id) REFERENCES learning_paths(id),
        FOREIGN KEY (knowledge_point_id) REFERENCES knowledge_points(id),
        UNIQUE KEY uk_path_kp (path_id, knowledge_point_id)
      )
    `);

    // 创建学生学习路径表
    await query(`
      CREATE TABLE IF NOT EXISTS student_learning_paths (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        student_id BIGINT NOT NULL,
        path_id BIGINT NOT NULL,
        progress INT NOT NULL DEFAULT 0,
        status TINYINT NOT NULL DEFAULT 0 COMMENT '0: active, 1: completed',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (path_id) REFERENCES learning_paths(id)
      )
    `);

    // 创建难度调整表
    await query(`
      CREATE TABLE IF NOT EXISTS difficulty_adjustments (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        student_id BIGINT NOT NULL,
        knowledge_point_id BIGINT NOT NULL,
        old_difficulty TINYINT NOT NULL,
        new_difficulty TINYINT NOT NULL,
        reason VARCHAR(500) DEFAULT '',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (knowledge_point_id) REFERENCES knowledge_points(id)
      )
    `);

    // 创建学习建议表
    await query(`
      CREATE TABLE IF NOT EXISTS learning_suggestions (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        student_id BIGINT NOT NULL,
        knowledge_point_id BIGINT DEFAULT NULL,
        suggestion TEXT NOT NULL,
        type VARCHAR(32) NOT NULL COMMENT 'difficulty, resource, path',
        is_read TINYINT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (knowledge_point_id) REFERENCES knowledge_points(id)
      )
    `);

    // 初始化等级数据
    const levelsCount = await query("SELECT COUNT(*) as count FROM levels");
    if (levelsCount[0].count === 0) {
      await query(`
        INSERT INTO levels (level_name, level_number, required_points, required_tasks, description)
        VALUES
        ('入门级', 1, 0, 0, '开始你的学习之旅'),
        ('基础级', 2, 100, 5, '掌握基础概念'),
        ('进阶级', 3, 300, 10, '深入学习核心知识'),
        ('专家级', 4, 600, 20, '成为前端专家')
      `);
    }

    // 初始化任务数据
    const tasksCount = await query("SELECT COUNT(*) as count FROM tasks");
    if (tasksCount[0].count === 0) {
      await query(`
        INSERT INTO tasks (task_name, task_type, points_reward, description, expires_at)
        VALUES
        ('每日登录', 'daily', 10, '每天登录系统', DATE_ADD(NOW(), INTERVAL 1 DAY)),
        ('完成一次练习', 'daily', 20, '完成一次编程练习', DATE_ADD(NOW(), INTERVAL 1 DAY)),
        ('学习一个知识点', 'daily', 15, '学习一个新的知识点', DATE_ADD(NOW(), INTERVAL 1 DAY)),
        ('完成第一关', 'one-time', 50, '完成入门级关卡', NULL),
        ('连续登录3天', 'weekly', 30, '连续3天登录系统', DATE_ADD(NOW(), INTERVAL 7 DAY))
      `);
    }

    // 初始化学习路径数据
    const pathsCount = await query("SELECT COUNT(*) as count FROM learning_paths");
    if (pathsCount[0].count === 0) {
      await query(`
        INSERT INTO learning_paths (path_name, description, difficulty, recommended_for)
        VALUES
        ('前端基础入门', '适合初学者的前端基础学习路径', 1, '初学者'),
        ('前端进阶', '深入学习前端核心概念', 3, '有一定基础的学习者'),
        ('前端专家', '成为前端专家的高级学习路径', 5, '想要深入学习的开发者')
      `);
    }

    // 初始化 topics 数据
    const section1TopicsCount = await query("SELECT COUNT(*) as count FROM topics WHERE section_id = 1");
    if (section1TopicsCount[0].count === 0) {
      await query(`
        INSERT INTO topics (section_id, knowledge_point_id, title, options_json, answer, difficulty, hierarchy, analysis, tags_json)
        VALUES
        (1, 1, '计算程序设计的主要目标是什么？', '[{"key":"A","value":"编写代码"},{"key":"B","value":"解决问题"},{"key":"C","value":"学习语法"},{"key":"D","value":"调试程序"}]', 'B', 2, 3, '计算程序设计的核心目标是通过编写与调试代码解决特定问题。', '[{"tagName":"程序设计"}]'),
        (1, 1, '程序设计中算法思维的重要性体现在哪里？', '[{"key":"A","value":"提高代码速度"},{"key":"B","value":"问题分解与逻辑思考"},{"key":"C","value":"减少代码量"},{"key":"D","value":"提高代码可读性"}]', 'B', 2, 3, '算法思维强调问题分解、逻辑思考与系统化的解决方案设计。', '[{"tagName":"算法思维"}]'),
        (1, 1, '计算程序设计的基本步骤包括？', '[{"key":"A","value":"编写代码"},{"key":"B","value":"问题分析、设计、编码、测试"},{"key":"C","value":"调试程序"},{"key":"D","value":"运行程序"}]', 'B', 2, 2, '计算程序设计需要经过问题分析、算法设计、编码实现和测试验证等步骤。', '[{"tagName":"程序设计步骤"}]'),
        (1, 2, '前端语言的主要特点是什么？', '[{"key":"A","value":"语法复杂"},{"key":"B","value":"语法精简、执行效率高"},{"key":"C","value":"执行速度慢"},{"key":"D","value":"难以学习"}]', 'B', 2, 3, '前端语言以语法精简、执行效率高、可移植性强为主要特点。', '[{"tagName":"语言特点"}]'),
        (1, 2, '前端语言的可移植性是指什么？', '[{"key":"A","value":"代码可以在不同平台上运行"},{"key":"B","value":"代码可以复制粘贴"},{"key":"C","value":"代码可以保存到文件"},{"key":"D","value":"代码可以分享给他人"}]', 'A', 2, 2, '可移植性是指前端语言编写的程序可以在不同的操作系统和硬件平台上运行。', '[{"tagName":"可移植性"}]'),
        (1, 2, '前端语言适合什么类型的应用开发？', '[{"key":"A","value":"网页开发"},{"key":"B","value":"系统编程"},{"key":"C","value":"移动应用"},{"key":"D","value":"游戏开发"}]', 'B', 2, 3, '前端语言以高性能和系统级访问能力著称，适合系统编程和底层开发。', '[{"tagName":"应用场景"}]')
      `);
    }
    
    // 确保其他section的题目数量充足
    const section2TopicsCount = await query("SELECT COUNT(*) as count FROM topics WHERE section_id = 2");
    if (section2TopicsCount[0].count < 5) {
      await query(`
        INSERT INTO topics (section_id, knowledge_point_id, title, options_json, answer, difficulty, hierarchy, analysis, tags_json)
        VALUES
        (2, 3, '算法应具备的特征不包括？', '[{"key":"A","value":"有穷性"},{"key":"B","value":"可行性"},{"key":"C","value":"随机性"},{"key":"D","value":"确定性"}]', 'C', 2, 3, '随机性不是算法必须特征。', '[{"tagName":"算法"}]'),
        (2, 3, '以下哪种排序算法的时间复杂度最低？', '[{"key":"A","value":"冒泡排序"},{"key":"B","value":"选择排序"},{"key":"C","value":"插入排序"},{"key":"D","value":"快速排序"}]', 'D', 3, 4, '快速排序的平均时间复杂度为 O(n log n)，是这些算法中最低的。', '[{"tagName":"排序算法"}]'),
        (2, 3, '算法的时间复杂度主要衡量什么？', '[{"key":"A","value":"算法的正确性"},{"key":"B","value":"算法的可读性"},{"key":"C","value":"算法的执行时间"},{"key":"D","value":"算法的空间使用"}]', 'C', 2, 3, '时间复杂度衡量算法执行所需的时间与输入规模的关系。', '[{"tagName":"时间复杂度"}]'),
        (2, 3, '算法的空间复杂度主要衡量什么？', '[{"key":"A","value":"算法的执行时间"},{"key":"B","value":"算法的正确性"},{"key":"C","value":"算法的可读性"},{"key":"D","value":"算法的内存使用"}]', 'D', 2, 3, '空间复杂度衡量算法执行所需的内存空间与输入规模的关系。', '[{"tagName":"空间复杂度"}]'),
        (2, 3, '以下哪个不是算法的基本结构？', '[{"key":"A","value":"顺序结构"},{"key":"B","value":"分支结构"},{"key":"C","value":"循环结构"},{"key":"D","value":"递归结构"}]', 'D', 2, 3, '算法的基本结构包括顺序、分支和循环，递归是一种高级技术，不是基本结构。', '[{"tagName":"算法结构"}]')
      `);
    }
    
    const section4TopicsCount = await query("SELECT COUNT(*) as count FROM topics WHERE section_id = 4");
    if (section4TopicsCount[0].count < 5) {
      await query(`
        INSERT INTO topics (section_id, knowledge_point_id, title, options_json, answer, difficulty, hierarchy, analysis, tags_json)
        VALUES
        (4, 8, '表达式 7 % 3 的结果是？', '[{"key":"A","value":"1"},{"key":"B","value":"2"},{"key":"C","value":"3"},{"key":"D","value":"0"}]', 'A', 2, 2, '%表示取余，7除3余1。', '[{"tagName":"运算符"}]'),
        (4, 8, '表达式 3 + 4 * 2 的结果是？', '[{"key":"A","value":"14"},{"key":"B","value":"11"},{"key":"C","value":"10"},{"key":"D","value":"9"}]', 'B', 2, 3, '乘法优先级高于加法，所以先计算 4 * 2 = 8，再计算 3 + 8 = 11。', '[{"tagName":"运算符优先级"}]'),
        (4, 8, '表达式 10 / 3 的结果是？', '[{"key":"A","value":"3"},{"key":"B","value":"3.333"},{"key":"C","value":"4"},{"key":"D","value":"3.0"}]', 'B', 2, 2, '除法运算结果为浮点数。', '[{"tagName":"除法运算"}]'),
        (4, 8, '表达式 5 > 3 && 2 < 4 的结果是？', '[{"key":"A","value":"true"},{"key":"B","value":"false"},{"key":"C","value":"1"},{"key":"D","value":"0"}]', 'A', 2, 3, '&& 表示逻辑与，两个条件都为真时结果为真。', '[{"tagName":"逻辑运算符"}]'),
        (4, 8, '表达式 5 > 3 || 2 > 4 的结果是？', '[{"key":"A","value":"true"},{"key":"B","value":"false"},{"key":"C","value":"1"},{"key":"D","value":"0"}]', 'A', 2, 3, '|| 表示逻辑或，只要有一个条件为真时结果为真。', '[{"tagName":"逻辑运算符"}]')
      `);
    }
    
    const section5TopicsCount = await query("SELECT COUNT(*) as count FROM topics WHERE section_id = 5");
    if (section5TopicsCount[0].count < 5) {
      await query(`
        INSERT INTO topics (section_id, knowledge_point_id, title, options_json, answer, difficulty, hierarchy, analysis, tags_json)
        VALUES
        (5, 9, 'if语句中条件表达式结果为0时表示？', '[{"key":"A","value":"true"},{"key":"B","value":"false"},{"key":"C","value":"报错"},{"key":"D","value":"不确定"}]', 'B', 2, 2, '在C中0表示假。', '[{"tagName":"if"}]'),
        (5, 9, '以下哪个是if语句的正确语法？', '[{"key":"A","value":"if (condition) statement"},{"key":"B","value":"if condition statement"},{"key":"C","value":"if {condition} statement"},{"key":"D","value":"if condition {statement}"}]', 'A', 2, 3, 'if语句的正确语法是 if (condition) statement。', '[{"tagName":"if语法"}]'),
        (5, 9, 'switch语句的case后必须跟什么？', '[{"key":"A","value":"分号"},{"key":"B","value":"冒号"},{"key":"C","value":"逗号"},{"key":"D","value":"句号"}]', 'B', 2, 3, 'switch语句的case后必须跟冒号。', '[{"tagName":"switch语句"}]'),
        (5, 9, 'for循环的正确语法是？', '[{"key":"A","value":"for (初始化; 条件; 增量)"},{"key":"B","value":"for (条件; 初始化; 增量)"},{"key":"C","value":"for (初始化; 增量; 条件)"},{"key":"D","value":"for (条件; 增量; 初始化)"}]', 'A', 2, 3, 'for循环的正确语法是 for (初始化; 条件; 增量)。', '[{"tagName":"for循环"}]'),
        (5, 9, 'while循环的正确语法是？', '[{"key":"A","value":"while (条件) statement"},{"key":"B","value":"while condition statement"},{"key":"C","value":"while {condition} statement"},{"key":"D","value":"while condition {statement}"}]', 'A', 2, 3, 'while循环的正确语法是 while (条件) statement。', '[{"tagName":"while循环"}]')
      `);
    }

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error.message);
  }
};

const start = async () => {
  try {
    console.log(`ChatAnywhere key detected: ${config.ai.apiKey ? "yes" : "no"}`);
    await query("SELECT 1");
    console.log("database connected successfully");
    // 初始化数据库表结构
    await initDatabase();
  } catch (error) {
    console.error("database connect failed:", error.message);
    console.log("starting server without database connection...");
  }

  app.listen(config.port, config.host, () => {
    console.log(`backend running at http://${config.host}:${config.port}`);
  });
};

start();
