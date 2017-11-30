const OMOK = {
  lineCount: 11,
  margin: 20,
  humanize: 0.05,
  users: ['black', 'white', 'pink'/*, 'darkred', 'darkblue'*/],
  canvas: document.getElementById('board'),
  context: null,
  getContext: () => {
    if (!OMOK.context) {
      OMOK.context = OMOK.canvas.getContext('2d');
    }
    return OMOK.context;
  },
  // 초기화 함수
  init(){
    OMOK.clear();
    OMOK.drawBoard();
    OMOK.bindEvents();
  },
  // 이벤트 등록
  bindEvents() {
    const context = OMOK.getContext();
    const elemLeft = OMOK.canvas.offsetLeft;
    const elemTop = OMOK.canvas.offsetTop;
    iCount = 0;
    OMOK.canvas.addEventListener('click', (e) => {
      const x = event.pageX - elemLeft;
      const y = event.pageY - elemTop;

      OMOK.drawStone(x, y, OMOK.users[iCount++ % OMOK.users.length]);
    });
  },
  // 캔버스 초기화
  clear() {
    OMOK.getContext().clearRect(0, 0, OMOK.canvas.width, OMOK.canvas.height);
  },
  // 바둑판 그리기
  drawBoard() {
    const ctx = OMOK.getContext();
    const space = (OMOK.canvas.width - OMOK.margin * 2) / (OMOK.lineCount - 1);

    for (let index = 0; index < OMOK.lineCount; index += 1) {
      const startPoint = index * space + OMOK.margin;
      ctx.moveTo(startPoint, OMOK.margin);
      ctx.lineTo(startPoint, OMOK.canvas.height - OMOK.margin);
      ctx.moveTo(OMOK.margin, startPoint);
      ctx.lineTo(OMOK.canvas.height - OMOK.margin, startPoint);
    }
    ctx.stroke();

    /**
     * 점 그리기
     * @todo
     *   1. 함수로 분리
     *   2. 바둑판 사이즈에따라 가변처리
     **/
    const centerX = OMOK.canvas.width / 2;
    const centerY = OMOK.canvas.height / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerX, 3, 0, 2 * Math.PI, false);
    ctx.fill();
  },
  // 바둑돌 그리기
  drawStone(x, y, color = 'black') {
    const ctx = OMOK.getContext();
    const space = (OMOK.canvas.width - OMOK.margin * 2) / (OMOK.lineCount - 1);

    x = Math.floor(x / space) * space + OMOK.margin;
    y = Math.floor(y / space) * space + OMOK.margin;

    xHumunize = (space * OMOK.humanize * Math.random()) - (space * OMOK.humanize * Math.random());
    yHumunize = (space * OMOK.humanize * Math.random()) - (space * OMOK.humanize * Math.random());

    x += xHumunize;
    y += yHumunize;

    ctx.beginPath();
    ctx.fillStyle = color;
    // ctx.fillStyle = 'pink';
    ctx.arc(x, y, (space / 2 * 0.9), 0, 2 * Math.PI, false);
    ctx.fill();
  }
};

OMOK.init();

