function format(time: Date) {
  const month = (time.getMonth() + 1).toString()
  const date = time.getDate().toString()
  const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']
  const day = WEEKDAY[time.getDay()]
  const hour = time.getHours().toString().padStart(2, '0')
  const minute = time.getMinutes().toString().padStart(2, '0')

  return `${month}/${date}(${day}) ${hour}:${minute}`
}

export {
  format,
}
