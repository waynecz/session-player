interface States {
  [stateName: string]: boolean;
}

const getBEMProvider = function(blockname: string): Function {
  const block = blockname;

  return function(element: string | States, states?: States) {
    let resultClassName: string = '';

    if (typeof element === 'object') {
      resultClassName = block;
      Object.keys(element).forEach(name => {
        if (element[name]) {
          resultClassName += ` is-${name}`;
        }
      });
    } else if (typeof element === 'string') {
      resultClassName = `${block}_${element}`;

      if (states) {
        const stateNameList = Object.keys(states);
        if (stateNameList.length) {
          stateNameList.forEach(name => {
            if (states[name]) {
              resultClassName += ` is-${name}`;
            }
          });
        }
      }
    } else {
      resultClassName = block;
    }

    return { className: resultClassName };
  };
};

export default getBEMProvider;
