//import 'requestApi';
var objects = [];
var people = [];

$.get( "http://ec2-174-129-81-79.compute-1.amazonaws.com/user/find", function(res) {
  console.log( res );
  var i = 0;
  res.forEach(element => {
    objects[i] = element.idWApp;
    var id = element.idWApp;
    var name = element.name;
    people[i] = { id, name};
    console.log
    i++;
    console.log(element.name);
  });
  console.log(objects)
})
  .fail(function(res) {
    console.log( res );
});

const classes = objects;

function getImageUri(imageName) {
  return `./img/${imageName}`
}

function getFaceImageUri(className, idx) {
  return `img/people/${className}/${idx}.png`
}

async function fetchImage(uri) {
  return (await fetch(uri)).blob()
}

async function requestExternalImage(imageUrl) {
  const res = await fetch('fetch_external_image', {
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ imageUrl })
  })
  if (!(res.status < 400)) {
    console.error(res.status + ' : ' + await res.text())
    throw new Error('failed to fetch image from url: ' + imageUrl)
  }

  let blob
  try {
    blob = await res.blob()
    return await faceapi.bufferToImage(blob)
  } catch (e) {
    console.error('received blob:', blob)
    console.error('error:', e)
    throw new Error('failed to load image from url: ' + imageUrl)
  }
}

// fetch first image of each class and compute their descriptors
async function initTrainDescriptorsByClass(net, numImagesForTraining = 1) {
  const maxAvailableImagesPerClass = 20
  numImagesForTraining = Math.min(numImagesForTraining, maxAvailableImagesPerClass)
  return Promise.all(classes.map(
    async className => {
      const descriptors = []
      for (let i = 1; i < (numImagesForTraining + 1); i++) {
        const img = await faceapi.bufferToImage(
          await fetchImage(getFaceImageUri(className, i))
        )
        descriptors.push(await net.computeFaceDescriptor(img))
      }
      return {
        descriptors,
        className
      }
    }
  ))
}

function getBestMatch(descriptorsByClass, queryDescriptor) {
  function computeMeanDistance(descriptorsOfClass) {
    return faceapi.round(
      descriptorsOfClass
        .map(d => faceapi.euclideanDistance(d, queryDescriptor))
        .reduce((d1, d2) => d1 + d2, 0)
          / (descriptorsOfClass.length || 1)
      )
  }
  return descriptorsByClass
    .map(
      ({ descriptors, className }) => ({
        distance: computeMeanDistance(descriptors),
        className
      })
    )
    .reduce((best, curr) => best.distance < curr.distance ? best : curr)
}

function renderNavBar(navbarId, exampleUri) {
  const examples = [
    {
      uri: 'mtcnn_face_recognition_webcam',
      name: 'MTCNN Face Recognition Webcam'
    },
    {
      uri: 'tiny_yolov2_face_recognition',
      name: 'Tiny Yolov2 Face Recognition'
    }
  ]

  const navbar = $(navbarId).get(0)
  const pageContainer = $('.page-container').get(0)

  const header = document.createElement('h3')
  header.innerHTML = examples.find(ex => ex.uri === exampleUri).name
  pageContainer.insertBefore(header, pageContainer.children[0])

  // const menuContent = document.createElement('ul')
  // menuContent.id = 'slide-out'
  // menuContent.classList.add('side-nav', 'fixed')
  // navbar.appendChild(menuContent)

  // examples
  //   .forEach(ex => {
  //     const li = document.createElement('li')
  //     if (ex.uri === exampleUri) {
  //       li.style.background='#b0b0b0'
  //     }
  //     const a = document.createElement('a')
  //     a.classList.add('waves-effect', 'waves-light')
  //     a.href = ex.uri
  //     const span = document.createElement('span')
  //     span.innerHTML = ex.name
  //     span.style.whiteSpace = 'nowrap'
  //     a.appendChild(span)
  //     li.appendChild(a)
  //     menuContent.appendChild(li)
  //   })

  // $('.button-collapse').sideNav({
  //   menuWidth: 280
  // })
}

function renderSelectList(selectListId, onChange, initialValue, renderChildren) {
  const select = document.createElement('select')
  $(selectListId).get(0).appendChild(select)
  renderChildren(select)
  $(select).val(initialValue)
  $(select).on('change', (e) => onChange(e.target.value))
  $(select).material_select()
}

function renderOption(parent, text, value) {
  const option = document.createElement('option')
  option.innerHTML = text
  option.value = value
  parent.appendChild(option)
}



function renderFaceImageSelectList(selectListId, onChange, initialValue) {
  const indices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  function renderChildren(select) {
    classes.forEach(className => {
      const optgroup = document.createElement('optgroup')
      optgroup.label = className
      select.appendChild(optgroup)
      indices.forEach(imageIdx =>
        renderOption(
          optgroup,
          `${className} ${imageIdx}`,
          getFaceImageUri(className, imageIdx)
        )
      )
    })
  }

  renderSelectList(
    selectListId,
    onChange,
    getFaceImageUri(initialValue.className, initialValue.imageIdx),
    renderChildren
  )
}

function renderImageSelectList(selectListId, onChange, initialValue) {
  const images = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(idx => `bbt${idx}.jpg`)
  function renderChildren(select) {
    images.forEach(imageName =>
      renderOption(
        select,
        imageName,
        getImageUri(imageName)
      )
    )
  }

  renderSelectList(
    selectListId,
    onChange,
    getImageUri(initialValue),
    renderChildren
  )
}