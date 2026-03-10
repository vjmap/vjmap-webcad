window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --基础图片转矢量--通过INSERTIMAGE命令将图片转换为矢量并导入
        const { MainView, initCadContainer, Engine, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ==================== 基础图片转矢量 ====================
        
        // INSERTIMAGE 命令说明：
        // 打开图片转矢量对话框，将栅格图片转换为矢量图形并导入
        // 
        // 支持的导入方式：
        // 1. 拖放图片到对话框
        // 2. Ctrl+V 粘贴图片
        // 3. 点击"选择文件"按钮选择本地图片
        //
        // 支持的图片格式：PNG、JPG、GIF、WebP 等常见格式
        //
        // 转换设置：
        // 【聚类设置】
        // - 聚类模式：黑白 / 彩色
        // - 层级模式（彩色模式下）：切除 / 堆叠
        // - 斑点过滤：过滤小于指定像素的斑点 (0-128)
        // - 颜色精度（彩色模式下）：控制颜色数量 (1-8)
        // - 渐变步长（彩色模式下）：控制渐变过渡 (0-128)
        //
        // 【曲线拟合】
        // - 曲线模式：像素 / 多边形 / 样条
        // - 拐角阈值（样条模式下）：控制拐角识别 (0-180°)
        // - 线段长度（样条模式下）：控制线段分割 (3.5-10)
        // - 连接阈值（样条模式下）：控制曲线连接 (0-180°)
        //
        // 【导入选项】
        // - 启用填充：是否将区域转换为填充图案
        // - 允许缩放：导入时允许指定缩放比例
        // - 允许旋转：导入时允许指定旋转角度
        
        message.info("执行 INSERTIMAGE 命令...");
        message.info("在对话框中选择图片或拖放/粘贴图片");
        message.info("调整转换参数后点击\"导入\"按钮");
        
        // 执行 INSERTIMAGE 命令
        // 命令会打开图片转矢量对话框，用户可以：
        // - 拖放图片到预览区域
        // - 使用 Ctrl+V 粘贴图片
        // - 点击"选择文件"按钮选择本地图片
        // - 调整聚类和曲线拟合参数
        // - 预览 SVG 和 WebCAD 转换效果
        // - 确认后指定插入点（可选缩放和旋转）
        await Engine.editor.executerWithOp('INSERTIMAGE');
        
        message.info("图片转矢量完成");
        message.info("可以使用 ZOOM E 命令缩放到全图查看");
        
        // 缩放到全图
        Engine.zoomExtents();
        
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
