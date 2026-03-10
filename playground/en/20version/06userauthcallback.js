window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --用户权限回调--演示业务系统登录、用户身份传递和权限校验回调
        const { MainView, initCadContainer, Engine, DrawingManagerService, message } = vjcad;
        
        // =====================================================================
        // 权限回调测试服务端代码（Node.js + Express）
        // 
        // 将以下代码保存为 auth-server.js，运行:
        //   npm install express
        //   node auth-server.js
        //
        // 然后在 vjmap后台 的 config.json 中配置:
        // {
        //   "map": {
        //     "auth_callback": {
        //       "url": "http://127.0.0.1:3200/api/auth/check",
        //       "method": "POST",
        //       "timeout": 5000,
        //       "fail_policy": "deny"
        //     }
        //   }
        // }
        //
        // ---------- auth-server.js 完整代码 ----------
        //
        // const express = require('express');
        // const crypto = require('crypto');
        // const app = express();
        // const PORT = 3200;
        //
        // app.use(express.json());
        //
        // // CORS 支持
        // app.use((req, res, next) => {
        //     res.header('Access-Control-Allow-Origin', '*');
        //     res.header('Access-Control-Allow-Headers', 'Content-Type');
        //     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        //     if (req.method === 'OPTIONS') return res.sendStatus(200);
        //     next();
        // });
        //
        // // 模拟用户数据库（实际项目中连接数据库）
        // const users = {
        //     'admin':         { password: '123456', userName: '管理员',   role: 'admin' },
        //     'test_user':     { password: '123456', userName: '测试用户', role: 'editor' },
        //     'readonly_user': { password: '123456', userName: '只读用户', role: 'viewer' },
        //     'blocked_user':  { password: '123456', userName: '封禁用户', role: 'blocked' },
        // };
        //
        // // 会话管理
        // const sessions = new Map();
        // const SESSION_TTL = 30 * 60 * 1000; // 30 分钟
        //
        // // POST /api/login - 登录
        // app.post('/api/login', (req, res) => {
        //     const { userId, password } = req.body;
        //     const user = users[userId];
        //     if (!user || user.password !== password) {
        //         return res.json({ success: false, message: '用户名或密码错误' });
        //     }
        //     const sessionId = 'sess_' + crypto.randomBytes(16).toString('hex');
        //     sessions.set(sessionId, {
        //         userId, userName: user.userName, role: user.role,
        //         expiresAt: Date.now() + SESSION_TTL
        //     });
        //     res.json({ success: true, userId, userName: user.userName, sessionId, role: user.role });
        // });
        //
        // // POST /api/logout - 登出
        // app.post('/api/logout', (req, res) => {
        //     sessions.delete(req.body.sessionId);
        //     res.json({ success: true });
        // });
        //
        // // POST /api/auth/check - 权限校验（由 WebCAD 后端自动调用）
        // app.post('/api/auth/check', (req, res) => {
        //     const { userId, sessionId, operation, resource } = req.body;
        //
        //     // 验证会话
        //     const session = sessions.get(sessionId);
        //     if (sessionId && (!session || Date.now() > session.expiresAt)) {
        //         if (session) sessions.delete(sessionId);
        //         return res.json({ allowed: false, reason: 'session_expired', message: '会话已过期' });
        //     }
        //
        //     const role = session?.role || 'guest';
        //
        //     // 封禁用户
        //     if (role === 'blocked') {
        //         return res.json({ allowed: false, reason: 'no_permission', message: '用户已被封禁' });
        //     }
        //     // 只读用户不能写
        //     if (role === 'viewer' && !['listWebcadDraws', 'getWebcadData'].includes(operation)) {
        //         return res.json({ allowed: false, reason: 'no_permission', message: '只读用户不能执行写操作' });
        //     }
        //     // 非管理员不能删除
        //     if (['deleteWebcadDraw', 'deleteWebcadBranch'].includes(operation) && role !== 'admin') {
        //         return res.json({ allowed: false, reason: 'no_permission', message: '只有管理员才能删除' });
        //     }
        //
        //     console.log(`[AUTH] ${userId} ${operation} -> ALLOW`);
        //     res.json({ allowed: true });
        // });
        //
        // // 定时清理过期会话
        // setInterval(() => {
        //     const now = Date.now();
        //     for (const [id, s] of sessions) {
        //         if (now > s.expiresAt) sessions.delete(id);
        //     }
        // }, 60000);
        //
        // app.listen(PORT, () => console.log(`权限服务运行在 http://127.0.0.1:${PORT}`));
        //
        // ---------- auth-server.js 代码结束 ----------
        // =====================================================================
        
        message.info("=== 用户权限回调示例 ===");
        message.info("本示例演示如何集成业务系统的用户身份和权限控制");
        message.info("");
        
        // ==================== 配置 ====================
        
        // 权限测试服务器地址（需要先启动上面注释中的 auth-server.js）
        const AUTH_SERVER_URL = 'http://127.0.0.1:3200';
        
        // 测试用户 - 修改这里切换不同用户测试不同权限
        // 可选: 'admin'(管理员) | 'test_user'(编辑者) | 'readonly_user'(只读) | 'blocked_user'(封禁)
        const TEST_USER_ID = 'test_user';
        const TEST_PASSWORD = '123456';
        
        // ==================== 第一步：登录业务系统 ====================
        
        message.info("【第1步】登录业务系统...");
        message.info(`  用户: ${TEST_USER_ID}`);
        
        let userInfo = undefined;
        
        try {
            const loginResp = await fetch(`${AUTH_SERVER_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: TEST_USER_ID, password: TEST_PASSWORD })
            });
            const loginResult = await loginResp.json();
        
            if (loginResult.success) {
                message.info(`  登录成功! 用户名: ${loginResult.userName}, 角色: ${loginResult.role}`);
                message.info(`  SessionId: ${loginResult.sessionId.substring(0, 20)}...`);
                userInfo = {
                    userId: loginResult.userId,
                    userName: loginResult.userName,
                    sessionId: loginResult.sessionId,
                };
            } else {
                message.error(`  登录失败: ${loginResult.message}`);
            }
        } catch (e) {
            message.warn("  权限服务未启动，将以匿名模式运行（不触发权限回调）");
            message.warn("  请先启动 auth-server.js，详见注释中的服务端代码");
        }
        
        // ==================== 第二步：创建 MainView（带用户信息） ====================
        
        message.info("");
        message.info("【第2步】创建 MainView（带用户信息）...");
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        
            // 传入业务系统用户信息
            userInfo: userInfo,
        
            // 权限错误回调
            onAuthError: (error) => {
                message.error(`[权限拒绝] ${error.errorCode}: ${error.message} (操作: ${error.operation})`);
                if (error.errorCode === 'session_expired') {
                    message.warn("会话已过期，实际项目中应跳转到登录页");
                }
            },
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        if (userInfo) {
            message.info(`  已登录用户: ${userInfo.userName || userInfo.userId}`);
            message.info("  所有操作将携带用户信息，后端会进行权限回调校验");
        } else {
            message.info("  匿名模式: 使用浏览器指纹作为默认作者");
            message.info("  不会触发后端权限回调");
        }
        
        // ==================== 第三步：演示操作（触发权限回调） ====================
        
        message.info("");
        message.info("【第3步】尝试执行操作（触发权限回调）...");
        message.info("  可以在终端观察 auth-server.js 的回调日志");
        message.info("");
        
        const drawingManager = new DrawingManagerService();
        
        // 尝试列出图纸（所有角色都允许）
        message.info("  尝试列出图纸...");
        try {
            const svc = cadView.querySelector?.('main-view')?.service || drawingManager.service;
            const listResult = await drawingManager.service.listWebcadDraws('_null', '_');
            if (listResult && listResult.status !== 403) {
                const importCount = listResult.imports?.length || 0;
                const designCount = listResult.designs?.length || 0;
                message.info(`  列出图纸成功: ${importCount} 导入图纸, ${designCount} 设计图纸`);
            } else if (listResult?.errorCode) {
                message.error(`  列出图纸被拒绝: [${listResult.errorCode}] ${listResult.error}`);
            }
        } catch (e) {
            message.error(`  列出图纸失败: ${e.message}`);
        }
        
        message.info("");
        message.info("=== 示例完成 ===");
        message.info("");
        message.info("测试建议:");
        message.info("  1. 修改 TEST_USER_ID 为不同用户，观察权限差异");
        message.info("  2. 打开图纸后尝试保存，观察权限回调");
        message.info("  3. 尝试创建/删除分支，测试不同角色的权限");
        message.info("  4. 访问 http://127.0.0.1:3200 查看权限回调记录");
        
    } catch (e) {
        console.error(e);
        if (typeof vjcad !== 'undefined' && vjcad.message) {
            vjcad.message.error({
                content: "catch error: " + (e.message || e.response || JSON.stringify(e).substr(0, 80)),
                duration: 60,
                key: "err"
            });
        }
    }
};
