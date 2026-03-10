window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --多语言/国际化(i18n)--强制指定界面语言或自动检测
        const { MainView, initCadContainer, initLocale, setLocale, getLocale, registerMessages, t, message } = vjcad;
        
        // ── 方式一：强制指定英文（在创建 MainView 之前调用）────────────────────────
        // initLocale('en-US');
        
        // ── 方式二：强制指定中文 ─────────────────────────────────────────────────────
        // initLocale('zh-CN');
        
        // ── 方式三：不指定，自动检测（默认行为）─────────────────────────────────────
        // 检测优先级：URL ?lang= > localStorage vjcad-locale > navigator.language > zh-CN
        // initLocale();  // 等价于不调用，MainView 构造时会自动调用
        
        // ── 方式四：通过 MainView 的 locale 配置项指定（推荐方式）────────────────────
        // new MainView({ locale: 'en-US', ... })
        
        // 注册应用级翻译（可选）
        // 如果有自定义文案需要多语言支持，可在此注册
        registerMessages({
            'zh-CN': {
                'demo.title': '多语言演示',
                'demo.currentLang': '当前语言',
                'demo.switchTo': '切换到',
            },
            'en-US': {
                'demo.title': 'i18n Demo',
                'demo.currentLang': 'Current language',
                'demo.switchTo': 'Switch to',
            },
        });
        
        // 通过 MainView 的 locale 选项强制指定英文
        const cadView = new MainView({
            appname: "WebCAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            // 强制指定英文界面
            // 如需中文，改为 'zh-CN'；如需自动检测，删除此行
            locale: 'en-US',
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        // 获取当前生效的语言
        const currentLocale = getLocale();
        message.info(`${t('demo.currentLang')}: ${currentLocale}`);
        
        // ── 运行时切换语言（会保存到 localStorage 并刷新页面）────────────────────────
        // setLocale('zh-CN');   // 切换到中文（页面会刷新）
        // setLocale('en-US');   // 切换到英文（页面会刷新）
        
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
