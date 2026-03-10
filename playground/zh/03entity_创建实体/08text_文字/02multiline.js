window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --多行文字--MTextEnt 基础与格式示例
        const { MainView, initCadContainer, MTextEnt, MTextAttachmentEnum, Engine , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // ========== 1. 基础多行文字（使用 \n 换行）==========
        const basicMText = new MTextEnt();
        basicMText.insertionPoint = [0, 120];
        basicMText.text = "这是第一行\n这是第二行\n这是第三行";  // \n 会自动转换为 MText 的 \P
        basicMText.height = 8;
        basicMText.setDefaults();
        Engine.addEntities(basicMText);
        
        // ========== 2. 使用原生 \P 换行符（MText 标准格式）==========
        const mtextWithP = new MTextEnt();
        mtextWithP.insertionPoint = [0, 80];
        mtextWithP.text = "使用\\P换行\\P第二行\\P第三行";  // 原生 MText 格式
        mtextWithP.height = 6;
        mtextWithP.setDefaults();
        Engine.addEntities(mtextWithP);
        
        // ========== 3. 限定宽度（自动换行）==========
        const wrappedText = new MTextEnt();
        wrappedText.insertionPoint = [0, 50];
        wrappedText.text = "这是一段很长的文字，设置了宽度限制后会自动换行。WebCAD支持中英文混合文本的智能换行处理。";
        wrappedText.height = 6;
        wrappedText.maxWidth = 80;  // 限制宽度，超出自动换行
        wrappedText.setDefaults();
        Engine.addEntities(wrappedText);
        
        // ========== 4. 不同附着点位置 ==========
        // TopLeft(7), TopCenter(8), TopRight(9)
        // MidLeft(4), MidCenter(5), MidRight(6)
        // BottomLeft(1), BottomCenter(2), BottomRight(3)
        const attachments = [
            { attach: MTextAttachmentEnum.TopLeft, name: "TopLeft(7)", x: 120, y: 120 },
            { attach: MTextAttachmentEnum.TopCenter, name: "TopCenter(8)", x: 200, y: 120 },
            { attach: MTextAttachmentEnum.MidLeft, name: "MidLeft(4)", x: 120, y: 80 },
            { attach: MTextAttachmentEnum.MidCenter, name: "MidCenter(5)", x: 200, y: 80 },
            { attach: MTextAttachmentEnum.BottomLeft, name: "BottomLeft(1)", x: 120, y: 40 },
            { attach: MTextAttachmentEnum.BottomCenter, name: "BottomCenter(2)", x: 200, y: 40 },
        ];
        
        attachments.forEach(({ attach, name, x, y }) => {
            const mtext = new MTextEnt();
            mtext.insertionPoint = [x, y];
            mtext.text = `${name}\n第二行`;
            mtext.height = 5;
            mtext.textAttachment = attach;
            mtext.setDefaults();
            Engine.addEntities(mtext);
        });
        
        // ========== 5. 行间距调整 ==========
        const spacings = [0.3, 0.5, 1.0, 1.5];  // 行间距因子
        spacings.forEach((sp, i) => {
            const mtext = new MTextEnt();
            mtext.insertionPoint = [300 + i * 60, 120];
            mtext.text = `行距${sp}\n第二行\n第三行`;
            mtext.height = 5;
            mtext.rowSpcFac = sp;  // 行间距因子
            mtext.setDefaults();
            Engine.addEntities(mtext);
        });
        
        // ========== 6. 旋转的多行文字 ==========
        const rotatedMText = new MTextEnt();
        rotatedMText.insertionPoint = [300, 60];
        rotatedMText.text = "旋转30°\n的多行文字";
        rotatedMText.height = 6;
        rotatedMText.rotation = Math.PI / 6;  // 30°
        rotatedMText.setDefaults();
        Engine.addEntities(rotatedMText);
        
        // ========== 7. 颜色多行文字 ==========
        const colorMText = new MTextEnt();
        colorMText.insertionPoint = [300, 20];
        colorMText.text = "红色文字\n第二行\n第三行";
        colorMText.height = 6;
        colorMText.setDefaults();
        colorMText.color = 1;  // 颜色必须在 setDefaults() 之后设置
        Engine.addEntities(colorMText);
        
        // ========== 8. 带边框的多行文字 ==========
        const borderedMText = new MTextEnt();
        borderedMText.insertionPoint = [400, 60];
        borderedMText.text = "带边框\n的文字";
        borderedMText.height = 6;
        borderedMText.setDefaults();
        borderedMText.showBorder = true;  // 显示边框
        Engine.addEntities(borderedMText);
        
        // ========== 9. 带背景的多行文字 ==========
        const bgMText = new MTextEnt();
        bgMText.insertionPoint = [400, 20];
        bgMText.text = "带背景\n遮罩文字";
        bgMText.height = 6;
        bgMText.setDefaults();
        bgMText.backgroundFill = true;       // 启用背景
        bgMText.backgroundFillColor = 250;   // 背景颜色
        bgMText.backgroundScaleFactor = 1.5; // 背景扩展比例
        Engine.addEntities(bgMText);
        
        // ========== 10. MText 格式代码 - 字号变化 ==========
        const sizeText = new MTextEnt();
        sizeText.insertionPoint = [0, 0];
        sizeText.contents = "{\\H1.5x;大号文字} 普通 {\\H0.7x;小号}";
        sizeText.height = 6;
        sizeText.setDefaults();
        Engine.addEntities(sizeText);
        
        // ========== 11. MText 格式代码 - 多颜色文字 ==========
        // \C 后面跟 ACI 颜色号: 1=红, 2=黄, 3=绿, 4=青, 5=蓝, 6=洋红
        const multiColorText = new MTextEnt();
        multiColorText.insertionPoint = [0, -25];
        multiColorText.contents = "{\\C1;红色}{\\C2;黄色}{\\C3;绿色}{\\C4;青色}{\\C5;蓝色}{\\C6;洋红}";
        multiColorText.height = 6;
        multiColorText.setDefaults();
        Engine.addEntities(multiColorText);
        
        // 多颜色段落
        const colorParagraph = new MTextEnt();
        colorParagraph.insertionPoint = [0, -45];
        colorParagraph.contents = "{\\C1;警告：}{\\C7;这是一条重要提示}\\P{\\C3;状态：}{\\C7;正常运行}";
        colorParagraph.height = 5;
        colorParagraph.setDefaults();
        Engine.addEntities(colorParagraph);
        
        // ========== 12. MText 格式代码 - 下划线与上划线 ==========
        // \L 开启下划线, \l 关闭下划线
        // \O 开启上划线, \o 关闭上划线
        const underlineText = new MTextEnt();
        underlineText.insertionPoint = [150, 0];
        underlineText.contents = "普通 {\\L下划线文字} 普通";
        underlineText.height = 6;
        underlineText.setDefaults();
        Engine.addEntities(underlineText);
        
        const overlineText = new MTextEnt();
        overlineText.insertionPoint = [150, -20];
        overlineText.contents = "普通 {\\O上划线文字} 普通";
        overlineText.height = 6;
        overlineText.setDefaults();
        Engine.addEntities(overlineText);
        
        // 删除线
        const strikeText = new MTextEnt();
        strikeText.insertionPoint = [150, -40];
        strikeText.contents = "普通 {\\K删除线文字} 普通";
        strikeText.height = 6;
        strikeText.setDefaults();
        Engine.addEntities(strikeText);
        
        // ========== 13. MText 格式代码 - 组合格式 ==========
        // 颜色 + 下划线
        const colorUnderline = new MTextEnt();
        colorUnderline.insertionPoint = [300, 0];
        colorUnderline.contents = "{\\C1;\\L红色下划线}";
        colorUnderline.height = 6;
        colorUnderline.setDefaults();
        Engine.addEntities(colorUnderline);
        
        // 大号 + 颜色 + 上下划线
        const complexFormat = new MTextEnt();
        complexFormat.insertionPoint = [300, -25];
        complexFormat.contents = "{\\H1.2x;\\C3;\\O\\L绿色上下划线}";
        complexFormat.height = 6;
        complexFormat.setDefaults();
        Engine.addEntities(complexFormat);
        
        // ========== 14. MText 格式代码 - 倾斜与宽度 ==========
        // \Q 设置倾斜角度, \W 设置宽度因子
        const obliqueText = new MTextEnt();
        obliqueText.insertionPoint = [300, -50];
        obliqueText.contents = "普通 {\\Q15;倾斜15°} 普通";
        obliqueText.height = 6;
        obliqueText.setDefaults();
        Engine.addEntities(obliqueText);
        
        const widthText = new MTextEnt();
        widthText.insertionPoint = [300, -70];
        widthText.contents = "普通 {\\W1.5;宽字} {\\W0.6;窄字} 普通";
        widthText.height = 6;
        widthText.setDefaults();
        Engine.addEntities(widthText);
        
        // ========== 15. 综合示例 - 混合格式 ==========
        const mixedText = new MTextEnt();
        mixedText.insertionPoint = [0, -80];
        mixedText.contents = "{\\H1.3x;\\C1;标题：}工程图纸说明\\P" +
            "{\\C3;状态：}审核通过 {\\C1;\\L重要}\\P" +
            "日期：2026-01-22 {\\C5;版本：}v1.0";
        mixedText.height = 5;
        mixedText.setDefaults();
        Engine.addEntities(mixedText);
        
        Engine.zoomExtents();
        
        console.log("多行文字示例创建完成");
        console.log("MText格式代码说明：");
        console.log("  \\Cn; - 颜色(1红 2黄 3绿 4青 5蓝 6洋红 7白)");
        console.log("  \\L/\\l - 下划线 开/关");
        console.log("  \\O/\\o - 上划线 开/关");
        console.log("  \\K/\\k - 删除线 开/关");
        console.log("  \\Hn.nx; - 相对高度");
        console.log("  \\Wn; - 宽度因子");
        console.log("  \\Qn; - 倾斜角度");
        console.log("  {} - 格式分组");
        
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
