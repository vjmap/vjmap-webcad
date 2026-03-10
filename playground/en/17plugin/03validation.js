window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --校验插件--数据校验示例
        const { MainView, initCadContainer, LineEnt, CircleEnt, Engine, CadEvents, writeMessage , message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 校验插件示例 ===");
        message.info("在实体创建前进行校验，不符合规则则阻止创建");
        
        // 校验规则配置
        const validationRules = {
            minLineLength: 10,       // 直线最小长度
            maxCircleRadius: 100,    // 圆最大半径
            minCircleRadius: 5,      // 圆最小半径
            allowedLayers: ['0', '图层A', '图层B'],  // 允许的图层
        };
        
        // 校验插件
        class ValidationPlugin {
            constructor(rules) {
                this.rules = rules;
                this.enabled = true;
            }
            
            install() {
                // 使用 EntityAdding 事件（可取消）
                Engine.eventManager.on(CadEvents.EntityAdding, (args) => {
                    if (!this.enabled) return;
                    
                    const result = this.validate(args.entity);
                    if (!result.valid) {
                        args.cancel = true;  // 阻止实体添加
                        writeMessage(`<br/><span style='color:red'>❌ 校验失败: ${result.message}</span>`);
                    } else {
                        writeMessage(`<br/><span style='color:green'>✓ 校验通过</span>`);
                    }
                });
                
                message.info("校验插件已安装");
                message.info("规则:", JSON.stringify(this.rules, null, 2));
            }
            
            validate(entity) {
                // 校验直线长度
                if (entity.type === 'LINE') {
                    if (entity.Length < this.rules.minLineLength) {
                        return { valid: false, message: `直线长度 ${entity.Length.toFixed(2)} 小于最小值 ${this.rules.minLineLength}` };
                    }
                }
                
                // 校验圆半径
                if (entity.type === 'CIRCLE') {
                    if (entity.radius > this.rules.maxCircleRadius) {
                        return { valid: false, message: `圆半径 ${entity.radius} 大于最大值 ${this.rules.maxCircleRadius}` };
                    }
                    if (entity.radius < this.rules.minCircleRadius) {
                        return { valid: false, message: `圆半径 ${entity.radius} 小于最小值 ${this.rules.minCircleRadius}` };
                    }
                }
                
                // 校验图层
                if (entity.layer && !this.rules.allowedLayers.includes(entity.layer)) {
                    return { valid: false, message: `图层 "${entity.layer}" 不在允许列表中` };
                }
                
                return { valid: true };
            }
            
            toggle() {
                this.enabled = !this.enabled;
                writeMessage(`<br/>校验插件已${this.enabled ? '启用' : '禁用'}`);
            }
            
            updateRule(key, value) {
                this.rules[key] = value;
                writeMessage(`<br/>规则已更新: ${key} = ${value}`);
            }
        }
        
        // 安装校验插件
        const validator = new ValidationPlugin(validationRules);
        validator.install();
        
        // 演示校验
        message.info("\n演示校验功能...");
        
        // 测试1：正常直线（通过）使用简化写法
        setTimeout(() => {
            message.info("\n测试1: 创建长度为50的直线（应通过）");
            const line1 = new LineEnt([0, 0], [50, 0]);
            line1.setDefaults();
            Engine.addEntities(line1);
        }, 1000);
        
        // 测试2：过短直线（失败）
        setTimeout(() => {
            message.info("\n测试2: 创建长度为5的直线（应失败）");
            const line2 = new LineEnt([0, 20], [5, 20]);
            line2.setDefaults();
            Engine.addEntities(line2);
        }, 2500);
        
        // 测试3：正常圆（通过）
        setTimeout(() => {
            message.info("\n测试3: 创建半径为30的圆（应通过）");
            const circle1 = new CircleEnt([80, 30], 30);
            circle1.setDefaults();
            Engine.addEntities(circle1);
            Engine.zoomExtents();
        }, 4000);
        
        // 测试4：过大圆（失败）
        setTimeout(() => {
            message.info("\n测试4: 创建半径为150的圆（应失败）");
            const circle2 = new CircleEnt([100, 100], 150);
            circle2.setDefaults();
            Engine.addEntities(circle2);
        }, 5500);
        
        message.info("\n查看命令行输出，观察校验结果");
        
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
