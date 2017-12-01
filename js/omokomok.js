const OMOK = {
  stonesLocations: [],
  lineCount: 19,
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
    OMOK.initStonesLocations();
    OMOK.drawBoard();
    OMOK.bindEvents();
  },
  // 돌위치 초기화
  initStonesLocations() {
    for (let i = 0; i < OMOK.lineCount; i += 1) {
      OMOK.stonesLocations[i] = new Array(OMOK.lineCount);
    }
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
      const iUserIndex = (iCount++ % OMOK.users.length);

      OMOK.drawStone(x, y, iUserIndex);
      e.preventDefault();
      e.stopPropagation();
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

    const centerX = OMOK.canvas.width / 2;
    const centerY = OMOK.canvas.height / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerX, 3, 0, 2 * Math.PI, false);
    ctx.fill();
  },
  // 바둑돌 그리기
  drawStone(x, y, userIndex) {
    const ctx = OMOK.getContext();
    const space = (OMOK.canvas.width - OMOK.margin * 2) / (OMOK.lineCount - 1);

    const indexOfX = Math.floor(x / space);
    const indexOfY = Math.floor(y / space);

    x = indexOfX * space + OMOK.margin;
    y = indexOfY * space + OMOK.margin;

    if (OMOK.setPosition(indexOfX, indexOfY, userIndex)) {
      xHumunize = (space * OMOK.humanize * Math.random()) - (space * OMOK.humanize * Math.random());
      yHumunize = (space * OMOK.humanize * Math.random()) - (space * OMOK.humanize * Math.random());

      x += xHumunize;
      y += yHumunize;

      ctx.beginPath();
      ctx.fillStyle = OMOK.users[userIndex];
      ctx.arc(x, y, (space / 2 * 0.9), 0, 2 * Math.PI, false);
      ctx.fill();
    }
  },
  // 바둑돌위치 저장
  setPosition(x, y, userIndex) {
    if (OMOK.stonesLocations[x][y] === undefined) {
      OMOK.stonesLocations[x][y] = userIndex;
      return true;
    } else {
      return false;
    }
  }
};

OMOK.init();

