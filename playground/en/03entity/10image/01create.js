window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --图像插入--IMAGE插入图像示例（含base64）
        const { MainView, initCadContainer, Engine, ImageRefEnt, ImageSource, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 图像插入示例 ===");
        
        // ========== 生成 base64 示例图像 ==========
        message.info("\n生成 base64 示例图像...");
        
        // 创建一个简单的彩色方块图像（使用 Canvas）
        function createSampleImage(width, height) {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // 绘制彩色方块网格
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
            const blockSize = width / 3;
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 2; j++) {
                    ctx.fillStyle = colors[i + j * 3];
                    ctx.fillRect(i * blockSize, j * (height / 2), blockSize, height / 2);
                }
            }
            
            // 添加边框
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, width - 2, height - 2);
            
            // 添加文字
            ctx.fillStyle = '#333';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('WebCAD', width / 2, height / 2 + 6);
            
            return canvas.toDataURL('image/png');
        }
        
        // 生成 120x80 的示例图像
        const base64ImageDataUrl = createSampleImage(120, 80);
        message.info("示例图像已生成 (120x80 彩色方块)");
        
        // ========== 方法1：通过注册图像源插入 ==========
        message.info("\n=== 方法1：注册图像源后插入 ===");
        
        // 从 data URL 提取纯 base64 数据
        // data:image/png;base64,iVBORw0KGgo... -> iVBORw0KGgo...
        const base64Data = base64ImageDataUrl.split(',')[1];
        
        // 使用 ImageSource 类创建图像源（关键：必须使用 ImageSource 类并调用 initTexture）
        const imageSource = new ImageSource("SampleImage", "image/png", base64Data);
        await imageSource.initTexture();  // 关键：初始化 PixiJS 纹理
        Engine.activeDocument.images.add(imageSource);
        message.info(`图像源 "${imageSource.name}" 已注册`);
        message.info(`尺寸: ${imageSource.width} x ${imageSource.height}`);
        
        // 创建图像引用实体
        const imageRef1 = new ImageRefEnt([0, 0], 0, 1);
        imageRef1.setImageSource(imageSource);  // 使用 setImageSource 方法设置图像源
        imageRef1.scaleFactor = 1;
        imageRef1.rotation = 0;
        imageRef1.setDefaults();
        
        Engine.addEntities(imageRef1);
        message.info("图像引用已插入到 (0, 0)");
        
        // ========== 方法2：不同缩放和旋转 ==========
        message.info("\n=== 方法2：不同缩放和旋转 ===");
        
        // 插入缩放后的图像
        const imageRef2 = new ImageRefEnt([150, 0], 0, 0.5);
        imageRef2.setImageSource(imageSource);
        imageRef2.scaleFactor = 0.5;
        imageRef2.rotation = 0;
        imageRef2.setDefaults();
        
        Engine.addEntities(imageRef2);
        message.info("已插入缩放 0.5x 的图像到 (150, 0)");
        
        // 插入旋转后的图像
        const imageRef3 = new ImageRefEnt([0, 120], Math.PI / 6, 1);  // 旋转 30 度
        imageRef3.setImageSource(imageSource);
        imageRef3.scaleFactor = 1;
        imageRef3.rotation = Math.PI / 6;
        imageRef3.setDefaults();
        
        Engine.addEntities(imageRef3);
        message.info("已插入旋转 30° 的图像到 (0, 120)");
        
        Engine.zoomExtents();
        
        // ========== 图像相关命令 ==========
        message.info("\n=== 图像相关命令 ===");
        message.info("IMAGE         - 插入图像（选择文件）");
        message.info("IMAGEADJUST   - 调整图像（亮度、对比度等）");
        message.info("IMAGECLIP     - 裁剪图像");
        message.info("RESETIMAGECLIP - 重置图像裁剪");
        message.info("IMAGEPALETTEADD - 注册图像到图像面板");
        message.info("PURGEIMAGE    - 清理未使用的图像定义");
        
        message.info("\n执行命令: Engine.editor.executerWithOp('IMAGE')");
        
        // ========== 图像属性说明 ==========
        message.info("\n=== ImageRefEnt 属性 ===");
        message.info("url         - 图像 URL 或 base64 数据");
        message.info("ftype       - 文件类型 (png, jpg, etc.)");
        message.info("width       - 原始宽度");
        message.info("height      - 原始高度");
        message.info("scaleFactor - 缩放因子");
        message.info("rotation    - 旋转角度（弧度）");
        message.info("insertPoint - 插入点坐标");
        
        // ========== base64 图像使用说明 ==========
        message.info("\n=== base64 图像使用 ===");
        message.info("1. 使用 Canvas 生成图像数据 URL (data:image/png;base64,...)");
        message.info("2. 提取纯 base64 数据: dataUrl.split(',')[1]");
        message.info("3. 创建 ImageSource: new ImageSource(name, mimeType, base64)");
        message.info("4. 初始化纹理: await imageSource.initTexture() (关键步骤!)");
        message.info("5. 注册到文档: Engine.activeDocument.images.add(imageSource)");
        message.info("6. 创建 ImageRefEnt 并调用 setImageSource(imageSource)");
        message.info("7. 调用 Engine.addEntities() 添加到画布");
        
        console.log("base64 图像数据示例（前100字符）:", base64ImageDataUrl.substring(0, 100) + "...");
        
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
