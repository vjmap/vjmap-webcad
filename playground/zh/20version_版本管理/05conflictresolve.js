window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --冲突解决--模拟两个分支修改同一实体产生冲突，演示冲突解决流程
        const { MainView, initCadContainer, Engine, DrawingManagerService, ConflictResolutionDialog, message } = vjcad;
        
        const assert = (condition, msg) => { if (!condition) throw new Error(msg); };
        
        const cadView = new MainView({
            appname: "唯杰CAD",
            version: "v1.0.0",
            serviceUrl: env.serviceUrl,
            accessToken: env.accessToken,
            sidebarStyle: "none",
        });
        
        initCadContainer("map", cadView);
        await cadView.onLoad();
        
        message.info("=== 冲突解决示例 ===");
        message.info("演示：两个分支修改同一实体 → 合并产生冲突 → 解决冲突 → 清理");
        
        const drawingManager = new DrawingManagerService();
        const timestamp = Date.now();
        const branchA = `conflict-test-A-${timestamp}`;
        const branchB = `conflict-test-B-${timestamp}`;
        const createdBranches = [];
        const mergedPatchIds = [];
        
        // 第一步：创建分支A
        message.info("");
        message.info("【第1步】创建分支A（模拟用户A）...");
        const createResultA = await drawingManager.createBranch({
            type: 'imports',
            mapid: env.exampleMapId,
            version: 'v1',
            sourceBranch: 'main',
            sourcePatchId: 'base',
            branchName: branchA
        });
        
        assert(createResultA.status, `创建分支A失败: ${createResultA.error}`);
        message.info(`分支 "${branchA}" 创建成功！`);
        createdBranches.push(branchA);
        
        // 第二步：创建分支B（从同一位置创建，模拟两个用户同时开始编辑）
        message.info("");
        message.info("【第2步】创建分支B（模拟用户B）...");
        const createResultB = await drawingManager.createBranch({
            type: 'imports',
            mapid: env.exampleMapId,
            version: 'v1',
            sourceBranch: 'main',
            sourcePatchId: 'base',
            branchName: branchB
        });
        
        assert(createResultB.status, `创建分支B失败: ${createResultB.error}`);
        message.info(`分支 "${branchB}" 创建成功！`);
        createdBranches.push(branchB);
        
        // 第三步：在分支A上修改已存在的实体（用户A修改颜色为红色）
        message.info("");
        message.info("【第3步】用户A在分支A上修改实体颜色为红色...");
        
        const openResultA = await drawingManager.openDrawing({
            type: 'imports',
            mapid: env.exampleMapId,
            version: 'v1',
            branch: branchA,
            patchId: 'base'
        });
        
        assert(openResultA.success, `打开分支A图纸失败: ${openResultA.error}`);
        
        const jsonStringA = openResultA.webcadJson;
        const docNameA = `${env.exampleMapId}_v1_${branchA}`;
        const virtualFileA = new File([jsonStringA], docNameA, { type: 'application/json' });
        await Engine.view.openDbDoc(virtualFileA, openResultA.webcadData);
        await Engine.currentDoc.setOriginalJson(jsonStringA);
        
        // 获取图纸中已存在的第一个实体，两个用户都修改它来制造冲突
        const allEntities = Engine.getEntities();
        assert(allEntities.length > 0, "图纸中没有实体，无法演示冲突");
        const targetEntity = allEntities[0];
        const targetEntityId = targetEntity.id;
        message.info(`找到目标实体: ${targetEntity.constructor.name}, ID: ${targetEntityId}`);
        
        // 用户A修改实体颜色为红色
        targetEntity.color = 1; // 红色
        message.info("用户A: 将实体颜色修改为红色");
        
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
            drawingName: '用户A修改',
            author: '用户A',
            remark: '修改实体颜色为红色'
        });
        
        assert(saveResultA.status, `分支A保存失败: ${saveResultA.error}`);
        message.info(`用户A保存成功! Patch ID: ${saveResultA.patchId}`);
        
        // 第四步：在分支B上修改同一个实体（用户B修改颜色为蓝色，制造冲突）
        message.info("");
        message.info("【第4步】用户B在分支B上修改同一实体颜色为蓝色（制造冲突）...");
        
        const openResultB = await drawingManager.openDrawing({
            type: 'imports',
            mapid: env.exampleMapId,
            version: 'v1',
            branch: branchB,
            patchId: 'base'
        });
        
        assert(openResultB.success, `打开分支B图纸失败: ${openResultB.error}`);
        
        const jsonStringB = openResultB.webcadJson;
        const docNameB = `${env.exampleMapId}_v1_${branchB}`;
        const virtualFileB = new File([jsonStringB], docNameB, { type: 'application/json' });
        await Engine.view.openDbDoc(virtualFileB, openResultB.webcadData);
        await Engine.currentDoc.setOriginalJson(jsonStringB);
        
        // 用户B修改同一个实体（通过ID找到）
        const allEntitiesB = Engine.getEntities();
        const targetEntityB = allEntitiesB.find(e => e.id === targetEntityId);
        assert(targetEntityB, `找不到目标实体: ${targetEntityId}`);
        
        // 用户B修改同一实体颜色为蓝色（与用户A的修改冲突）
        targetEntityB.color = 5; // 蓝色
        message.info("用户B: 将同一实体颜色修改为蓝色");
        
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
            drawingName: '用户B修改',
            author: '用户B',
            remark: '修改实体颜色为蓝色'
        });
        
        assert(saveResultB.status, `分支B保存失败: ${saveResultB.error}`);
        message.info(`用户B保存成功! Patch ID: ${saveResultB.patchId}`);
        
        // 第五步：先合并分支A到main（用户A先提交）
        message.info("");
        message.info("【第5步】将用户A的分支合并到main（先到先得）...");
        
        const mergeResultA = await drawingManager.mergeBranch({
            type: 'imports',
            mapid: env.exampleMapId,
            version: 'v1',
            sourceBranch: branchA,
            targetBranch: 'main',
            remark: '合并用户A的修改（红色）'
        });
        
        assert(mergeResultA.status, `合并分支A失败: ${mergeResultA.error}`);
        message.info(`用户A的分支合并成功！Patch ID: ${mergeResultA.patchId}`);
        if (mergeResultA.patchId) {
            mergedPatchIds.push({ branch: 'main', patchId: mergeResultA.patchId });
        }
        
        // 第六步：尝试合并分支B到main（此时应该产生冲突）
        message.info("");
        message.info("【第6步】尝试将用户B的分支合并到main（预期产生冲突）...");
        
        const mergeResultB = await drawingManager.mergeBranch({
            type: 'imports',
            mapid: env.exampleMapId,
            version: 'v1',
            sourceBranch: branchB,
            targetBranch: 'main',
            remark: '合并用户B的修改（蓝色）'
        });
        
        if (mergeResultB.conflict && mergeResultB.conflict.hasConflict) {
            message.error("检测到冲突！两个用户修改了相同区域");
            const conflictingEntities = mergeResultB.conflict.conflictingEntities || [];
            const conflictingLayers = mergeResultB.conflict.conflictingLayers || [];
            message.info(`冲突实体数: ${conflictingEntities.length}`);
            message.info(`冲突图层数: ${conflictingLayers.length}`);
            console.log('冲突详情:', mergeResultB.conflict);
            
            // 显示冲突解决对话框
            message.info("");
            message.info("【第7步】打开冲突解决对话框...");
            
            const dialog = new ConflictResolutionDialog();
            const resolution = await dialog.showDialog({
                conflictingEntities: mergeResultB.conflict.conflictingEntities,
                conflictingLayers: mergeResultB.conflict.conflictingLayers,
                latestPatchId: mergeResultB.conflict.latestPatchId
            });
            
            if (resolution && resolution.action === 'resolve') {
                message.info("用户选择了解决方案，重新尝试合并...");
                
                const retryResult = await drawingManager.mergeBranch({
                    type: 'imports',
                    mapid: env.exampleMapId,
                    version: 'v1',
                    sourceBranch: branchB,
                    targetBranch: 'main',
                    remark: '解决冲突后合并用户B的修改',
                    conflictResolution: resolution.resolution
                });
                
                if (retryResult.status) {
                    message.info(`冲突解决，合并成功！Patch ID: ${retryResult.patchId}`);
                    if (retryResult.patchId) {
                        mergedPatchIds.push({ branch: 'main', patchId: retryResult.patchId });
                    }
                } else {
                    message.error(`解决冲突后合并失败: ${retryResult.error}`);
                }
            } else {
                message.info("用户取消了冲突解决");
            }
        } else if (mergeResultB.status) {
            message.info("没有检测到冲突，合并成功（实体位置可能未完全重叠）");
            if (mergeResultB.patchId) {
                mergedPatchIds.push({ branch: 'main', patchId: mergeResultB.patchId });
            }
        } else {
            message.error(`合并分支B失败: ${mergeResultB.error}`);
        }
        
        Engine.zoomExtents();
        
        // 第八步：定时清理测试数据
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
