const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const HEIGHT = canvas.height = innerHeight
const WIDTH = canvas.width = innerWidth

const ROWNUMBER = 20
const sizeFactor = 1 / ROWNUMBER;
let score = 0

let snakeBody = []
let food = {}
let lastMove, arrowkeyPressed
const moves = {
  arrowUp : 'ArrowUp',
  arrowDown : 'ArrowDown',
  arrowLeft : 'ArrowLeft',
  arrowRight : 'ArrowRight'
};

let isSnakeUpdating = false;
let isKeyEventActive = false;
let isChecking = false;
let animationFrameId = undefined; 
let isCollision = false;

function setLastMove(){
  const r = getRandomNumber(1, 4);
  switch(r) {
    case 1 : arrowkeyPressed = moves.arrowUp
    case 2 : arrowkeyPressed = moves.arrowDown
    case 3 : arrowkeyPressed = moves.arrowLeft
    case 4 : arrowkeyPressed = moves.arrowRight
  }
  lastMove = arrowkeyPressed
}

class Snake {
  constructor(x, y, direction) {
    this.width = sizeFactor * WIDTH
    this.height = sizeFactor * HEIGHT
    this.x = ((x % ROWNUMBER) / ROWNUMBER) * WIDTH 
    this.y = ((y % ROWNUMBER) / ROWNUMBER) * HEIGHT

    // case for head
    this.eyeX = ((x % ROWNUMBER) / ROWNUMBER) * WIDTH + (sizeFactor / 4) * WIDTH
    this.eyeY = ((y % ROWNUMBER) / ROWNUMBER) * HEIGHT + (sizeFactor / 4) * HEIGHT 
    this.eyeW = (sizeFactor * WIDTH) / 8
    this.eyeH = (sizeFactor * HEIGHT) / 8

    this.direction = direction
  }

  draw() {
    ctx.fillStyle = 'white'
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }

  drawEye() {
    ctx.beginPath()
    ctx.fillStyle = 'hsl(173, 50%, 30%)'

    if(this.direction == moves.arrowLeft) {
      ctx.ellipse(this.eyeX, this.eyeY, this.eyeW, this.eyeH, 0, 0, Math.PI * 2)
      ctx.ellipse(this.eyeX, this.eyeY + (sizeFactor / 2) * HEIGHT, this.eyeW, this.eyeH, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    if(this.direction == moves.arrowRight) {
      ctx.ellipse(this.eyeX + (sizeFactor / 2) * WIDTH, this.eyeY, this.eyeW, this.eyeH, 0, 0, Math.PI * 2)
      ctx.ellipse(this.eyeX + (sizeFactor / 2) * WIDTH, this.eyeY + (sizeFactor / 2) * HEIGHT, this.eyeW, this.eyeH, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    if(this.direction == moves.arrowDown) {
      ctx.ellipse(this.eyeX, this.eyeY + (sizeFactor / 2) * HEIGHT, this.eyeW, this.eyeH, 0, 0, Math.PI * 2)
      ctx.ellipse(this.eyeX + (sizeFactor / 2) * WIDTH, this.eyeY + (sizeFactor / 2) * HEIGHT, this.eyeW, this.eyeH, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    if(this.direction == moves.arrowUp) {
      ctx.ellipse(this.eyeX, this.eyeY, this.eyeW, this.eyeH, 0, 0, Math.PI * 2)
      ctx.ellipse(this.eyeX + (sizeFactor / 2) * WIDTH, this.eyeY, this.eyeW, this.eyeH, 0, 0, Math.PI * 2)
      ctx.fill()
    } 
  }

  update(x, y) {
    this.x = ((x % ROWNUMBER) / ROWNUMBER) * WIDTH 
    this.y = ((y % ROWNUMBER) / ROWNUMBER) * HEIGHT
  }
}

class Food {
  constructor(x, y) {
    this.x = ((x % ROWNUMBER) / ROWNUMBER) * WIDTH + (sizeFactor / 2) * WIDTH
    this.y = ((y % ROWNUMBER) / ROWNUMBER) * HEIGHT + (sizeFactor / 2) * HEIGHT
  }

  draw() {
    ctx.beginPath()
    ctx.fillStyle = 'white'
    ctx.ellipse(this.x, this.y, (sizeFactor / 4) * WIDTH, (sizeFactor / 4) * HEIGHT, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

function getRandomNumber(l, h){
  return Math.floor(Math.random() * ( h - l)) + l;
}

const paintSnake = () => {
  snakeBody.forEach((e, i) => {
    e.snake.draw(e.x, e.y)
    i == 0 ? e.snake.drawEye(e.x, e.y) : ''
  })
}

const newSnakeHead = () => {
  const x = getRandomNumber(5, ROWNUMBER - 5)
  const y = getRandomNumber(5, ROWNUMBER - 5)

  // console.log(x, y);
  
  snakeBody = [] // clear the previous snake body
  snakeBody.push({
    x, y, snake : new Snake(x, y, lastMove), direction : lastMove
  })
}

const paintFood = () => {
  food.foodInstance.draw()
}

const newfood = () => {
  const x = getRandomNumber(1, ROWNUMBER)
  const y = getRandomNumber(1, ROWNUMBER)
  food = {
    x, y, foodInstance : new Food(x, y)
  }
}

const handleKeyDown = (e) => {
  switch(e.key) {
    case moves.arrowUp :  
      if(lastMove != moves.arrowDown) {
        arrowkeyPressed = moves.arrowUp
      } else {
        return
      }
    break;

    case moves.arrowDown :
      if(lastMove != moves.arrowUp) {
        arrowkeyPressed = moves.arrowDown
      } else {
        return;
      }
    break;

    case moves.arrowLeft :
      if(lastMove != moves.arrowRight) {
        arrowkeyPressed = moves.arrowLeft
      } else {
        return;
      }
    break;

    case moves.arrowRight :
      if(lastMove != moves.arrowLeft) {
        arrowkeyPressed = moves.arrowRight
      } else {
        return;
      }
    break;

    default : 
    
  }
}

const checkKeyPress = () => {
  if(isKeyEventActive) return
  isKeyEventActive = true
  addEventListener('keydown', handleKeyDown)
}

const checkCollision = () => {
  if(snakeBody[0].x == food.x && snakeBody[0].y == food.y) {
    let prevLast = snakeBody[snakeBody.length - 1]
    let x, y
    switch(prevLast.direction) {
      case moves.arrowUp : y++;
      case moves.arrowDown : y--;
      case moves.arrowLeft : x--;
      case moves.arrowRight : x++;
    }
    snakeBody.push({
      x,
      y,
      snake : new Snake(x, y),
      direction : lastMove
    })
    score++;
    newfood()
  }
}

const paintScore = () => {
  ctx.fillStyle = 'hsl(173, 50%, 50%, 1)';
  ctx.fillRect(0, 0, WIDTH, WIDTH);
  ctx.fillStyle = 'white'

  ctx.font = '48px Monospace'
  const scoreText = ctx.measureText("Score : " + score)
  ctx.fillText("Score : " + score, WIDTH / 2 - scoreText.width / 2, HEIGHT / 2 - 32)

  ctx.font = '48px Monospace'
  const restartText = ctx.measureText("Press any key to restart");
  ctx.fillText("Press any key to restart", WIDTH / 2 - restartText.width / 2, HEIGHT / 2 + 32)

  addEventListener('keydown', init, {
    once : true
  })
}

const checkSelfCollision = (x, y) => {
  isChecking = true
  for(let i = 0; i < snakeBody.length; i++) {
    if(i != 0 && snakeBody[i].x == x && snakeBody[i].y == y) {
      isChecking = false
      removeEventListener('keydown', handleKeyDown)
      cancelAnimationFrame(animationFrameId)
      isKeyEventActive = false
      lastMove = null
      return true
    }
    if(i == snakeBody.length - 1) {
      isChecking = false
    }
  }

  if(!isChecking) return false
}

const updateSnake = () => {
  if(isSnakeUpdating) return
  if(lastMove == null) return 
  isSnakeUpdating = true
  setTimeout(() => {
    let newX = snakeBody[0].x,
        newY = snakeBody[0].y 
    switch(lastMove) {
        case moves.arrowUp :  
            newY--;
        break;
    
        case moves.arrowDown :
          newY++;
        break;
    
        case moves.arrowLeft :
          newX--;
        break;
    
        case moves.arrowRight :
          newX++;
        break;
    
        default : 
        
      }
    if(newX < 0) newX += ROWNUMBER
    if(newY < 0) newY += ROWNUMBER
    snakeBody.unshift({
      x : newX % ROWNUMBER,
      y : newY % ROWNUMBER,
      snake : new Snake(newX % ROWNUMBER, newY % ROWNUMBER, lastMove),
      direction : lastMove
    })
    snakeBody.pop()
    lastMove = arrowkeyPressed

    isCollision = checkSelfCollision(newX, newY)
    isSnakeUpdating = false
  }, 200) 
}

const animate = (e) => {
  // console.log(e)
  console.log(isCollision);
  if(isCollision) {
    cancelAnimationFrame(animationFrameId)
    paintScore()
    return
  }
  ctx.fillStyle = 'hsl(173, 50%, 50%, 1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  paintSnake()
  paintFood()
  checkKeyPress()
  checkCollision()
  updateSnake()
  
  setTimeout(() => {
    animationFrameId = requestAnimationFrame(animate)
  }, 1000 / 100)
}

const init = () => {
  isCollision = false
  setLastMove()
  newSnakeHead()
  newfood()
  animationFrameId = requestAnimationFrame(animate)
}

// init()
paintScore()