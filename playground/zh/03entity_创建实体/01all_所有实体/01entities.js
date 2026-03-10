window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp"
    };
    try {
        // --创建所有实体--表格展示所有实体类型
        const {
          MainView,
          initCadContainer,
          Engine,
          message,
          // 基础几何实体
          LineEnt,
          CircleEnt,
          ArcEnt,
          PolylineEnt,
          EllipseEnt,
          DotEnt,
          PixelPointEnt,
          // 文本实体
          TextEnt,
          MTextEnt,
          // 特殊实体
          HatchEnt,
          SolidEnt,
          SplineEnt,
          RayEnt,
          XLineEnt,
          InsertEnt,
          ImageRefEnt,
          ImageSource,
          // 标注实体
          LinearDimensionEnt,
          AlignedDimensionEnt,
          RadialDimensionEnt,
          DiametricDimensionEnt,
          AngleDimensionEnt,
          ArcDimensionEnt,
          OrdinateDimensionEnt,
          MLeaderEnt,
          // 辅助类
          Point2D,
          Edge,
          Edges,
          EdgeType,
          BulgePoints,
          BulgePoint,
          MLeaderContentType,
        } = vjcad;
        
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
        
        // 表格布局参数
        const cellWidth = 140;
        const cellHeight = 110;
        const labelHeight = 6;
        
        // 创建标签文字
        function createLabel(text, col, row) {
          const x = col * cellWidth + cellWidth / 2;
          const y = -row * cellHeight - cellHeight + 10;
          const label = new TextEnt();
          label.insertionPoint = [x, y];
          label.text = text;
          label.height = labelHeight;
          label.textAlignment = 2;
          label.setDefaults();
          label.color = 7;
          return label;
        }
        
        // 获取单元格中心坐标
        function getCellCenter(col, row) {
          return {
            x: col * cellWidth + cellWidth / 2,
            y: -row * cellHeight - cellHeight / 2 + 15
          };
        }
        
        // ==================== 第1行：基础几何实体 ====================
        let row = 0;
        
        // LineEnt
        {
          const { x, y } = getCellCenter(0, row);
          const line = new LineEnt([x - 40, y - 20], [x + 40, y + 20]);
          line.setDefaults();
          line.color = 1;
          entities.push(line, createLabel("LineEnt", 0, row));
        }
        
        // CircleEnt
        {
          const { x, y } = getCellCenter(1, row);
          const circle = new CircleEnt([x, y], 30);
          circle.setDefaults();
          circle.color = 3;
          entities.push(circle, createLabel("CircleEnt", 1, row));
        }
        
        // ArcEnt
        {
          const { x, y } = getCellCenter(2, row);
          const arc = new ArcEnt([x, y], 30, 0, Math.PI * 1.3);
          arc.setDefaults();
          arc.color = 4;
          entities.push(arc, createLabel("ArcEnt", 2, row));
        }
        
        // PolylineEnt
        {
          const { x, y } = getCellCenter(3, row);
          const pline = new PolylineEnt();
          pline.setPoints([
            [x - 35, y - 20],
            [x, y + 25],
            [x + 35, y - 20],
            [x + 15, y - 20],
            [x, y + 5],
            [x - 15, y - 20]
          ]);
          pline.isClosed = true;
          pline.setDefaults();
          pline.color = 5;
          entities.push(pline, createLabel("PolylineEnt", 3, row));
        }
        
        // EllipseEnt
        {
          const { x, y } = getCellCenter(4, row);
          const ellipse = new EllipseEnt([x, y], 45, 22, Math.PI / 6);
          ellipse.setDefaults();
          ellipse.color = 6;
          entities.push(ellipse, createLabel("EllipseEnt", 4, row));
        }
        
        // ==================== 第2行：点、文本 ====================
        row = 1;
        
        // DotEnt
        {
          const { x, y } = getCellCenter(0, row);
          for (let i = 0; i < 5; i++) {
            const dot = new DotEnt([x - 30 + i * 15, y], 2 + i);
            dot.setDefaults();
            dot.color = i + 1;
            entities.push(dot);
          }
          entities.push(createLabel("DotEnt", 0, row));
        }
        
        // PixelPointEnt
        {
          const { x, y } = getCellCenter(1, row);
          for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
              const pp = new PixelPointEnt([x - 20 + i * 10, y - 20 + j * 10]);
              pp.setDefaults();
              pp.color = ((i + j) % 6) + 1;
              entities.push(pp);
            }
          }
          entities.push(createLabel("PixelPointEnt", 1, row));
        }
        
        // TextEnt
        {
          const { x, y } = getCellCenter(2, row);
          const text = new TextEnt();
          text.insertionPoint = [x, y];
          text.text = "Hello CAD";
          text.height = 12;
          text.textAlignment = 5;
          text.setDefaults();
          text.color = 2;
          entities.push(text, createLabel("TextEnt", 2, row));
        }
        
        // MTextEnt
        {
          const { x, y } = getCellCenter(3, row);
          const mtext = new MTextEnt();
          mtext.insertionPoint = [x, y + 8];
          mtext.text = "多行文字\n第二行";
          mtext.height = 8;
          mtext.textAttachment = 5;
          mtext.setDefaults();
          mtext.color = 3;
          entities.push(mtext, createLabel("MTextEnt", 3, row));
        }
        
        // SplineEnt
        {
          const { x, y } = getCellCenter(4, row);
          const spline = new SplineEnt();
          spline.setControlPoints([
            [x - 45, y],
            [x - 15, y + 28],
            [x + 15, y - 28],
            [x + 45, y]
          ]);
          spline.setDefaults();
          spline.color = 6;
          entities.push(spline, createLabel("SplineEnt", 4, row));
        }
        
        // ==================== 第3行：填充、特殊形状 ====================
        row = 2;
        
        // SolidEnt
        {
          const { x, y } = getCellCenter(0, row);
          const solid = new SolidEnt(
            [x - 30, y - 20],
            [x + 30, y - 20],
            [x + 20, y + 25],
            [x - 20, y + 25]
          );
          solid.setDefaults();
          solid.color = 1;
          entities.push(solid, createLabel("SolidEnt", 0, row));
        }
        
        // HatchEnt
        {
          const { x, y } = getCellCenter(1, row);
          const boundary = new PolylineEnt();
          boundary.setPoints([
            [x - 30, y - 20],
            [x + 30, y - 20],
            [x + 30, y + 25],
            [x - 30, y + 25]
          ]);
          boundary.isClosed = true;
          boundary.setDefaults();
          boundary.color = 7;
          
          const hatch = new HatchEnt();
          hatch.patternName = "ANSI31";
          const edge = new Edge();
          edge.edgeType = EdgeType.Polyline;
          edge.bulgePoints = boundary.bulgePoints.clone();
          const edges = new Edges();
          edges.add(edge);
          hatch.setLoops(edges);
          hatch.setDefaults();
          hatch.color = 4;
          
          entities.push(boundary, hatch, createLabel("HatchEnt", 1, row));
        }
        
        // EllipseArc (椭圆弧)
        {
          const { x, y } = getCellCenter(2, row);
          const ellipseArc = new EllipseEnt([x, y], 40, 20, 0);
          ellipseArc.startAngle = 0;
          ellipseArc.endAngle = Math.PI * 1.2;
          ellipseArc.setDefaults();
          ellipseArc.color = 5;
          entities.push(ellipseArc, createLabel("EllipseArc", 2, row));
        }
        
        // Polygon (正六边形)
        {
          const { x, y } = getCellCenter(3, row);
          const polygon = new PolylineEnt();
          const sides = 6;
          const radius = 30;
          for (let i = 0; i < sides; i++) {
            const angle = (2 * i * Math.PI) / sides;
            polygon.bulgePoints.add(new BulgePoint(new Point2D(
              x + radius * Math.cos(angle),
              y + radius * Math.sin(angle)
            ), 0));
          }
          polygon.isClosed = true;
          polygon.setDefaults();
          polygon.color = 3;
          entities.push(polygon, createLabel("Polygon", 3, row));
        }
        
        // Donut (圆环)
        {
          const { x, y } = getCellCenter(4, row);
          const innerR = 12;
          const outerR = 28;
          const middleR = (innerR + outerR) / 2;
          const lineWidth = outerR - innerR;
          const arcParam = (middleR * Math.sqrt(2)) / 2;
          const bulge = (middleR - arcParam) / arcParam;
          
          const donut = new PolylineEnt();
          donut.bulgePoints.add(new BulgePoint(new Point2D(x + middleR, y), bulge));
          donut.bulgePoints.add(new BulgePoint(new Point2D(x, y + middleR), bulge));
          donut.bulgePoints.add(new BulgePoint(new Point2D(x - middleR, y), bulge));
          donut.bulgePoints.add(new BulgePoint(new Point2D(x, y - middleR), bulge));
          donut.bulgePoints.add(new BulgePoint(new Point2D(x + middleR, y), 0));
          donut.isClosed = false;
          donut.globalWidth = lineWidth;
          donut.setDefaults();
          donut.color = 4;
          entities.push(donut, createLabel("Donut", 4, row));
        }
        
        // ==================== 第4行：块、图像、圆角矩形 ====================
        row = 3;
        
        // InsertEnt (块插入)
        {
          const { x, y } = getCellCenter(0, row);
          const doc = Engine.currentDoc;
          const blockName = "DemoBlock";
          
          let blockDef = doc.blocks.itemByName(blockName);
          if (!blockDef) {
            blockDef = doc.blocks.add(blockName);
            blockDef.basePoint = [0, 0];
            const l1 = new LineEnt([-15, 0], [15, 0]);
            const l2 = new LineEnt([0, -15], [0, 15]);
            const c = new CircleEnt([0, 0], 10);
            l1.setDefaults();
            l2.setDefaults();
            c.setDefaults();
            blockDef.addEntity(l1);
            blockDef.addEntity(l2);
            blockDef.addEntity(c);
          }
          
          const insert = new InsertEnt();
          insert.blockId = blockDef.blockId;
          insert.insertionPoint = [x, y];
          insert.scaleFactor = 1.5;
          insert.rotation = 0;
          insert.setDefaults();
          insert.color = 5;
          entities.push(insert, createLabel("InsertEnt", 0, row));
        }
        
        // ImageRefEnt (图像)
        {
          const { x, y } = getCellCenter(1, row);
          // 创建简单的彩色方块图像
          const canvas = document.createElement('canvas');
          canvas.width = 60;
          canvas.height = 40;
          const ctx = canvas.getContext('2d');
          const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
              ctx.fillStyle = colors[i + j * 3];
              ctx.fillRect(i * 20, j * 20, 20, 20);
            }
          }
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1;
          ctx.strokeRect(0, 0, 60, 40);
          
          const base64Data = canvas.toDataURL('image/png').split(',')[1];
          const imgSource = new ImageSource("DemoImage", "image/png", base64Data);
          await imgSource.initTexture();
          Engine.activeDocument.images.add(imgSource);
          
          const imgRef = new ImageRefEnt([x - 30, y - 20], 0, 1);
          imgRef.setImageSource(imgSource);
          imgRef.setDefaults();
          entities.push(imgRef, createLabel("ImageRefEnt", 1, row));
        }
        
        // RoundedRectangle (圆角矩形)
        {
          const { x, y } = getCellCenter(2, row);
          const r = 8;
          const w = 60, h = 40;
          const minX = x - w/2, maxX = x + w/2;
          const minY = y - h/2, maxY = y + h/2;
          const bulge = Math.tan(Math.PI / 8);
          
          const rect = new PolylineEnt();
          rect.bulgePoints.add(new BulgePoint(new Point2D(minX + r, minY), 0));
          rect.bulgePoints.add(new BulgePoint(new Point2D(maxX - r, minY), bulge));
          rect.bulgePoints.add(new BulgePoint(new Point2D(maxX, minY + r), 0));
          rect.bulgePoints.add(new BulgePoint(new Point2D(maxX, maxY - r), bulge));
          rect.bulgePoints.add(new BulgePoint(new Point2D(maxX - r, maxY), 0));
          rect.bulgePoints.add(new BulgePoint(new Point2D(minX + r, maxY), bulge));
          rect.bulgePoints.add(new BulgePoint(new Point2D(minX, maxY - r), 0));
          rect.bulgePoints.add(new BulgePoint(new Point2D(minX, minY + r), bulge));
          rect.isClosed = true;
          rect.setDefaults();
          rect.color = 6;
          entities.push(rect, createLabel("RoundedRect", 2, row));
        }
        
        // LinearDimensionEnt
        {
          const { x, y } = getCellCenter(3, row);
          const line = new LineEnt([x - 40, y - 15], [x + 40, y - 15]);
          line.setDefaults();
          line.color = 7;
          
          const dim = new LinearDimensionEnt(
            new Point2D(x - 40, y - 15),
            new Point2D(x + 40, y - 15),
            new Point2D(x, y + 15),
            0
          );
          dim.setDefaults();
          dim.color = 3;
          entities.push(line, dim, createLabel("LinearDimension", 3, row));
        }
        
        // AlignedDimensionEnt
        {
          const { x, y } = getCellCenter(4, row);
          const line = new LineEnt([x - 35, y - 20], [x + 30, y + 15]);
          line.setDefaults();
          line.color = 7;
          
          const dim = new AlignedDimensionEnt(
            new Point2D(x - 35, y - 20),
            new Point2D(x + 30, y + 15),
            new Point2D(x + 10, y + 20)
          );
          dim.setDefaults();
          dim.color = 5;
          entities.push(line, dim, createLabel("AlignedDimension", 4, row));
        }
        
        // ==================== 第5行：更多标注 ====================
        row = 4;
        
        // RadialDimensionEnt
        {
          const { x, y } = getCellCenter(0, row);
          const circle = new CircleEnt([x, y], 28);
          circle.setDefaults();
          circle.color = 7;
          
          const dim = new RadialDimensionEnt(
            new Point2D(x, y),
            new Point2D(x + 28, y),
            10
          );
          dim.setDefaults();
          dim.color = 1;
          entities.push(circle, dim, createLabel("RadialDimension", 0, row));
        }
        
        // DiametricDimensionEnt
        {
          const { x, y } = getCellCenter(1, row);
          const circle = new CircleEnt([x, y], 28);
          circle.setDefaults();
          circle.color = 7;
          
          const dim = new DiametricDimensionEnt(
            new Point2D(x + 28, y),
            new Point2D(x - 28, y)
          );
          dim.setDefaults();
          dim.color = 4;
          entities.push(circle, dim, createLabel("DiametricDimension", 1, row));
        }
        
        // AngleDimensionEnt
        {
          const { x, y } = getCellCenter(2, row);
          const line1 = new LineEnt([x, y], [x + 45, y]);
          line1.setDefaults();
          line1.color = 7;
          const line2 = new LineEnt([x, y], [x + 32, y + 32]);
          line2.setDefaults();
          line2.color = 7;
          
          const dim = new AngleDimensionEnt(
            new Point2D(x, y),
            new Point2D(x + 45, y),
            new Point2D(x + 32, y + 32),
            22
          );
          dim.setDefaults();
          dim.color = 1;
          entities.push(line1, line2, dim, createLabel("AngleDimension", 2, row));
        }
        
        // ArcDimensionEnt
        {
          const { x, y } = getCellCenter(3, row);
          const startAngle = 0;
          const endAngle = Math.PI * 0.6;
          const radius = 28;
          
          const arc = new ArcEnt([x, y], radius, startAngle, endAngle);
          arc.setDefaults();
          arc.color = 7;
          
          const midAngle = (startAngle + endAngle) / 2;
          const dim = new ArcDimensionEnt(
            new Point2D(x, y),
            new Point2D(x + radius, y),
            new Point2D(x + radius * Math.cos(endAngle), y + radius * Math.sin(endAngle)),
            new Point2D(x + radius * 1.3 * Math.cos(midAngle), y + radius * 1.3 * Math.sin(midAngle))
          );
          dim.setDefaults();
          dim.color = 3;
          entities.push(arc, dim, createLabel("ArcDimension", 3, row));
        }
        
        // OrdinateDimensionEnt
        {
          const { x, y } = getCellCenter(4, row);
          const originMark = new CircleEnt([x - 30, y - 20], 2);
          originMark.setDefaults();
          originMark.color = 1;
          
          const pointMark = new CircleEnt([x + 15, y + 8], 2);
          pointMark.setDefaults();
          pointMark.color = 7;
          
          const dim = new OrdinateDimensionEnt(
            new Point2D(x - 30, y - 20),
            new Point2D(x + 15, y + 8),
            new Point2D(x + 15, y + 28),
            'xy'
          );
          dim.setDefaults();
          dim.color = 5;
          entities.push(originMark, pointMark, dim, createLabel("OrdinateDimension", 4, row));
        }
        
        // ==================== 第6行：引线 ====================
        row = 5;
        
        // MLeaderEnt
        {
          const { x, y } = getCellCenter(0, row);
          const mleader = new MLeaderEnt();
          mleader.contentType = MLeaderContentType.MText;
          mleader.textContent = "标注";
          mleader.textPosition = new Point2D(x + 25, y + 15);
          mleader.textHeight = 6;
          mleader.addLeaderLine(new Point2D(x - 30, y - 15));
          mleader.setDefaults();
          mleader.color = 5;
          entities.push(mleader, createLabel("MLeaderEnt", 0, row));
        }
        
        // ==================== 第7行：RayEnt（单独成行，水平） ====================
        row = 6;
        {
          const { x, y } = getCellCenter(0, row);
          const ray = new RayEnt([x, y], 0);
          ray.setDefaults();
          ray.color = 1;
          entities.push(ray, createLabel("RayEnt", 0, row));
        }
        
        // ==================== 第8行：XLineEnt（单独成行，水平） ====================
        row = 7;
        {
          const { x, y } = getCellCenter(0, row);
          const xline = new XLineEnt([x, y], 0);
          xline.setDefaults();
          xline.color = 2;
          entities.push(xline, createLabel("XLineEnt", 0, row));
        }
        
        // 添加所有实体
        Engine.addEntities(entities);
        Engine.zoomExtents();
        
        message.info("所有实体类型展示完成");
        message.info("共创建 " + entities.length + " 个图元");
        
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
