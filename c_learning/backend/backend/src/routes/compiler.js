import express from "express";
import { ok, fail } from "../utils/response.js";

const router = express.Router();

// 模拟评测逻辑
const evaluateCode = (code, language) => {
  try {
    // 这里是模拟评测，实际项目中应该使用真实的编译器和测试用例
    let result = {
      success: true,
      message: "代码评测成功",
      details: {
        syntax: "通过",
        functional: "通过",
        performance: "良好",
        output: "",
        errors: []
      }
    };

    // 处理前端代码评测
    if (language === 'frontend') {
      try {
        // 解析JSON格式的前端代码
        const frontendCode = JSON.parse(code);
        
        // 模拟HTML评测
        if (frontendCode.html) {
          if (frontendCode.html.includes('error')) {
            result.success = false;
            result.message = "HTML代码存在错误";
            result.details.errors.push({
              line: 5,
              message: "HTML语法错误: 标签未闭合"
            });
          }
        }
        
        // 模拟CSS评测
        if (frontendCode.css) {
          if (frontendCode.css.includes('error')) {
            result.success = false;
            result.message = "CSS代码存在错误";
            result.details.errors.push({
              line: 3,
              message: "CSS语法错误: 语法不正确"
            });
          }
        }
        
        // 模拟JavaScript评测
        if (frontendCode.javascript) {
          if (frontendCode.javascript.includes('error')) {
            result.success = false;
            result.message = "JavaScript代码存在错误";
            result.details.errors.push({
              line: 2,
              message: "JavaScript语法错误: 缺少分号"
            });
          } else if (frontendCode.javascript.includes('console.log')) {
            // 模拟console.log输出
            result.details.output = "Hello, 前端语言!\nJavaScript 执行成功！\n";
          }
        }
        
        // 如果没有错误，设置默认输出
        if (result.success && !result.details.output) {
          result.details.output = "前端代码执行成功！\n";
        }
      } catch (parseError) {
        result.success = false;
        result.message = "代码格式错误";
        result.details.errors.push({
          message: "代码格式不正确: " + parseError.message
        });
      }
    } else {
      // 处理其他语言的评测
      // 模拟一些错误情况
      if (code.includes("error")) {
        result.success = false;
        result.message = "代码存在错误";
        result.details.syntax = "错误";
        result.details.errors.push({
          line: 5,
          message: "语法错误: 缺少分号"
        });
      } else if (code.includes("warning")) {
        result.success = true;
        result.message = "代码评测成功，但存在警告";
        result.details.errors.push({
          line: 3,
          message: "警告: 未使用的变量"
        });
      }
      
      // 设置默认输出
      result.details.output = "Hello, World!\n";
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: "评测过程中出现错误",
      details: {
        errors: [{
          message: error.message
        }]
      }
    };
  }
};

// 代码评测接口
router.post("/evaluate", (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return fail(res, "代码不能为空");
    }

    if (!language) {
      return fail(res, "语言类型不能为空");
    }

    // 调用评测逻辑
    const evaluationResult = evaluateCode(code, language);

    return ok(res, evaluationResult);
  } catch (error) {
    return fail(res, error.message || "评测失败");
  }
});

export default router;