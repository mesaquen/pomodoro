import React from 'react'
import styled from 'styled-components'
import ActivityBar from './components/ActivityBar'
import Button from './components/Button'
import TimeDisplay, { getTimeString } from './components/TimeDisplay'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 30vw;
  margin: 0 auto;
  padding-top: 30vh;
  align-items: center;
`
const isDev = process.env.NODE_ENV === 'development'

const workingTime = isDev ? 0.25 : 25
const shortBreak = isDev ? 0.05 : 5
const longBreak = isDev ? 0.15 : 15

const defaultLabels = ['Working time', 'Short interval', 'Long interval']
const initialState = {
  workingTime,
  shortBreak,
  longBreak,
  timeLeft: workingTime * 60 * 1000,
  running: false,
  start: null,
  isBreak: false,
  breakCount: 0,
  maxBreaks: 4,
  permission: Notification?.permission,
  labels: defaultLabels,
  activeLabel: defaultLabels[0]
}

export default class App extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = initialState
    this.timeId = React.createRef()
  }

  componentDidMount () {
    this.requestNotificationPermission()
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        navigator.serviceWorker.addEventListener('message', this.handleMessage)
      })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const { start, running, timeLeft } = this.state

    if (start && start !== prevState.start && running) {
      this.tick()
    }

    if (!running && running !== prevState.running) {
      this.setInitialTime()
      this.notify()
    }

    if (running && timeLeft !== prevState.timeLeft) {
      this.updateTitle()
    }
  }

  componentWillUnmount () {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        navigator.serviceWorker.removeEventListener(
          'message',
          this.handleMessage
        )
      })
    }
  }

  skipStep = () => {}

  handleMessage = event => {
    const { data } = event ?? {}

    if (data?.type === 'NOTIFICATION_ACTION') {
      if (data.action === 'skip') {
        return this.skipStep()
      }

      if (data.action === 'start') {
        return this.play()
      }

      this.setState({ messagedata: event.data })

      return null
    }
  }

  updateTitle = () => {
    const { timeLeft } = this.state
    document.title = `(${getTimeString(timeLeft)})`
  }

  getTime = () => {
    const {
      isBreak,
      shortBreak,
      longBreak,
      workingTime,
      isLongBreak
    } = this.state

    if (isBreak) {
      if (isLongBreak) {
        return longBreak * 60000
      }
      return shortBreak * 60000
    }

    return workingTime * 60000
  }

  requestNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted') {
        const status = await Notification.requestPermission()
        debugger
        this.setState({
          permission: status
        })
      }
    }
  }

  tick = () => {
    const { running, start, timeLeft } = this.state

    if (running && timeLeft > 0) {
      const now = new Date()
      const time = this.getTime() - (now.getTime() - start.getTime())

      const nextTime = Math.max(time, 0)
      this.timeId.current = setTimeout(this.tick, 1000)
      this.setState({
        timeLeft: nextTime
      })
    } else {
      this.stop()
    }
  }

  setInitialTime = () => {
    const timeLeft = this.getTime()
    this.setState({ timeLeft })
  }

  notify = () => {
    const { permission, isBreak, isLongBreak } = this.state
    if (permission === 'granted') {
      let type = 'NOTIFY_WORK'
      if (isBreak) {
        type = `NOTIFY_${isLongBreak ? 'LONG' : 'SHORT'}`
      }
      return navigator.serviceWorker?.controller?.postMessage({ type })
    }
    return null
  }

  play = () => {
    const { running } = this.state
    if (!running) {
      this.setState({
        running: true,
        start: new Date()
      })
    }
  }

  getActiveLabel = (isBreak, index) => {
    const isLongBreak = index === 0
    const { labels } = this.state
    if (isBreak) {
      const index = isLongBreak ? 2 : 1
      return labels[index]
    }
    return labels[0]
  }

  stop = () => {
    if (this.state.running) {
      if (this.timeId.current) {
        clearTimeout(this.timeId.current)
        this.timeId.current = null
      }

      const { breakCount, maxBreaks, isBreak } = this.state
      const nextBreakIndex = (breakCount + 1) % maxBreaks
      this.setState({
        running: false,
        start: null,
        isBreak: !isBreak,
        breakCount: isBreak ? breakCount : nextBreakIndex,
        isLongBreak: isBreak ? false : nextBreakIndex === 0,
        activeLabel: this.getActiveLabel(!isBreak, nextBreakIndex)
      })
    }
  }

  render () {
    const { running, timeLeft, labels, activeLabel } = this.state
    return (
      <Container>
        <ActivityBar data={labels} activeItem={activeLabel} />
        <TimeDisplay time={timeLeft} />

        {running ? (
          <Button onClick={this.stop}>stop</Button>
        ) : (
          <Button onClick={this.play}>start</Button>
        )}
        <pre>{JSON.stringify(this.state.messagedata, null, 2)}</pre>
      </Container>
    )
  }
}
