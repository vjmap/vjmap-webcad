window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --扩展数据--为实体附加自定义数据，支持导出到DWG并重新加载
        const { MainView, initCadContainer, LineEnt, CircleEnt, Engine, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "right",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ========== 1. 设置扩展数据 ==========
        // 使用 setExtData(appName, data) 方法
        // appName: 应用程序名，用于标识数据来源（在DWG中注册）
        // data: 任意JavaScript对象，将被序列化为JSON存储
        
        // 创建一条线并附加传感器数据
        const sensorLine = new LineEnt([0, 0], [100, 0]);
        sensorLine.setDefaults();
        sensorLine.color = 1; // 红色
        sensorLine.setExtData("SENSOR_DATA", {
            name: "温度传感器",
            value: 25.5,
            unit: "℃",
            isActive: true,
            lastUpdate: "2026-01-29"
        });
        Engine.addEntities(sensorLine);
        message.info("创建带传感器数据的线段");
        
        // 创建一个圆并附加设备信息
        const deviceCircle = new CircleEnt([150, 0], 20);
        deviceCircle.setDefaults();
        deviceCircle.color = 3; // 绿色
        deviceCircle.setExtData("DEVICE_INFO", {
            deviceId: "DEV-001",
            type: "阀门",
            status: "open",
            pressure: 1.2,
            tags: ["重要", "定期检查"]
        });
        Engine.addEntities(deviceCircle);
        message.info("创建带设备信息的圆");
        
        // 创建一条线附加管道属性
        const pipeLine = new LineEnt([0, -50], [200, -50]);
        pipeLine.setDefaults();
        pipeLine.color = 5; // 蓝色
        pipeLine.setExtData("PIPE_ATTR", {
            material: "不锈钢",
            diameter: 100,
            thickness: 5,
            flow: 150.8,
            installDate: "2025-06-15"
        });
        Engine.addEntities(pipeLine);
        message.info("创建带管道属性的线段");
        
        // ========== 2. 读取扩展数据 ==========
        message.info("--- 读取扩展数据 ---");
        
        // 检查是否有扩展数据
        message.info(`sensorLine 有扩展数据: ${sensorLine.hasExtData()}`);
        
        // 获取应用程序名
        message.info(`sensorLine AppName: ${sensorLine.extDataAppName}`);
        
        // 获取扩展数据对象（已自动解析JSON）
        const sensorData = sensorLine.extData;
        if (sensorData) {
            message.info(`传感器名称: ${sensorData.name}`);
            message.info(`传感器值: ${sensorData.value}${sensorData.unit}`);
            message.info(`是否激活: ${sensorData.isActive}`);
        }
        
        // 读取设备信息
        const deviceData = deviceCircle.extData;
        if (deviceData) {
            message.info(`设备ID: ${deviceData.deviceId}`);
            message.info(`设备类型: ${deviceData.type}`);
            message.info(`标签: ${deviceData.tags.join(", ")}`);
        }
        
        // ========== 3. 修改扩展数据 ==========
        message.info("--- 修改扩展数据 ---");
        
        // 方式1：完整替换
        sensorLine.setExtData("SENSOR_DATA", {
            name: "温度传感器",
            value: 30.2,  // 更新温度值
            unit: "℃",
            isActive: true,
            lastUpdate: "2026-01-29",
            alarm: true   // 新增报警字段
        });
        message.info("更新传感器数据：温度 30.2℃，报警状态");
        
        // 方式2：基于现有数据修改
        const currentPipeData = pipeLine.extData;
        if (currentPipeData) {
            currentPipeData.flow = 180.5;  // 更新流量
            currentPipeData.lastCheck = "2026-01-28";  // 新增检查日期
            pipeLine.setExtData("PIPE_ATTR", currentPipeData);
            message.info("更新管道流量和检查日期");
        }
        
        // ========== 4. 清除扩展数据 ==========
        // 创建一个临时实体演示清除功能
        const tempLine = new LineEnt([0, -100], [50, -100]);
        tempLine.setDefaults();
        tempLine.setExtData("TEMP", { test: "data" });
        Engine.addEntities(tempLine);
        
        message.info(`清除前有扩展数据: ${tempLine.hasExtData()}`);
        tempLine.clearExtData();
        message.info(`清除后有扩展数据: ${tempLine.hasExtData()}`);
        
        // ========== 5. 获取原始xdata（高级用法） ==========
        message.info("--- 原始xdata格式 ---");
        
        // xdataRaw 返回原始格式: { "1001": "AppName", "1000": "JSON字符串" }
        const rawXData = sensorLine.xdataRaw;
        if (rawXData) {
            message.info(`1001 (AppName): ${rawXData["1001"]}`);
            message.info(`1000 (JSON): ${rawXData["1000"]}`);
        }
        
        // ========== 6. 批量查询带扩展数据的实体 ==========
        message.info("--- 查询带扩展数据的实体 ---");
        
        const allEntities = Engine.getEntities();
        const entitiesWithXData = allEntities.filter(ent => ent.hasExtData?.());
        message.info(`总实体数: ${allEntities.length}`);
        message.info(`有扩展数据的实体数: ${entitiesWithXData.length}`);
        
        // 按AppName分类
        const byAppName = {};
        entitiesWithXData.forEach(ent => {
            const appName = ent.extDataAppName;
            if (!byAppName[appName]) byAppName[appName] = [];
            byAppName[appName].push(ent);
        });
        Object.entries(byAppName).forEach(([name, entities]) => {
            message.info(`  ${name}: ${entities.length}个实体`);
        });
        
        // ========== 7. 使用属性面板查看/编辑 ==========
        message.info("--- 使用属性面板 ---");
        message.info("选中实体后，在右侧属性面板可以看到'扩展数据'行");
        message.info("点击旁边的按钮可打开详细编辑对话框");
        
        // 自动选中传感器线，方便用户查看属性面板
        Engine.ssSetFirst([sensorLine]);
        
        Engine.zoomExtents();
        
        message.success("扩展数据示例完成！");
        message.info("提示：导出为DWG后重新打开，扩展数据会保留");
        
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
