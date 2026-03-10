window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --确认对话框--showConfirm、showInfo、showWarningConfirm用法
        const { MainView, initCadContainer, LineEnt, CircleEnt, Engine, showConfirm, showWarningConfirm, showInfo, showError, YesNoDialogConfig, YesNoDialog, writeMessage , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 创建一些实体
        const line = new LineEnt([0, 0], [100, 50]);
        line.setDefaults();
        const circle = new CircleEnt([60, 60], 25);
        circle.setDefaults();
        circle.color = 3;
        
        Engine.addEntities([line, circle]);
        Engine.zoomExtents();
        
        message.info("=== 确认对话框 ===");
        
        // 示例1：简单确认对话框
        message.info("\n--- 示例1: 简单确认 ---");
        
        const demo1 = async () => {
            const result = await showConfirm("确定要删除选中的实体吗？", "删除确认");
            writeMessage(`<br/>确认对话框结果: ${result}`);
            
            if (result === 'yes') {
                writeMessage("<br/><span style='color:green'>用户点击了【是】</span>");
            } else {
                writeMessage("<br/><span style='color:red'>用户点击了【否】</span>");
            }
        };
        
        // 示例2：警告确认对话框
        const demo2 = async () => {
            message.info("\n--- 示例2: 警告确认 ---");
            
            const result = await showWarningConfirm(
                "此操作不可撤销！确定要继续吗？",
                "危险操作"
            );
            writeMessage(`<br/>警告对话框结果: ${result}`);
        };
        
        // 示例3：信息提示对话框
        const demo3 = async () => {
            message.info("\n--- 示例3: 信息提示 ---");
            
            await showInfo("操作已完成，共处理了 5 个实体。", "操作完成");
            writeMessage("<br/>信息对话框已关闭");
        };
        
        // 示例4：错误提示对话框
        const demo4 = async () => {
            message.info("\n--- 示例4: 错误提示 ---");
            
            await showError("无法连接到服务器，请检查网络设置。", "连接错误");
            writeMessage("<br/>错误对话框已关闭");
        };
        
        // 示例5：自定义配置对话框
        const demo5 = async () => {
            message.info("\n--- 示例5: 自定义配置 ---");
            
            const config = new YesNoDialogConfig({
                title: "保存更改",
                message: "文件已修改，是否保存更改？<br/><br/><i>未保存的更改将会丢失。</i>",
                type: "warning",
                yesTitle: "保存(S)",
                noTitle: "不保存(N)",
                showCancel: true,
                cancelTitle: "取消"
            });
            
            const dialog = new YesNoDialog();
            const result = await dialog.showMessageBox(config);
            
            writeMessage(`<br/>自定义对话框结果: ${result}`);
            if (result === 'yes') {
                writeMessage("<br/>用户选择：保存");
            } else if (result === 'no') {
                writeMessage("<br/>用户选择：不保存");
            } else {
                writeMessage("<br/>用户选择：取消");
            }
        };
        
        // 依次执行演示
        setTimeout(demo1, 500);
        setTimeout(demo2, 3000);
        setTimeout(demo3, 6000);
        setTimeout(demo4, 8000);
        setTimeout(demo5, 10000);
        
        message.info("\n=== 便捷函数 ===");
        message.info("showConfirm(message, title?) - 确认对话框");
        message.info("showWarningConfirm(message, title?) - 警告确认");
        message.info("showInfo(message, title?) - 信息提示");
        message.info("showError(message, title?) - 错误提示");
        
        message.info("\n=== YesNoDialogConfig 配置 ===");
        message.info("title - 标题");
        message.info("message - 消息（支持HTML）");
        message.info("type - 类型: info/warning/error/confirm");
        message.info("yesTitle/noTitle - 按钮文本");
        message.info("showCancel - 是否显示取消按钮");
        message.info("confirmOnly - 只显示确认按钮");
        
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
