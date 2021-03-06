import generateQuestion from "./generate-question.js"
import Games from "./games.js"

const game = new Games()
const gameData = JSON.parse(localStorage.getItem("GameData")) || []
let selectedGameData = {}
const user = JSON.parse(localStorage.getItem("DataUser"))
let isCorrect = false

const answerItems = document.querySelectorAll(".puzzle-answer-item")
const questionItems = document.querySelectorAll(".puzzle-question-item")
const puzzleAnswer = document.getElementById("puzzle-answer")
const back = document.querySelectorAll(".back-to-lobby")
const endScore = document.querySelectorAll(".end-score")
const outGame = document.getElementById('out-game')
const popoverToggle = document.querySelector('[data-popover-toggle="false"]')
const username = document.getElementById("username")

username.innerHTML = user?.name

function updateGameData(data) {
  const index = gameData.findIndex((item) => item.game_id === data.game_id)
  gameData[index] = data
  localStorage.setItem("GameData", JSON.stringify(gameData))
}

function suffleAnswer(questions) {
  const array = [...questions]
  for (var i = 0; i < array.length - 1; i++) {
    var j = i + Math.floor(Math.random() * (array.length - i))

    var temp = array[j]
    array[j] = array[i]
    array[i] = temp
  }
  return array
}

function checkAnswer(draggable, dropzone) {
  if (dropzone.getAttribute("answered")) {
    isCorrect = false
    return false
  }
  dropzone.classList.remove("bg-gray-500")

  if (draggable.dataset.answer === dropzone.dataset.answer) {
    isCorrect = true
    dropzone.classList.add("bg-emerald-500")
    dropzone.setAttribute("answered", true)
    game.addScore()
    selectedGameData.score = game.getScore()
    selectedGameData.answers = [
      ...selectedGameData.answers,
      selectedGameData.questions.find((item) => item.id === parseInt(dropzone.dataset.id))
    ]
    updateGameData(selectedGameData)
    draggable.remove()
  } else {
    isCorrect = false
    dropzone.classList.add("bg-red-500")
    game.removeHealth()
    selectedGameData.health = game.getHealth()
    updateGameData(selectedGameData)
    setTimeout(() => {
      dropzone.classList.remove("bg-red-500")
    }, 1000)
  }

  if (game.getHealth() === 0) {
    endScore[0].innerHTML = game.getScore()
    toggleModal("modal-game-over")
  }

  if(selectedGameData.answers.length === selectedGameData.questions.length) {
    endScore[1].innerHTML = game.getScore()
    toggleModal("modal-game-end")
  }

}

function toggleModal(id) {
  const modal = document.getElementById(id)
  modal.querySelector(".modal-toggle").click()
}

function checkGameHistory() {
  return gameData.find((item) => item.game_status === "progress" || item.game_status === "start")
}

function renderQuestion(questions) {
  questions.forEach((item, index) => {
    const answered = selectedGameData.answers.find((answer) => answer.id === item.id)
    if (answered) {
      questionItems[index].setAttribute("answered", true)
      questionItems[index].classList.add("bg-emerald-500")
    }
    questionItems[index].innerHTML = item.question
    questionItems[index].dataset.answer = item.answer
    questionItems[index].dataset.id = item.id
  })
}

function renderAnswer(suffledAnswer) {
  suffledAnswer.map((item, index) => {
    const answered = selectedGameData.answers.find((answer) => answer.id === item.id)
    if (answered) answerItems[index].remove()
    else {
      answerItems[index].innerHTML = item.answer
      answerItems[index].dataset.answer = item.answer
      answerItems[index].dataset.position = index
    }
  })
}

function createNewQuestion(data) {
  const questions = []
  const totalQuestion = 9
  for (let i = 0; i < totalQuestion; i++) {
    const result = generateQuestion(parseInt(data.level), data.type)
    questions.push({
      id: i + 1,
      ...result,
    })
  }
  return questions
}

function setupContinuedGame(data) {
  game.setScore(parseInt(data.score))
  game.setHealth(parseInt(data.health))
  game.init()

  if (game.getHealth() === 0) {
    endScore[0].innerHTML = game.getScore()
    toggleModal("modal-game-over")
  }
  
  if(selectedGameData.answers.length === selectedGameData.questions.length) {
    endScore[1].innerHTML = game.getScore()
    toggleModal("modal-game-end")
  }
}

function startGames() {
  const history = checkGameHistory()
  if (history.game_status === "progress") {
    selectedGameData = history
    const data = gameData.find(item => item.game_id === history.game_id)
    renderQuestion(data.questions)
    const suffled = suffleAnswer(data.questions)
    renderAnswer(suffled)
    setupContinuedGame(data)
  } else if(history.game_status === "start") {
    let data = gameData.find(item => item.game_id === history.game_id)
    data = {
      ...data,
      game_status: "progress",
      questions: createNewQuestion(data),
    }
    selectedGameData = data
    let gameDataIndex = gameData.findIndex(item => item.game_id === history.game_id)
    gameData[gameDataIndex] = data
    localStorage.setItem("GameData", JSON.stringify(gameData))
    renderQuestion(data.questions)
    const suffled = suffleAnswer(data.questions)
    renderAnswer(suffled)
  }
}

function endGames() {
  selectedGameData.game_status = "end"
  selectedGameData.end_date = new Date()
  updateGameData(selectedGameData)
  window.location.href = "./lobby.html"
}

const position = {
  x: 0,
  y: 0,
}

interact(".puzzle-answer-item").draggable({
  inertia: true,
  autoScroll: true,
  listeners: {
    start(e) {
      e.target.classList.add("border-2", "border-white", "text-white")
    },
    move(e) {
      position.x += e.dx
      position.y += e.dy

      e.target.style.transform = "translate(" + position.x + "px, " + position.y + "px)"
    },
    end(e) {
      e.target.classList.remove("border-2", "border-white", "text-white")
      position.x = 0
      position.y = 0
      e.target.style.transform = ""
    },
  },
})

interact(".puzzle-question-item").dropzone({
  accept: ".puzzle-answer-item",
  overlap: 0.6,
  ondragenter: function (e) {
    if(e.target.getAttribute("answered") === "true") return false
    const dropzoneElement = e.target
    dropzoneElement.classList.add("bg-gray-500")
  },
  ondragleave: function (e) {
    const dropzoneElement = e.target
    dropzoneElement.classList.remove("bg-gray-500")
  },
  ondrop: function (e) {
    if(e.target.getAttribute("answered") === "true") return false
    const draggableElement = e.relatedTarget
    const dropzoneElement = e.target
    checkAnswer(draggableElement, dropzoneElement)
  },
})

back.forEach(item => {
  item.addEventListener("click", function (e) {
    e.preventDefault()
    endGames()
  })
})

outGame.addEventListener('click', function (e) {
  e.preventDefault()
  endGames()
})

popoverToggle.addEventListener('click', function(e) {
  e.preventDefault()
  const popup = this.querySelector('.popup')
  popup.classList.toggle('invisible')
})

document.addEventListener('DOMContentLoaded', function() {
  startGames()
})