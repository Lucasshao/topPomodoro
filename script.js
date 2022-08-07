import { timer } from "./src/data/db.js";

const ACTIVE = 'active' //设定一个ACTIVE 
const tabs = document.querySelectorAll('[data-tab-target]') //三个tab都选择到
const tabContent = document.querySelectorAll('[data-tab-content]') //面板的选择

const timeShow = document.querySelectorAll('.time') //时间选择到
const startBtn = document.querySelectorAll('.start') //Start按钮选择到

const audios = [] //设定一个声音

timer.forEach(element => { //timer forEach一下，把里面所有的声音，通过src文件里资源，给放到了audio list里面
  const audio = new Audio(`./src/sounds/${element.sound}`)
  audio.loop = true //在播放的时候循环播放
  audios.push(audio)
})

tabs.forEach(tab => { //tabs对应三个按键，用forEach 函数让每个 tab 都添加了‘click’的功能
  tab.addEventListener('click', () => { //这个click有三个功能，前两个里，会把所有ACTIVE都取消掉（包括contents和tabs），在 CSS 里，没有active 的话display就是none，此时三个面板都不显示，然后紧接着要求tab 按钮是active，所以会显示出来active的样式，然后会找到目标（const target），找到之后添加了一个active，其实所在的面板也添加了一个active
    tabContent.forEach(content => {
      content.classList.remove(ACTIVE)
    })
    tabs.forEach(tab => {
      tab.classList.remove(ACTIVE)
    })
    tab.classList.toggle(ACTIVE) //第三个会给添加点到的tab 一个ACTIVE
    const target = document.querySelector(tab.dataset.tabTarget) //tab.dataset可以找到前面html span里data的信息，选择的信息是由后面tabTarget来决定的，tabTarget其实就是span里面tab-target去掉‘-’，然后把t大写，结合到一个块，虽然data-tab-target是我们自定义的，但是我们可以通过这种发式拼合到一块，就能找到它。有意思的用法，通过这种形式就能找到目标，找到之后赋予到 target里面 (const)，就是我们对应的面板
    target.classList.toggle(ACTIVE) //让面板也有一个ACTIVE
  })
})

timeShow.forEach((element, index) => { //时间
  const totalTime = calculateTotalSeconds(timer[index]) //计算总共的秒数，这一行的时间获取是根据timer来的，拿到了整个的时间，放在了elementTime，
  elementTime(element, totalTime)
})

function calculateTotalSeconds(timer) { //计算时间的function
  const { hours, minutes, seconds } = timer;
  return 3600 * hours + 60 * minutes + seconds;
}

function elementTime(element, time) { //element代表不同时间面板里的不同元素，这个function首先计算了
  const { hours, minutes, seconds } = calculateTime(time) //这里先计算了一下时间，因为每次时间都是倒计时的
  element.textContent = `${minutes}:${seconds}` //拼合时间
  if (hours) { //只有当hours存在，才会把hours放在前面，如果在db.js里设定小时（0），是不会展示小时的
    element.textContent = `${hours}:` + element.textContent
  }
}

function calculateTime(time) { 
  const hours = parseInt(time / 3600) //除以3600，取整数
  const minutes = addZero(parseInt(parseInt(time % 3600) / 60)) //拿到分钟时间
  const seconds = addZero(time - hours * 3600 - minutes * 60) //拿到秒时间
  return { hours, minutes, seconds }
}

function addZero(time) { //如果小于10，前面加一个0
  return (+time < 10 && +time >= 0) ? `0${time}` : time //如果时间小于10并且大于0，在前面加一个0
}

startBtn.forEach((element, index) => { //这个番茄钟的核心
  element.textContent = "Start" //开始显示start了
  let handle //是为了接下来每秒跳一次做准备的
  element.addEventListener('click', () => { 
    audios[index].pause() //一旦点击按钮，让声音停止，下一次点击按钮声音会从头开始
    audios[index].currentTime = 0; //把时间重置，下一次点击按钮声音会从头开始
    element.classList.toggle(ACTIVE) //class这个位置做了一个toggle，如果有active会去掉，反之
    const isActive = element.classList.contains(ACTIVE) //判断这个element到底有没有active
    element.textContent = isActive ? "Stop" : "Start" //如果有就写上“Stop”，如果没有写“Start”
    if (isActive) {
      handle = start(index, timeShow[index],
        calculateTotalSeconds(timer[index]))
    } else {
      clearInterval(handle) //如果stop回去了，就会清楚掉handle
      const totalTime = calculateTotalSeconds(timer[index])
      elementTime(timeShow[index], totalTime)
    }
  })
})

function start(index, element, time) { //让我们的handle拥有倒计时的能力
  let handle = null
  if (time) { //如果time等于0，不进行下面的操作，判断时间是不是合法的，
    handle = setInterval(() => { //产生一个定时器，
      elementTime(element, --time) //让时间不停的减少，然后显示在面板上，这就是为什么能一秒一秒往下减的原因
      if (time <= 0) { //如果时间小于等于0，说明我们的时间已经到了
        clearInterval(handle) //时间到了的话，会清除掉我们的handle，不需要再倒计时了
        startBtn[index].textContent = "Reset" //设置一个reset
        audios[index].play() //并且让所对应的声音开始play
      }
    }, 1000) //每1000毫秒（1秒）
  } else {
    startBtn[index].textContent = "Reset" //如果是直接到了（db.js 里设置时间为0），直接可以reset，并且让声音直接响
    audios[index].play()
  }
  return handle
}