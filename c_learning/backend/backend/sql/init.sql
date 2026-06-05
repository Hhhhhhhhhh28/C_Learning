DROP DATABASE IF EXISTS c_teaching;
CREATE DATABASE c_teaching DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE c_teaching;

CREATE TABLE students (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(32) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(64) NOT NULL,
  class_name VARCHAR(64) NOT NULL,
  stu_num VARCHAR(32) NOT NULL,
  phone VARCHAR(32) DEFAULT '',
  email VARCHAR(128) DEFAULT '',
  authority TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sections (
  id INT PRIMARY KEY,
  section_name VARCHAR(64) NOT NULL
);

CREATE TABLE knowledge_points (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  know_id INT NOT NULL,
  section_id INT NOT NULL,
  know_name VARCHAR(128) NOT NULL,
  hierarchy TINYINT NOT NULL DEFAULT 3,
  difficulty TINYINT NOT NULL DEFAULT 2,
  expertly INT NOT NULL DEFAULT 0,
  description VARCHAR(500) NOT NULL,
  course_md MEDIUMTEXT,
  video_url VARCHAR(500) DEFAULT '',
  summary TEXT,
  relation_name_json TEXT,
  UNIQUE KEY uk_section_knowid (section_id, know_id)
);

CREATE TABLE student_knowledge_progress (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  knowledge_point_id BIGINT NOT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  last_study_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_student_kp (student_id, knowledge_point_id)
);

CREATE TABLE topics (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  section_id INT NOT NULL,
  knowledge_point_id BIGINT NOT NULL,
  title VARCHAR(500) NOT NULL,
  options_json TEXT NOT NULL,
  answer VARCHAR(10) NOT NULL,
  difficulty TINYINT NOT NULL DEFAULT 2,
  hierarchy TINYINT NOT NULL DEFAULT 2,
  analysis VARCHAR(500) NOT NULL,
  tags_json TEXT
);

CREATE TABLE student_topic_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  topic_id BIGINT NOT NULL,
  student_answer VARCHAR(20) DEFAULT '',
  is_correct TINYINT NOT NULL DEFAULT 0,
  answer_time INT NOT NULL DEFAULT 0,
  source VARCHAR(20) NOT NULL DEFAULT 'normal',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notebooks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  context MEDIUMTEXT NOT NULL,
  is_star TINYINT NOT NULL DEFAULT 0,
  is_delete TINYINT NOT NULL DEFAULT 0,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO students (student_id, password_hash, name, class_name, stu_num, phone, email, authority)
VALUES ('210047301', '123456', 'sdgg', '软件2班', '21047301', '12111111', '2132345@qq.com', 1);

INSERT INTO sections (id, section_name) VALUES
(1, '前端语言概述'),
(2, '前端语言基本语法'),
(3, '前端语言数据类型'),
(4, '前端语言运算符'),
(5, '前端语言流程控制'),
(6, '前端语言函数'),
(7, '前端语言数组'),
(8, '前端语言指针'),
(9, '前端语言结构体'),
(10, '前端语言文件操作');

INSERT INTO knowledge_points
(id, know_id, section_id, know_name, hierarchy, difficulty, expertly, description, course_md, video_url, summary, relation_name_json)
VALUES
(1, 1, 1, '计算程序设计', 4, 2, 80, '计算程序设计是在前端语言环境中，通过编写与调试代码解决特定问题。',
 '# 前端语言发展概述\n\n前端语言是Web开发基础，强调效率与结构化。\n\n## 核心目标\n- 理解编译执行流程\n- 掌握基本语法',
 'https://www.w3schools.com/html/mov_bbb.mp4',
 '计算程序设计强调问题分解、算法思维与代码实现。', '["算法思维","程序结构"]'),
(2, 2, 1, '什么是 HTML？', 3, 2, 75, '掌握HTML的基本概念与在网页开发中的地位。',
 '# 前端语言发展特点\n\n前端语言语法精简，执行效率高，适合系统开发。',
 'https://www.w3schools.com/html/movie.mp4',
 '前端语言以高性能与可移植性著称。', '["编译器","可移植性"]'),
(3, 3, 1, '基本结构（<html>、<head>、<body>）', 3, 2, 70, '掌握HTML文档的基本骨架结构。', '# 基本结构\n\nHTML文档由html、head、body三部分组成。', '', 'HTML基本结构是网页的骨架。', '["html","head","body"]'),
(4, 4, 1, '标题和段落', 3, 2, 65, '掌握h1-h6标题标签和p段落标签。', '# 标题和段落\n\n使用h1-h6定义标题，p定义段落。', '', '标题和段落是网页内容的基本组织方式。', '["h1","p"]'),
(5, 5, 1, '链接和图片', 3, 2, 50, '掌握a标签和img标签的使用。', '# 链接和图片\n\na标签用于链接，img标签用于图片。', '', '链接和图片是网页的重要组成元素。', '["a","img"]'),
(6, 6, 1, '列表（无序列表 ul，有序列表 ol）', 3, 2, 45, '掌握ul、ol、li标签的使用。', '# 列表\n\nul为无序列表，ol为有序列表。', '', '列表用于组织并列内容。', '["ul","ol","li"]'),
(7, 7, 1, '表单（input 输入框，button 按钮）', 4, 3, 40, '掌握form、input、button等表单元素。', '# 表单\n\nform用于收集用户输入。', '', '表单是网页与用户交互的重要方式。', '["form","input","button"]');

INSERT INTO student_knowledge_progress (student_id, knowledge_point_id, status, last_study_at)
VALUES
(1, 1, 1, NOW()),
(1, 2, 1, NOW()),
(1, 3, 1, NOW()),
(1, 5, 1, NOW());

INSERT INTO topics
(section_id, knowledge_point_id, title, options_json, answer, difficulty, hierarchy, analysis, tags_json)
VALUES
(1, 1, '计算程序设计的主要目标是什么？', '[{"key":"A","value":"编写代码"},{"key":"B","value":"解决问题"},{"key":"C","value":"学习语法"},{"key":"D","value":"调试程序"}]', 'B', 2, 3, '计算程序设计的核心目标是通过编写与调试代码解决特定问题。', '[{"tagName":"程序设计"}]'),
(1, 1, '程序设计中算法思维的重要性体现在哪里？', '[{"key":"A","value":"提高代码速度"},{"key":"B","value":"问题分解与逻辑思考"},{"key":"C","value":"减少代码量"},{"key":"D","value":"提高代码可读性"}]', 'B', 2, 3, '算法思维强调问题分解、逻辑思考与系统化的解决方案设计。', '[{"tagName":"算法思维"}]'),
(1, 1, '计算程序设计的基本步骤包括？', '[{"key":"A","value":"编写代码"},{"key":"B","value":"问题分析、设计、编码、测试"},{"key":"C","value":"调试程序"},{"key":"D","value":"运行程序"}]', 'B', 2, 2, '计算程序设计需要经过问题分析、算法设计、编码实现和测试验证等步骤。', '[{"tagName":"程序设计步骤"}]'),
(1, 2, '前端语言的主要特点是什么？', '[{"key":"A","value":"语法复杂"},{"key":"B","value":"语法精简、执行效率高"},{"key":"C","value":"执行速度慢"},{"key":"D","value":"难以学习"}]', 'B', 2, 3, '前端语言以语法精简、执行效率高、可移植性强为主要特点。', '[{"tagName":"语言特点"}]'),
(1, 2, '前端语言的可移植性是指什么？', '[{"key":"A","value":"代码可以在不同平台上运行"},{"key":"B","value":"代码可以复制粘贴"},{"key":"C","value":"代码可以保存到文件"},{"key":"D","value":"代码可以分享给他人"}]', 'A', 2, 2, '可移植性是指前端语言编写的程序可以在不同的操作系统和硬件平台上运行。', '[{"tagName":"可移植性"}]'),
(1, 2, '前端语言适合什么类型的应用开发？', '[{"key":"A","value":"网页开发"},{"key":"B","value":"系统编程"},{"key":"C","value":"移动应用"},{"key":"D","value":"游戏开发"}]', 'B', 2, 3, '前端语言以高性能和系统级访问能力著称，适合系统编程和底层开发。', '[{"tagName":"应用场景"}]'),
(3, 5, '在前端语言中，程序执行从哪里开始？', '[{"key":"A","value":"main函数"},{"key":"B","value":"console.log"},{"key":"C","value":"document.write"},{"key":"D","value":"window.onload"}]', 'A', 2, 3, '前端程序执行入口是main函数。', '[{"tagName":"main函数"}]'),
(3, 5, '以下哪个是前端语言整型关键字？', '[{"key":"A","value":"number"},{"key":"B","value":"string"},{"key":"C","value":"boolean"},{"key":"D","value":"object"}]', 'A', 2, 3, 'number用于定义数值型变量。', '[{"tagName":"变量类型"}]'),
(3, 5, '用于输出到控制台的函数是？', '[{"key":"A","value":"console.log"},{"key":"B","value":"printf"},{"key":"C","value":"alert"},{"key":"D","value":"document.write"}]', 'A', 2, 2, 'console.log用于输出。', '[{"tagName":"输入输出"}]'),
(3, 6, 'console.log函数主要用于？', '[{"key":"A","value":"文件写入"},{"key":"B","value":"控制流程"},{"key":"C","value":"读取输入"},{"key":"D","value":"控制台输出"}]', 'D', 2, 3, 'console.log用于从控制台输出数据。', '[{"tagName":"console.log"}]'),
(3, 6, '格式化输出整数常用占位符是？', '[{"key":"A","value":"%s"},{"key":"B","value":"%d"},{"key":"C","value":"${}"},{"key":"D","value":"%c"}]', 'C', 2, 3, '${}用于输出变量。', '[{"tagName":"格式化"}]'),
(3, 6, '输出换行符通常使用？', '[{"key":"A","value":"\\n"},{"key":"B","value":"\\t"},{"key":"C","value":"\\r"},{"key":"D","value":"<br>"}]', 'D', 2, 2, '<br>表示换行。', '[{"tagName":"转义字符"}]'),
(3, 7, '定义常量通常使用哪个关键字？', '[{"key":"A","value":"var"},{"key":"B","value":"let"},{"key":"C","value":"const"},{"key":"D","value":"define"}]', 'C', 3, 4, 'const用于定义只读常量。', '[{"tagName":"常量"}]'),
(3, 7, '以下哪个是合法变量名？', '[{"key":"A","value":"2num"},{"key":"B","value":"_count"},{"key":"C","value":"let"},{"key":"D","value":"float-value"}]', 'B', 3, 3, '变量名可由字母数字下划线组成且不能数字开头。', '[{"tagName":"命名规则"}]'),
(3, 7, 'number类型通常用于存储？', '[{"key":"A","value":"字符"},{"key":"B","value":"整数"},{"key":"C","value":"浮点数"},{"key":"D","value":"指针"}]', 'C', 2, 2, 'number用于数值。', '[{"tagName":"数据类型"}]'),
(3, 7, 'string类型用于存储？', '[{"key":"A","value":"单个字符"},{"key":"B","value":"字符串"},{"key":"C","value":"布尔值"},{"key":"D","value":"结构体"}]', 'B', 2, 2, 'string用于存储字符串。', '[{"tagName":"数据类型"}]'),
(3, 7, '定义变量并赋值的正确写法是？', '[{"key":"A","value":"let = x 10;"},{"key":"B","value":"let x = 10;"},{"key":"C","value":"x let = 10;"},{"key":"D","value":"define let x"}]', 'B', 2, 3, '变量定义语法为 let 变量名 = 值。', '[{"tagName":"变量定义"}]'),
(3, 7, '以下哪个是前端语言注释？', '[{"key":"A","value":"<!-- -->"},{"key":"B","value":"/* */"},{"key":"C","value":"#"},{"key":"D","value":"** **"}]', 'A', 3, 4, '<!-- -->是前端语言注释。', '[{"tagName":"注释"}]'),
(2, 3, '算法应具备的特征不包括？', '[{"key":"A","value":"有穷性"},{"key":"B","value":"可行性"},{"key":"C","value":"随机性"},{"key":"D","value":"确定性"}]', 'C', 2, 3, '随机性不是算法必须特征。', '[{"tagName":"算法"}]'),
(2, 3, '以下哪种排序算法的时间复杂度最低？', '[{"key":"A","value":"冒泡排序"},{"key":"B","value":"选择排序"},{"key":"C","value":"插入排序"},{"key":"D","value":"快速排序"}]', 'D', 3, 4, '快速排序的平均时间复杂度为 O(n log n)，是这些算法中最低的。', '[{"tagName":"排序算法"}]'),
(2, 3, '算法的时间复杂度主要衡量什么？', '[{"key":"A","value":"算法的正确性"},{"key":"B","value":"算法的可读性"},{"key":"C","value":"算法的执行时间"},{"key":"D","value":"算法的空间使用"}]', 'C', 2, 3, '时间复杂度衡量算法执行所需的时间与输入规模的关系。', '[{"tagName":"时间复杂度"}]'),
(2, 3, '算法的空间复杂度主要衡量什么？', '[{"key":"A","value":"算法的执行时间"},{"key":"B","value":"算法的正确性"},{"key":"C","value":"算法的可读性"},{"key":"D","value":"算法的内存使用"}]', 'D', 2, 3, '空间复杂度衡量算法执行所需的内存空间与输入规模的关系。', '[{"tagName":"空间复杂度"}]'),
(2, 3, '以下哪个不是算法的基本结构？', '[{"key":"A","value":"顺序结构"},{"key":"B","value":"分支结构"},{"key":"C","value":"循环结构"},{"key":"D","value":"递归结构"}]', 'D', 2, 3, '算法的基本结构包括顺序、分支和循环，递归是一种高级技术，不是基本结构。', '[{"tagName":"算法结构"}]'),
(4, 8, '表达式 7 % 3 的结果是？', '[{"key":"A","value":"1"},{"key":"B","value":"2"},{"key":"C","value":"3"},{"key":"D","value":"0"}]', 'A', 2, 2, '%表示取余，7除3余1。', '[{"tagName":"运算符"}]'),
(4, 8, '表达式 3 + 4 * 2 的结果是？', '[{"key":"A","value":"14"},{"key":"B","value":"11"},{"key":"C","value":"10"},{"key":"D","value":"9"}]', 'B', 2, 3, '乘法优先级高于加法，所以先计算 4 * 2 = 8，再计算 3 + 8 = 11。', '[{"tagName":"运算符优先级"}]'),
(4, 8, '表达式 10 / 3 的结果是？', '[{"key":"A","value":"3"},{"key":"B","value":"3.333"},{"key":"C","value":"4"},{"key":"D","value":"3.0"}]', 'B', 2, 2, '除法运算结果为浮点数。', '[{"tagName":"除法运算"}]'),
(4, 8, '表达式 5 > 3 && 2 < 4 的结果是？', '[{"key":"A","value":"true"},{"key":"B","value":"false"},{"key":"C","value":"1"},{"key":"D","value":"0"}]', 'A', 2, 3, '&& 表示逻辑与，两个条件都为真时结果为真。', '[{"tagName":"逻辑运算符"}]'),
(4, 8, '表达式 5 > 3 || 2 > 4 的结果是？', '[{"key":"A","value":"true"},{"key":"B","value":"false"},{"key":"C","value":"1"},{"key":"D","value":"0"}]', 'A', 2, 3, '|| 表示逻辑或，只要有一个条件为真时结果为真。', '[{"tagName":"逻辑运算符"}]'),
(5, 9, 'if语句中条件表达式结果为0时表示？', '[{"key":"A","value":"true"},{"key":"B","value":"false"},{"key":"C","value":"报错"},{"key":"D","value":"不确定"}]', 'B', 2, 2, '在C中0表示假。', '[{"tagName":"if"}]'),
(5, 9, '以下哪个是if语句的正确语法？', '[{"key":"A","value":"if (condition) statement"},{"key":"B","value":"if condition statement"},{"key":"C","value":"if {condition} statement"},{"key":"D","value":"if condition {statement}"}]', 'A', 2, 3, 'if语句的正确语法是 if (condition) statement。', '[{"tagName":"if语法"}]'),
(5, 9, 'switch语句的case后必须跟什么？', '[{"key":"A","value":"分号"},{"key":"B","value":"冒号"},{"key":"C","value":"逗号"},{"key":"D","value":"句号"}]', 'B', 2, 3, 'switch语句的case后必须跟冒号。', '[{"tagName":"switch语句"}]'),
(5, 9, 'for循环的正确语法是？', '[{"key":"A","value":"for (初始化; 条件; 增量)"},{"key":"B","value":"for (条件; 初始化; 增量)"},{"key":"C","value":"for (初始化; 增量; 条件)"},{"key":"D","value":"for (条件; 增量; 初始化)"}]', 'A', 2, 3, 'for循环的正确语法是 for (初始化; 条件; 增量)。', '[{"tagName":"for循环"}]'),
(5, 9, 'while循环的正确语法是？', '[{"key":"A","value":"while (条件) statement"},{"key":"B","value":"while condition statement"},{"key":"C","value":"while {condition} statement"},{"key":"D","value":"while condition {statement}"}]', 'A', 2, 3, 'while循环的正确语法是 while (条件) statement。', '[{"tagName":"while循环"}]');

INSERT INTO topics
(id, section_id, knowledge_point_id, title, options_json, answer, difficulty, hierarchy, analysis, tags_json)
VALUES
(44, 1, 2, 'HTML 的全称是什么？', '[{"key":"A","value":"HyperText Markup Language"},{"key":"B","value":"HighText Machine Language"},{"key":"C","value":"Home Tool Markup Language"},{"key":"D","value":"Hyper Tool Machine Language"}]', 'A', 2, 2, 'HTML 的全称是 HyperText Markup Language。', '[{"tagName":"HTML基础"}]'),
(45, 1, 2, 'HTML 属于哪种语言？', '[{"key":"A","value":"编程语言"},{"key":"B","value":"标记语言"},{"key":"C","value":"数据库语言"},{"key":"D","value":"脚本引擎"}]', 'B', 2, 2, 'HTML 是标记语言。', '[{"tagName":"HTML基础"}]'),
(46, 1, 2, 'HTML 主要用于什么？', '[{"key":"A","value":"描述网页结构"},{"key":"B","value":"处理数据库"},{"key":"C","value":"压缩图片"},{"key":"D","value":"编写操作系统"}]', 'A', 2, 2, 'HTML 主要用于描述网页结构。', '[{"tagName":"HTML基础"}]'),
(47, 1, 2, '哪个标签是 HTML 标签？', '[{"key":"A","value":"<p>"},{"key":"B","value":"color:"},{"key":"C","value":"function()"},{"key":"D","value":"SELECT"}]', 'A', 2, 2, '`<p>` 是 HTML 标签。', '[{"tagName":"HTML标签"}]'),
(48, 1, 2, 'HTML 与 CSS 的关系是什么？', '[{"key":"A","value":"HTML 负责结构，CSS 负责样式"},{"key":"B","value":"HTML 负责交互，CSS 负责数据库"},{"key":"C","value":"两者相同"},{"key":"D","value":"CSS 负责结构，HTML 负责样式"}]', 'A', 2, 2, 'HTML 管结构，CSS 管样式。', '[{"tagName":"HTML与CSS"}]'),
(49, 1, 2, 'HTML 与 JavaScript 的关系是什么？', '[{"key":"A","value":"HTML 负责结构，JavaScript 负责交互"},{"key":"B","value":"HTML 负责数据库，JavaScript 负责图片"},{"key":"C","value":"没有关系"},{"key":"D","value":"JavaScript 负责结构"}]', 'A', 2, 2, 'JavaScript 主要负责网页交互。', '[{"tagName":"HTML与JS"}]'),
(50, 1, 2, '下面哪个最适合由 HTML 完成？', '[{"key":"A","value":"设置文字颜色"},{"key":"B","value":"定义标题和段落"},{"key":"C","value":"处理点击动画"},{"key":"D","value":"发送接口请求"}]', 'B', 2, 2, 'HTML 最适合定义结构内容。', '[{"tagName":"HTML基础"}]'),
(51, 1, 2, 'HTML 标签的主要作用是什么？', '[{"key":"A","value":"增加网速"},{"key":"B","value":"描述内容结构和含义"},{"key":"C","value":"运行程序"},{"key":"D","value":"生成数据库"}]', 'B', 2, 2, 'HTML 标签用于描述结构和语义。', '[{"tagName":"HTML标签"}]'),
(52, 1, 2, '网页开发通常先学什么？', '[{"key":"A","value":"HTML"},{"key":"B","value":"服务器部署"},{"key":"C","value":"数据库调优"},{"key":"D","value":"爬虫"}]', 'A', 2, 2, 'HTML 是前端入门基础。', '[{"tagName":"HTML基础"}]'),
(53, 1, 2, '关于 HTML，哪项说法正确？', '[{"key":"A","value":"HTML 用于网页结构"},{"key":"B","value":"HTML 用于数据库查询"},{"key":"C","value":"HTML 是操作系统"},{"key":"D","value":"HTML 只能显示图片"}]', 'A', 2, 2, 'HTML 负责网页结构。', '[{"tagName":"HTML基础"}]');

INSERT INTO student_topic_records
(student_id, topic_id, student_answer, is_correct, answer_time, source, created_at)
VALUES
(1, 2, 'C', 0, 12, 'normal', NOW()),
(1, 3, 'A', 0, 10, 'normal', NOW()),
(1, 4, 'C', 1, 9, 'normal', NOW());

INSERT INTO notebooks (student_id, context, is_star, is_delete, create_time)
VALUES
(1, '## HTTP 协议方法\n\nGET用于获取资源，POST用于提交数据。', 1, 0, NOW()),
(1, '## React 表单\n\n受控组件通过state同步输入值。', 0, 0, NOW()),
(1, '## JavaScript 浏览器兼容\n\n注意事件模型差异。', 0, 1, NOW());

-- 游戏化学习模块表结构
CREATE TABLE levels (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  level_name VARCHAR(128) NOT NULL,
  level_number INT NOT NULL UNIQUE,
  required_points INT NOT NULL DEFAULT 0,
  required_tasks INT NOT NULL DEFAULT 0,
  description VARCHAR(500) DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_name VARCHAR(128) NOT NULL,
  task_type VARCHAR(32) NOT NULL COMMENT 'daily, weekly, monthly, one-time',
  points_reward INT NOT NULL DEFAULT 0,
  description VARCHAR(500) NOT NULL,
  is_active TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME DEFAULT NULL
);

CREATE TABLE student_levels (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  level_id BIGINT NOT NULL,
  status TINYINT NOT NULL DEFAULT 0 COMMENT '0: locked, 1: unlocked, 2: completed',
  completed_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_student_level (student_id, level_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (level_id) REFERENCES levels(id)
);

CREATE TABLE student_tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  task_id BIGINT NOT NULL,
  status TINYINT NOT NULL DEFAULT 0 COMMENT '0: pending, 1: completed, 2: expired',
  completed_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_student_task (student_id, task_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE TABLE student_points (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  points INT NOT NULL DEFAULT 0,
  source VARCHAR(32) NOT NULL COMMENT 'task, quiz, study',
  source_id BIGINT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- AI智能辅助模块表结构
CREATE TABLE learning_paths (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  path_name VARCHAR(128) NOT NULL,
  description VARCHAR(500) DEFAULT '',
  difficulty TINYINT NOT NULL DEFAULT 2,
  recommended_for VARCHAR(128) DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE path_knowledge_points (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  path_id BIGINT NOT NULL,
  knowledge_point_id BIGINT NOT NULL,
  order_number INT NOT NULL DEFAULT 1,
  FOREIGN KEY (path_id) REFERENCES learning_paths(id),
  FOREIGN KEY (knowledge_point_id) REFERENCES knowledge_points(id),
  UNIQUE KEY uk_path_kp (path_id, knowledge_point_id)
);

CREATE TABLE student_learning_paths (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  path_id BIGINT NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  status TINYINT NOT NULL DEFAULT 0 COMMENT '0: active, 1: completed',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (path_id) REFERENCES learning_paths(id)
);

CREATE TABLE difficulty_adjustments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  knowledge_point_id BIGINT NOT NULL,
  old_difficulty TINYINT NOT NULL,
  new_difficulty TINYINT NOT NULL,
  reason VARCHAR(500) DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (knowledge_point_id) REFERENCES knowledge_points(id)
);

CREATE TABLE learning_suggestions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  knowledge_point_id BIGINT DEFAULT NULL,
  suggestion TEXT NOT NULL,
  type VARCHAR(32) NOT NULL COMMENT 'difficulty, resource, path',
  is_read TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (knowledge_point_id) REFERENCES knowledge_points(id)
);

-- 初始化数据
INSERT INTO levels (level_name, level_number, required_points, required_tasks, description)
VALUES
('入门级', 1, 0, 0, '开始你的学习之旅'),
('基础级', 2, 100, 5, '掌握基础概念'),
('进阶级', 3, 300, 10, '深入学习核心知识'),
('专家级', 4, 600, 20, '成为前端专家');

INSERT INTO tasks (task_name, task_type, points_reward, description, expires_at)
VALUES
('每日登录', 'daily', 10, '每天登录系统', DATE_ADD(NOW(), INTERVAL 1 DAY)),
('完成一次练习', 'daily', 20, '完成一次编程练习', DATE_ADD(NOW(), INTERVAL 1 DAY)),
('学习一个知识点', 'daily', 15, '学习一个新的知识点', DATE_ADD(NOW(), INTERVAL 1 DAY)),
('完成第一关', 'one-time', 50, '完成入门级关卡', NULL),
('连续登录3天', 'weekly', 30, '连续3天登录系统', DATE_ADD(NOW(), INTERVAL 7 DAY));

INSERT INTO learning_paths (path_name, description, difficulty, recommended_for)
VALUES
('前端基础入门', '适合初学者的前端基础学习路径', 1, '初学者'),
('前端进阶', '深入学习前端核心概念', 3, '有一定基础的学习者'),
('前端专家', '成为前端专家的高级学习路径', 5, '想要深入学习的开发者');

-- 为学习路径添加知识点
INSERT INTO path_knowledge_points (path_id, knowledge_point_id, order_number)
VALUES
(1, 1, 1),
(1, 2, 2),
(1, 3, 3),
(1, 5, 4),
(2, 6, 1),
(2, 7, 2),
(2, 8, 3),
(2, 9, 4),
(3, 10, 1),
(3, 11, 2),
(3, 12, 3),
(3, 13, 4),
(1, 6, 5),
(2, 10, 5),
(3, 14, 5);
