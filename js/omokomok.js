const OMOK = {
  lineCount: 19,
  margin: 20,
  canvas: document.getElementById('board'),
  init() {
    OMOK.clear();
    OMOK.drawBoard();
  },
  clear() {},
  drawBoard() {
    const ctx = OMOK.canvas.getContext('2d');
    const space = (OMOK.canvas.width - OMOK.margin * 2) / (OMOK.lineCount - 1);

    for (let index = 0; index < OMOK.lineCount; index += 1) {
      const startPoint = index * space + OMOK.margin;
      ctx.moveTo(startPoint, OMOK.margin);
      ctx.lineTo(startPoint, OMOK.canvas.height - OMOK.margin);
      ctx.moveTo(OMOK.margin, startPoint);
      ctx.lineTo(OMOK.canvas.height - OMOK.margin, startPoint);
    }
    ctx.stroke();

    const centerX = OMOK.canvas.width / 2;
    const centerY = OMOK.canvas.height / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerX, 3, 0, 2 * Math.PI, false);
    ctx.fill();
  },
};

OMOK.init();
