window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --基础SVG导入--通过IMPORTSVG命令导入SVG文件
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
        
        // ==================== 基础 SVG 导入 ====================
        
        // IMPORTSVG 命令说明：
        // 打开 SVG 导入对话框，支持以下功能：
        // 1. 选择本地 SVG 文件或直接粘贴 SVG 内容
        // 2. 显示设置：显示线宽、启用填充、线宽缩放
        // 3. 颜色处理：白色/黑色的处理方式
        //    - 0: 原样保留
        //    - 1: 自动反色（白变黑，黑变白）
        //    - 2: 过滤排除（不导入该颜色）
        // 4. 插入选项：允许缩放、允许旋转
        // 5. 实时预览 SVG 原始效果和 WebCAD 转换效果
        
        message.info("执行 IMPORTSVG 命令...");
        message.info("在对话框中选择 SVG 文件或粘贴 SVG 内容");
        message.info("配置导入选项后点击\"导入\"按钮");
        
        // 执行 IMPORTSVG 命令
        // 命令会打开导入对话框，用户可以：
        // - 点击"选择文件"按钮选择本地 SVG 文件
        // - 在文本框中粘贴 SVG 内容
        // - 调整导入选项
        // - 预览导入效果
        // - 确认后指定插入点（可选缩放和旋转）
        await Engine.editor.executerWithOp('IMPORTSVG');
        
        message.info("SVG 导入完成");
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
