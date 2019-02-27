interface States {
  [stateName: string]: boolean | undefined // if stateName start with $, we should refer it to a modifer
}

const ELEMENT_SIGN = '::'
const ELEMENT_SEP = '_'
const MODIFIER_SIGN = ':'
const MODIFIER_SEP = '--'

function _joint(Block: string, Element?: string, Modifier?: string): string {
  if (!Block) return ''

  let className = ''

  if (Element && Modifier) {
    className = `${Block}${ELEMENT_SEP}${Element}${MODIFIER_SEP}${Modifier}`
  } else if (Element && !Modifier) {
    className = `${Block}${ELEMENT_SEP}${Element}`
  } else if (!Element && Modifier) {
    className = `${Block}${MODIFIER_SEP}${Modifier}`
  }

  return className
}

/**
 * BEM classname provider, esay to get a string of classes reflect current states,
 * Note: State value must come from React.useState!
 * @param B blockName
 * @return a method which generate a States reactive className string
 */
const BEMProvider = function(blockname: string): (classString?: string | States, states?: States) => { className: string } {
  let Block = blockname
  let Element: string = ''
  let Modifier: string = ''

  function $BEM(): string {
    return _joint(Block, Element, Modifier)
  }

  // TODO: list rules by comment
  return function(classString, states) {
    let result: string[] = []

    function $walkStates(obj) {
      return function(state) {
        let cls = ''
        if (obj[state]) {
          if (state.startsWith('$')) {
            Modifier = state.slice(1)

            cls = $BEM()
          } else {
            cls = `is-${state}`
          }
          result.push(cls)
        }
      }
    }

    if (classString && typeof classString === 'object') {
      // only has states or modifiers
      result.push(Block)

      Object.keys(classString).forEach($walkStates(classString))
    } else if (typeof classString === 'string') {
      // has extra classNames
      let classList = classString.split(' ')

      const isElement = classList[0].startsWith(ELEMENT_SIGN)

      if (isElement) Element = classList[0].slice(ELEMENT_SIGN.length)

      classList.forEach(cls => {
        if (cls.startsWith(ELEMENT_SIGN)) {
          // Block_Element
          let lastElement = Element
          Element = cls.slice(ELEMENT_SIGN.length)
          cls = $BEM()
          Element = lastElement
        } else if (cls.startsWith(MODIFIER_SIGN)) {
          // Block--Modifier
          Modifier = cls.slice(MODIFIER_SIGN.length)
          cls = $BEM()
        } else if (cls === '$B') {
          cls = Block
        }

        result.push(cls)
      })

      if (states) {
        const stateNameList = Object.keys(states)

        if (stateNameList.length) {
          stateNameList.forEach($walkStates(states))
        }
      }
    } else if (!classString && !states) {
      result.push(Block)
    }

    Modifier = ''
    Element = ''

    return { className: result.join(' ') }
  }
}

export default BEMProvider
