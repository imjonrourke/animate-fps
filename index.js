const valueParser = value => {
  if (typeof parseInt(value) === 'number') {
    return {
      unit: value,
      type: 'px'
    };
  }
  const valueList = value.split('');
  let unit = [];
  let unitType = [];
  for (let i = 0; i < valueList.length; i++) {
    let currentValue = valueList[i];
    if (currentValue !== '.' && typeof parseInt(currentValue) !== 'number') {
      return unitType.push(currentValue);
    }
    return unit.push(currentValue);
  }
  return {
    unit: unit.join(''),
    type: unitType.join('')
  };
};

function animate(dataObject, duration = 250, config) {
  const $el = dataObject.el;
  let width;
  let height;
  let fps = 12;
  const finalDuration = duration / fps;

  if (dataObject && dataObject.width) {
    width = valueParser(dataObject.width);
  }
  if (dataObject && dataObject.height) {
    height = valueParser(dataObject.height);
  }
  if (config && config.fps) {
    fps = config.fps;
  }

  const elementList = [...document.querySelectorAll($el)].map(element => {
    let elWidth = valueParser(element.offsetWidth);
    let elHeight = valueParser(element.offsetHeight);
    element.style.width = `${elWidth.unit}${elWidth.type}`;
    element.style.height = `${elHeight.unit}${elHeight.type}`;
    const returnObject = {
      el: element,
      animationDuration: {},
      animationDimension: {}
    };
    if (dataObject.width) {
      let elWidth = valueParser(element.offsetWidth);
      returnObject.width = elWidth;
      returnObject.animationDuration.width = (elWidth.unit / finalDuration);
      returnObject.animationDimension.width = (width.unit - elWidth.unit) / finalDuration;
    }
    if (dataObject.height) {
      returnObject.height = elHeight;
      returnObject.animationDuration.height = (elHeight.unit / finalDuration);
      returnObject.animationDimension.height = (height.unit - elHeight.unit) / finalDuration;
    }
    return returnObject;
  });

  const animationDimensionCalculation = (elementList, previousElementList) => {
    return elementList.map((element, index) => {
      let newElement = { ...element };
      let newAnimationDimension = {};
      if (newElement.animationDimension.width) {
        newAnimationDimension.width = newElement.animationDimension.width + previousElementList[index].animationDimension.width;
      }
      if (newElement.animationDimension.height) {
        newAnimationDimension.height = newElement.animationDimension.height + previousElementList[index].animationDimension.height;
      }
      newElement.animationDimension = newAnimationDimension;
      return newElement;
    });
  };

  const elementModifier = (element, values) => {
    let width;
    let height;
    if (values.width) {
      width = values.width;
      element.style.width = width;
    }
    if (values.height) {
      height = values.height;
      element.style.height = height;
    }
  };

  const multiAnimationKeys = [elementList];

  const elWidth = valueParser(document.querySelector($el).offsetWidth);
  const newWidth = width.unit - elWidth.unit;
  const animationDimension = newWidth / finalDuration;
  let animationKeys = [elWidth.unit + animationDimension];
  const initializeAnimationFrames = () => {
    for (let i = 1; i < finalDuration; i++) {
      animationKeys.push(animationDimension + animationKeys[i - 1]);
      multiAnimationKeys.push(
        animationDimensionCalculation(elementList, multiAnimationKeys[i - 1])
      )
    }
  }

  initializeAnimationFrames();
  const setElementValues = (values) => {};
  // document.querySelector($el).style.width = `${elWidth.unit}${elWidth.type}`;

  function animationExecution(incrementor = 0) {
    if (incrementor < finalDuration) {
      setTimeout(() => {
        multiAnimationKeys[incrementor].forEach(element => {
          let value = {};
          if (element.width) {
              value.width = `${element.width.unit + element.animationDimension.width}${element.width.type}`;
          }
          if (element.height) {
              value.height = `${element.animationDimension.height}${element.height.type}`;
          }
          elementModifier(element.el, value);
        })
        // document.querySelector($el).style.width = `${animationKeys[incrementor]}${width.type}`;
      }, incrementor === 0 ? fps : fps * incrementor);
      return animationExecution(incrementor + 1);
    }
  }
  animationExecution(0);
}

