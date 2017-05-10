const domNode = document.querySelector('#editor')

domNode.setAttribute('contentEditable', true)

const observer = new MutationObserver(handleMutations)

observer.observe(domNode, {
  attributes: true,
  characterData: true,
  childList: true,
  subtree: true,
})

domNode.addEventListener('paste', event => {
  event.preventDefault()

  for (const item of event.clipboardData.items) {
    const { kind, type } = item
    if (kind !== 'string') {
      continue
    }
    item.getAsString(content => {
      console.log({ type, content })
    })
  }
})

function handleMutations(mutations) {

  for (const mutation of mutations) {

    console.log(mutation.type)
    console.log(mutation.target)

    switch (mutation.type) {

      case 'childList': {
        console.log(mutation.addedNodes)
        console.log(mutation.removedNodes)
        break
      }

      case 'attributes': {
        console.log(mutation.attributeName)
        break
      }

      case 'characterData': {
        break
      }
    }
  }
}
