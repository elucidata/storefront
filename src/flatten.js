export default function flatten( arrays ) {
  let merged= []

  return merged.concat.apply( merged, arrays)
}
