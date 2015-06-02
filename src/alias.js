export default function alias( target, prop, ...aliases ) {
  const item= target[ prop]

  aliases.forEach( alias => {
    target[ alias ]= item
  })
}
