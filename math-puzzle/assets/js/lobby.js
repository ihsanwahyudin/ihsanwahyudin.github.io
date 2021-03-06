const gameData = JSON.parse(localStorage.getItem("GameData")) || []
const playGames = document.getElementById('play-games')
const questionTypes = document.querySelectorAll('.question-type-item');
const questionLevels = document.querySelectorAll('.question-level-item');
const popoverToggle = document.querySelector('[data-popover-toggle="false"]')
const history = document.getElementById('history')
const logout = document.getElementById('logout')
const username = document.getElementById('username')
const user = JSON.parse(localStorage.getItem('DataUser'))
let selectedQuestionTypeIndex = -1;
let selectedQuestionLevelIndex = -1;
let selectedQuestion = {
  type: '',
  level: '',
}
let isReady = false

username.innerHTML = user?.name

questionTypes.forEach((item, index) => {
  item.addEventListener('click', function () {
    clearSelectedQuestionTypes()
    if(selectedQuestionTypeIndex === index) {
      selectedQuestionTypeIndex = -1
      selectedQuestion.type = ''
      ready()
      return false
    }
    selectedQuestionTypeIndex = index
    const questionType = this.dataset.questionType;
    if(!questionType) return false
    selectedQuestion.type = questionType
    this.classList.add('ring-2')
    ready()
  })
})

questionLevels.forEach((item, index) => {
  item.addEventListener('click', function () {
    clearSelectedQuestionLevels()
    if(selectedQuestionLevelIndex === index) {
      selectedQuestionLevelIndex = -1
      selectedQuestion.level = ''
      ready()
      return false
    }
    selectedQuestionLevelIndex = index
    const questionLevel = this.dataset.questionLevel;
    selectedQuestion.level = questionLevel;
    this.classList.add('ring-2')
    ready()
  })
})

playGames.addEventListener('click', function (e) {
  e.preventDefault()
  if(isReady) {
    gameData.push({
      game_id: Math.floor(Math.random() * 1000),
      ...selectedQuestion,
      user: user.name,
      start_date: new Date(),
      end_date: '',
      game_status: 'start',
      duration: 5,
      health: 3,
      score: 0,
      questions: [],
      answers: [],
    })
    localStorage.setItem('GameData', JSON.stringify(gameData))
    setTimeout(() => window.location.href = './index.html', 500)
  }
})

popoverToggle.addEventListener('click', function(e) {
  e.preventDefault()
  const popup = this.querySelector('.popup')
  popup.classList.toggle('invisible')
})

logout.addEventListener('click', function(e) {
  e.preventDefault()
  localStorage.removeItem('DataUser')
  localStorage.removeItem('GameData')
  setTimeout(() => window.location.href = './index.html', 500)
})

function clearSelectedQuestionTypes() {
  if(selectedQuestionTypeIndex !== -1) 
    questionTypes[selectedQuestionTypeIndex].classList.remove('ring-2')
}

function clearSelectedQuestionLevels() {
  if(selectedQuestionLevelIndex !== -1)
    questionLevels[selectedQuestionLevelIndex].classList.remove('ring-2')
}

function ready() {
  if(selectedQuestion.type && selectedQuestion.level) {
    isReady = true
    enablePlayGames()
  } else {
    isReady = false
    disablePlayGames()
  }
}

function enablePlayGames() {
  playGames.removeAttribute('disabled')
  playGames.classList.remove('bg-gray-500')
}

function disablePlayGames() {
  playGames.setAttribute('disabled', true)
  playGames.classList.add('bg-gray-500')
}

function renderHistory() {
  let xml = ''
  gameData.map(item => {
    xml += `
    <ol class="">
      <li>
        <div class="md:flex flex-start justify-center">
          <div class="block p-6 rounded-lg shadow-lg bg-[#303030] max-w-md mb-10 w-full">
            <div class="flex justify-between mb-4">
              <a href="#!"
                class="font-medium text-purple-600 hover:text-purple-700 focus:text-purple-800 duration-300 transition ease-in-out text-sm">${item.type}</a>
              <a href="#!"
                class="font-medium text-purple-600 hover:text-purple-700 focus:text-purple-800 duration-300 transition ease-in-out text-sm">${moment(item.start_date).format('DD MMM YYYY')}</a>
            </div>
            <p class="text-white mb-2">Score <span>${item.score}</span></p>
          </div>
        </div>
      </li>
    </ol>
    `
  })

  history.innerHTML = xml
}

renderHistory()
disablePlayGames()