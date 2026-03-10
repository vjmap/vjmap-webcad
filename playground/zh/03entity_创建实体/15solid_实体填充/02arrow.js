window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --实体填充箭头--使用SolidEnt创建各种箭头形状
        const { MainView, initCadContainer, SolidEnt, LineEnt, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        const entities = [];
        
        /**
         * 创建箭头
         * @param x 箭头尖端X坐标
         * @param y 箭头尖端Y坐标
         * @param length 箭头长度
         * @param width 箭头宽度
         * @param angle 箭头角度（弧度）
         * @param color 颜色
         */
        function createArrow(x, y, length, width, angle, color) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            // 箭头三个点
            const tipX = x;
            const tipY = y;
            const leftX = x - cos * length + sin * width / 2;
            const leftY = y - sin * length - cos * width / 2;
            const rightX = x - cos * length - sin * width / 2;
            const rightY = y - sin * length + cos * width / 2;
            
            const arrow = new SolidEnt(
                [tipX, tipY],
                [leftX, leftY],
                [rightX, rightY]
            );
            arrow.setDefaults();
            arrow.color = color;
            return arrow;
        }
        
        // 创建指向不同方向的箭头
        const directions = [
            { angle: 0, label: "右" },
            { angle: Math.PI / 2, label: "上" },
            { angle: Math.PI, label: "左" },
            { angle: -Math.PI / 2, label: "下" },
            { angle: Math.PI / 4, label: "右上" },
            { angle: Math.PI * 3 / 4, label: "左上" },
            { angle: -Math.PI / 4, label: "右下" },
            { angle: -Math.PI * 3 / 4, label: "左下" }
        ];
        
        const centerX = 50, centerY = 50;
        const arrowDistance = 30;
        const arrowLength = 15;
        const arrowWidth = 10;
        const colors = [1, 3, 5, 4, 6, 2, 30, 40];
        
        directions.forEach((dir, index) => {
            const x = centerX + Math.cos(dir.angle) * arrowDistance;
            const y = centerY + Math.sin(dir.angle) * arrowDistance;
            
            const arrow = createArrow(x, y, arrowLength, arrowWidth, dir.angle, colors[index]);
            entities.push(arrow);
            
            // 添加连接线（从中心到箭头）
            const lineEndX = x - Math.cos(dir.angle) * arrowLength;
            const lineEndY = y - Math.sin(dir.angle) * arrowLength;
            const line = new LineEnt([centerX, centerY], [lineEndX, lineEndY]);
            line.setDefaults();
            line.color = 8;
            entities.push(line);
        });
        
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        console.log("箭头已创建");
        console.log("箭头数量:", directions.length);
        console.log("箭头长度:", arrowLength);
        console.log("箭头宽度:", arrowWidth);
        
        message.info("使用实体填充创建8个方向的箭头");
        
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
