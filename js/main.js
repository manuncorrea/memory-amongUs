startAmong = {
  
  // Iniciar combinção da maquina 
  computerCombination:[],

  // Combinação do jogador
  playerCombination: [],

  // Sempre iniciar em 1
  computerCombinationPosition: 1,

  // Maximo de combinações
  combinationMaxPosition: 5,

  //Maximo de Memorias possiveis
  memoryMaxCombination: 9, 

  audio: {
    start: 'start.mp3',
    fail: 'fail.mp3',
    complete: 'complete.mp3',
    combinations: ['0.mp3', '1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3', '6.mp3', '7.mp3', '8.mp3' ],

    // Carregando todos os audios
    loadAudio(filename) {
      const file = `./audio/${filename}?cb=${new Date().getTime()}`
      const audio = new Audio(file)
      audio.load()
      return audio
    },

    loadAudios() {

      if (typeof(startAmong.audio.start) == "object") return

      startAmong.audio.start = startAmong.audio.loadAudio(startAmong.audio.start)
      startAmong.audio.complete = startAmong.audio.loadAudio(startAmong.audio.complete)
      startAmong.audio.fail = startAmong.audio.loadAudio(startAmong.audio.fail)
      startAmong.audio.combinations = startAmong.audio.combinations.map (( audio ) => startAmong.audio.loadAudio( audio ))
    }
  },

  interface: {

    memoryPanel: document.querySelector(".painelMemory"),
    computerLedPanel: document.querySelector(".computerLedPanel"),
    playerLedPanel: document.querySelector(".playerLedPanel"),
    playerMemory: document.querySelector(".playerMemory"),
    playerMemoryButtons: document.getElementsByClassName("player_memory"),

    turnLedOn(index, ledPanel) {
      ledPanel.children[index].classList.add("ledOn");
    },

    turnAllLedsOff() {

      const computerLedPanel = startAmong.interface.computerLedPanel
      const playerLedPanel = startAmong.interface.playerLedPanel

      for(var i = 0; i < computerLedPanel.children.length; i++) {
        computerLedPanel.children[i].classList.remove("ledOn");
        playerLedPanel.children[i].classList.remove("ledOn");
      }
    },

    async start() {
      return startAmong.audio.start.play()
    },

    playItem(index, combinationPosition, location = 'computer') {

      const leds = (location == 'computer') ? startAmong.interface.computerLedPanel : startAmong.interface.playerLedPanel
      const memPanel = startAmong.interface.memoryPanel.children[index]

      memPanel.classList.add("memoryActive")
      startAmong.interface.turnLedOn(combinationPosition, leds)
      startAmong.audio.combinations[index].play().then(() => {
        setTimeout(() => {
          memPanel.classList.remove("memoryActive")
        }, 150)
      })
    },

    // Fim de jogo
    endGame(type = "fail") {

      const memPanel = startAmong.interface.memoryPanel
      const ledPanel = startAmong.interface.computerLedPanel
      const audio = (type == "complete") ? startAmong.audio.complete : startAmong.audio.fail
      const typeClasses = (type == "complete") ? ["playerMemoryComplete", "playerLedComplete"] : ["playerMemoryError", "playerLedError"]

      startAmong.interface.disableButtons()
      startAmong.interface.turnAllLedsOff()

      audio.play().then(() => {
        for (var i = 0; i < memPanel.children.length; i++) {
          if (memPanel.children[i].tagName == "DIV")
              memPanel.children[i].classList.add(typeClasses[0])
        }

        for (var i = 0; i < ledPanel.children.length; i++) {
          if (ledPanel.children[i].tagName == "DIV")
              ledPanel.children[i].classList.add(typeClasses[1])
        }

        setTimeout(() => {
          for (var i = 0; i < memPanel.children.length; i++) {
            if (memPanel.children[i].tagName == "DIV")
                memPanel.children[i].classList.remove(typeClasses[0])
          }

          for (var i = 0; i < ledPanel.children.length; i++) {
            if (ledPanel.children[i].tagName == "DIV")
                ledPanel.children[i].classList.remove(typeClasses[1])
          }
        }, 900);
      })
    },

    enableButtons() {

       const playerMemory = startAmong.interface.playerMemory
       playerMemory.classList.add('playerActive')

       for (var i = 0; i < playerMemory.children.length; i++) {
         if (playerMemory.children[i].tagName == "DIV")
          playerMemory.children[i].classList.add("playerMemoryActive")
       }
    },

    disableButtons() {
      const playerMemory = startAmong.interface.playerMemory
      playerMemory.classList.remove('playerActive')

      for (var i = 0; i < playerMemory.children.length; i++) {
        if (playerMemory.children[i].tagName == "DIV")
           playerMemory.children[i].classList.remove("playerMemoryActive");
      }
    },

  },

 async load() {
    return new Promise(resolve => {
      console.log("Loading Game...")
      startAmong.audio.loadAudios()

      const playerMemory = startAmong.interface.playerMemory
      const memory = startAmong.interface.playerMemoryButtons

      Array.prototype.forEach.call(memory, (element) => {
        element.addEventListener("click", () => {
          if (playerMemory.classList.contains("playerActive")) {
            startAmong.play(parseInt(element.dataset.memory))
            console.log("O valor do elemento clicado é: " + element.dataset.memory)

            element.style.animation = "playermemoryClick .4s"
            setTimeout(() => element.style.animation = "", 400)
          }
        })

      })
    })
  },

 
  start() {
    startAmong.computerCombination = startAmong.createCombination()
    startAmong.computerCombinationPosition = 1
    startAmong.playerCombination = []
    startAmong.interface.start().then(() => {
      setTimeout(() => {
        startAmong.playCombination()
      }, 500)
    })
  },

  createCombination() {
    let newCombination = []
    for(let n = 0; n < startAmong.combinationMaxPosition; n++){
      const position = Math.floor((Math.random() * startAmong.memoryMaxCombination) + 1)
      newCombination.push(position-1)
    }
    return newCombination
  
  },
  play(index) {
    startAmong.interface.playItem(index, startAmong.playerCombination.length, 'player')
    startAmong.playerCombination.push(index)

    if(startAmong.isTheRightCombination(startAmong.playerCombination.length)) {

      if (startAmong.playerCombination.length == startAmong.combinationMaxPosition) {
        startAmong.interface.endGame("complete")
        setTimeout(() => {
          startAmong.start()
        }, 1200)
        return
      }

      if(startAmong.playerCombination.length == startAmong.computerCombinationPosition) {
        startAmong.computerCombinationPosition++
        setTimeout(() => {
          startAmong.playCombination()
        }, 1200)
        return
      }
    } else {
      startAmong.interface.endGame("fail")
      document.getElementById("title").textContent = "Você é o impostor"
      setTimeout(() => {
        document.getElementById("title").textContent = "START AMONG"
        startAmong.start()
      }, 1400)
      return
    }

  },


  playCombination() {
    startAmong.playerCombination = []
    startAmong.interface.disableButtons()
    startAmong.interface.turnAllLedsOff()

    for ( let i = 0; i <= startAmong.computerCombinationPosition - 1; i++){
      
      setTimeout(() => {
        startAmong.interface.playItem(startAmong.computerCombination[i], i)
      }, 400 * (i+1))
    }

    setTimeout(() => {
      startAmong.interface.turnAllLedsOff()
      startAmong.interface.enableButtons()
    }, 600 * startAmong.computerCombinationPosition)
  },

  isTheRightCombination(position) {
    let computerCombination = startAmong.computerCombination.slice(0, position)
    return( computerCombination.toString() == startAmong.playerCombination.toString())
  }
}

