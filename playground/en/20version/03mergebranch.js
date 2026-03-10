window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --合并分支--创建两个分支，修改后合并，演示完整分支工作流
        const { MainView, initCadContainer, Engine, LineEnt, CircleEnt, DrawingManagerService, message } = vjcad;
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 分支合并完整流程示例 ===");
        message.info("演示：创建分支 → 修改 → 合并 → 清理");
        
        const drawingManager = new DrawingManagerService();
        const timestamp = Date.now();
        const branchA = `test-branch-A-${timestamp}`;
        const branchB = `test-branch-B-${timestamp}`;
        const createdBranches = [];
        const mergedPatchIds = [];  // 追踪合并产生的patchId
        
        // 第一步：创建分支A
        message.info("");
        message.info("【第1步】创建分支A...");
        const createResultA = await drawingManager.createBranch({
            type: 'imports',
            mapid: env.exampleMapId,
            version: 'v1',
            sourceBranch: 'main',
            sourcePatchId: 'base',
            branchName: branchA
        });
        
        if (!createResultA.status) {
            message.error(`创建分支A失败: ${createResultA.error}`);
        } else {
            message.info(`分支 "${branchA}" 创建成功！`);
            createdBranches.push(branchA);
            
            // 第二步：创建分支B
            message.info("");
            message.info("【第2步】创建分支B...");
            const createResultB = await drawingManager.createBranch({
                type: 'imports',
                mapid: env.exampleMapId,
                version: 'v1',
                sourceBranch: 'main',
                sourcePatchId: 'base',
                branchName: branchB
            });
            
            if (!createResultB.status) {
                message.error(`创建分支B失败: ${createResultB.error}`);
            } else {
                message.info(`分支 "${branchB}" 创建成功！`);
                createdBranches.push(branchB);
                
                // 第三步：在分支A上修改
                message.info("");
                message.info("【第3步】在分支A上进行修改...");
                
                // 打开分支A的图纸
                const openResultA = await drawingManager.openDrawing({
                    type: 'imports',
                    mapid: env.exampleMapId,
                    version: 'v1',
                    branch: branchA,
                    patchId: 'base'
                });
                
                if (!openResultA.success) {
                    message.error(`打开分支A图纸失败: ${openResultA.error}`);
                } else {
                    // 加载图纸
                    const jsonStringA = openResultA.webcadJson;
                    const docNameA = `${env.exampleMapId}_v1_${branchA}`;
                    const virtualFileA = new File([jsonStringA], docNameA, { type: 'application/json' });
                    await Engine.view.openDbDoc(virtualFileA, openResultA.webcadData);
                    await Engine.currentDoc.setOriginalJson(jsonStringA);
                    
                    // 在分支A添加圆形
                    const initBounds = Engine.currentDoc.currentSpace.initBounds;
                    const centerX = initBounds ? (initBounds[0] + initBounds[2]) / 2 : 0;
                    const centerY = initBounds ? (initBounds[1] + initBounds[3]) / 2 : 0;
                    const size = initBounds ? Math.min(initBounds[2] - initBounds[0], initBounds[3] - initBounds[1]) * 0.1 : 100;
                    
                    const circleA = new CircleEnt([centerX - size, centerY], size * 0.5);
                    circleA.setDefaults();
                    circleA.color = 1; // 红色
                    Engine.addEntities(circleA);
                    message.info("分支A: 添加了红色圆形");
                    
                    // 保存分支A的修改
                    const currentJsonA = JSON.stringify(Engine.currentDoc.toDb());
                    const saveResultA = await drawingManager.saveDrawing({
                        type: 'imports',
                        mapid: env.exampleMapId,
                        version: 'v1',
                        branchName: branchA,
                        originalJson: jsonStringA,
                        currentJson: currentJsonA,
                        parentId: openResultA.latestPatchId || 'base',
                        drawingName: '分支A修改',
                        author: '测试用户',
                        remark: '在分支A添加红色圆形'
                    });
                    
                    if (saveResultA.status && saveResultA.patchId !== 'no_change') {
                        message.info(`分支A保存成功! Patch ID: ${saveResultA.patchId}`);
                    }
                    
                    // 第四步：在分支B上修改
                    message.info("");
                    message.info("【第4步】在分支B上进行修改...");
                    
                    const openResultB = await drawingManager.openDrawing({
                        type: 'imports',
                        mapid: env.exampleMapId,
                        version: 'v1',
                        branch: branchB,
                        patchId: 'base'
                    });
                    
                    if (!openResultB.success) {
                        message.error(`打开分支B图纸失败: ${openResultB.error}`);
                    } else {
                        // 加载图纸
                        const jsonStringB = openResultB.webcadJson;
                        const docNameB = `${env.exampleMapId}_v1_${branchB}`;
                        const virtualFileB = new File([jsonStringB], docNameB, { type: 'application/json' });
                        await Engine.view.openDbDoc(virtualFileB, openResultB.webcadData);
                        await Engine.currentDoc.setOriginalJson(jsonStringB);
                        
                        // 在分支B添加直线
                        const lineB = new LineEnt([centerX + size * 0.5, centerY - size], [centerX + size * 0.5, centerY + size]);
                        lineB.setDefaults();
                        lineB.color = 3; // 绿色
                        Engine.addEntities(lineB);
                        message.info("分支B: 添加了绿色直线");
                        
                        // 保存分支B的修改
                        const currentJsonB = JSON.stringify(Engine.currentDoc.toDb());
                        const saveResultB = await drawingManager.saveDrawing({
                            type: 'imports',
                            mapid: env.exampleMapId,
                            version: 'v1',
                            branchName: branchB,
                            originalJson: jsonStringB,
                            currentJson: currentJsonB,
                            parentId: openResultB.latestPatchId || 'base',
                            drawingName: '分支B修改',
                            author: '测试用户',
                            remark: '在分支B添加绿色直线'
                        });
                        
                        if (saveResultB.status && saveResultB.patchId !== 'no_change') {
                            message.info(`分支B保存成功! Patch ID: ${saveResultB.patchId}`);
                        }
                        
                        // 第五步：合并分支A到main
                        message.info("");
                        message.info("【第5步】将分支A合并到main...");
                        
                        const mergeResultA = await drawingManager.mergeBranch({
                            type: 'imports',
                            mapid: env.exampleMapId,
                            version: 'v1',
                            sourceBranch: branchA,
                            targetBranch: 'main',
                            remark: '合并分支A的红色圆形'
                        });
                        
                        if (mergeResultA.status) {
                            message.info(`分支A合并到main成功！Patch ID: ${mergeResultA.patchId}`);
                            if (mergeResultA.patchId) {
                                mergedPatchIds.push({ branch: 'main', patchId: mergeResultA.patchId });
                            }
                        } else if (mergeResultA.conflict && mergeResultA.conflict.hasConflict) {
                            message.warn("检测到冲突，跳过分支A合并");
                        } else {
                            message.error(`合并分支A失败: ${mergeResultA.error}`);
                        }
                        
                        // 第六步：合并分支B到main
                        message.info("");
                        message.info("【第6步】将分支B合并到main...");
                        
                        const mergeResultB = await drawingManager.mergeBranch({
                            type: 'imports',
                            mapid: env.exampleMapId,
                            version: 'v1',
                            sourceBranch: branchB,
                            targetBranch: 'main',
                            remark: '合并分支B的绿色直线'
                        });
                        
                        if (mergeResultB.status) {
                            message.info(`分支B合并到main成功！Patch ID: ${mergeResultB.patchId}`);
                            if (mergeResultB.patchId) {
                                mergedPatchIds.push({ branch: 'main', patchId: mergeResultB.patchId });
                            }
                        } else if (mergeResultB.conflict && mergeResultB.conflict.hasConflict) {
                            message.warn("检测到冲突，跳过分支B合并");
                        } else {
                            message.error(`合并分支B失败: ${mergeResultB.error}`);
                        }
                        
                        Engine.zoomExtents();
                    }
                }
            }
        }
        
        // 第七步：定时清理测试数据
        if (createdBranches.length > 0 || mergedPatchIds.length > 0) {
            message.info("");
            message.info(`【清理】10秒后将删除测试数据...`);
            message.info(`  - 合并产生的Patch: ${mergedPatchIds.length}个`);
            message.info(`  - 测试分支: ${createdBranches.join(', ')}`);
            
            setTimeout(async () => {
                // 先删除合并产生的patchId（按逆序删除，后创建的先删除）
                for (let i = mergedPatchIds.length - 1; i >= 0; i--) {
                    const { branch, patchId } = mergedPatchIds[i];
                    const deleteResult = await drawingManager.deletePatch({
                        type: 'imports',
                        mapid: env.exampleMapId,
                        version: 'v1',
                        branch: branch,
                        patchId: patchId
                    });
                    
                    if (deleteResult.status) {
                        message.info(`Patch "${patchId}" 已删除`);
                    } else {
                        message.error(`删除Patch "${patchId}" 失败: ${deleteResult.error}`);
                    }
                }
                
                // 再删除测试分支
                for (const branchName of createdBranches) {
                    const deleteResult = await drawingManager.deleteBranch({
                        type: 'imports',
                        mapid: env.exampleMapId,
                        version: 'v1',
                        branchName: branchName
                    });
                    
                    if (deleteResult.status) {
                        message.info(`分支 "${branchName}" 已删除`);
                    } else {
                        message.error(`删除分支 "${branchName}" 失败: ${deleteResult.error}`);
                    }
                }
                message.info("测试数据清理完成！");
            }, 10000);
        }
        
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
