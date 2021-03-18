const RANDOM_QUOTE_API_URL = 'http://api.quotable.io/random'

const quoteDisplayElement = document.getElementById('quote-display')
const quoteInputElement = document.getElementById('quote-input')
const timerElement = document.getElementById('timer')
const backspaceElement = document.getElementById('backspace')
const speedElement = document.getElementById('average-speed')
let backspaceCount
let startTime
let currentQuote
let currentQuoteLength
let currentQuoteWordAmount
let eplasedTime
let quoteCount = 0
let lps = []
let wpm = []
let avglps = []
let avgwpm = []
let aggrLPS = 0
let aggrWPM = 0

quoteInputElement.addEventListener('input', () => {
  const arrayQuote = quoteDisplayElement.querySelectorAll('span')
  const arrayValue = quoteInputElement.value.split('')
  let correct = true
  arrayQuote.forEach((characterSpan, index) => {
    const character = arrayValue[index]
    if (character == null) {
      characterSpan.classList.remove('correct')
      characterSpan.classList.remove('incorrect')
      correct = false
    } else if (character === characterSpan.innerText) {
      characterSpan.classList.add('correct')
      characterSpan.classList.remove('incorrect')
    } else {
      characterSpan.classList.remove('correct')
      characterSpan.classList.add('incorrect')
      correct = false
    }
  })
  if (correct) {
    insertNewStatToTable()
    var newLPSSeries = [{name: "LPS", points: lps}, {name: "Avg. LPS", points: avglps}]
    var newWPMSeries = [{name: "WPM", points: wpm}, {name: "Avg. WPM", points: avgwpm}]
    renderCharts(newLPSSeries, newWPMSeries)
    speedElement.innerText = "Avg. Speed(lps/wpm): " + roundedToFixed(aggrLPS/quoteCount,2) + " / " + roundedToFixed(aggrWPM / quoteCount, 2)
    renderNewQuote()
}})


quoteInputElement.addEventListener('keydown', function(event) {
  const key = event.key;
  if(key === "Backspace") {
    backspaceCount++
    backspaceElement.innerText = "Backspace: " + backspaceCount
  }
})

function setBackspaceToZero(){
  backspaceCount = 0
  backspaceElement.innerText = "Backspace: " + backspaceCount
}

async function getRandomQuote() {
  var randQuote = await fetch(RANDOM_QUOTE_API_URL)
  .then(response => response.json())
  .then(data => [data.content, data.content.length])
  if (randQuote[1] > 75) {
    return getRandomQuote()
  } else {
    currentQuote = randQuote[0]
    currentQuoteWordAmount = randQuote[0].split(" ").length
    currentQuoteLength = randQuote[1]
    return currentQuote
  }
}

async function renderNewQuote(){
  const quote = await getRandomQuote()
  quoteDisplayElement.innerText = ''
  quote.split('').forEach(character => {
    const characterSpan = document.createElement('span')
    characterSpan.innerText = character
    quoteDisplayElement.appendChild(characterSpan)
  })
  quoteInputElement.value = null
  startTimer()
  setBackspaceToZero()
  }


function startTimer() {
  timerElement.innerText =  "Time: " +  0
  startTime = new Date()
  setInterval(() => {
    timer.innerText = "Time: " + getTimerTime()
  }, 1000)
}

function getTimerTime() {
  eplasedTime = Math.floor((new Date() - startTime) /1000)
  return eplasedTime
}

function roundedToFixed(_float, _digits){
  var rounded = Math.pow(10, _digits);
  return (Math.round(_float * rounded) / rounded).toFixed(_digits);

}

function insertNewStatToTable() {
  var newStat = document.getElementById('stats').insertRow(1);

  quoteCount++
  var quoteCountCell   = newStat.insertCell(0);
  var quoteC  = document.createTextNode(quoteCount)
  quoteCountCell.appendChild(quoteC);

  var quoteCell   = newStat.insertCell(1);
  var quote  = document.createTextNode(currentQuote)
  quoteCell.appendChild(quote);

  var quoteLengthCell   = newStat.insertCell(2);
  var quoteL  = document.createTextNode(currentQuoteLength)
  quoteLengthCell.appendChild(quoteL);

  var timeCell    = newStat.insertCell(3);
  var time  = document.createTextNode(eplasedTime)
  timeCell.appendChild(time);

  var lettersPerSecond = parseFloat(roundedToFixed(currentQuoteLength / eplasedTime, 2))
  var wordsPerMinute = parseFloat(roundedToFixed(60 * currentQuoteWordAmount / eplasedTime, 2))
  aggrLPS += lettersPerSecond
  aggrWPM += wordsPerMinute
  console.log(aggrLPS)
  lps.push({x: quoteCount, y: lettersPerSecond})
  avglps.push({x: quoteCount, y: parseFloat(roundedToFixed(aggrLPS / quoteCount, 2))})
  wpm.push({x: quoteCount, y: wordsPerMinute})
  avgwpm.push({x: quoteCount, y: parseFloat(roundedToFixed(aggrWPM / quoteCount, 2))})
  var lpsCell    = newStat.insertCell(4);
  var speed  = document.createTextNode(lettersPerSecond + " / " + wordsPerMinute)
  lpsCell.appendChild(speed);

  var backspaceCell    = newStat.insertCell(5);
  var backspaceAmount  = document.createTextNode(backspaceCount)
  backspaceCell.appendChild(backspaceAmount);


  var backspacePerLetter = roundedToFixed(backspaceCount / currentQuoteLength, 2)
  var backspacePerLetterCell    = newStat.insertCell(6);
  var bps  = document.createTextNode(backspacePerLetter)
  backspacePerLetterCell.appendChild(bps);
}




function renderCharts(seriesLPS, seriesWPM) {
	JSC.Chart('lps-chart', {
		title_label_text: 'Letters per Second (Red = Avg.)',
    legend_visible: false,
		xAxis_crosshair_enabled: true,
		series: seriesLPS
	});
  JSC.Chart('wpm-chart', {
		title_label_text: 'Words per Minute (Red = Avg.)',
		legend_visible: false,
		xAxis_crosshair_enabled: true,
		series: seriesWPM
	});
}





renderNewQuote()
