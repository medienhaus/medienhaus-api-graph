let config 
const apiUrl = "https://api.rundgang.udk-berlin.de/api/v2/"
const iniId = '!suNRlIyeorKnuZHfld:content.udk-berlin.de'


async function ini() {
  config = await fetch('./config.json').then( (response) => response.json())
}

const container = {
  width: document.querySelector('main').offsetWidth,
  height: document.querySelector('main').offsetHeigt
}

const initData = {
nodes: [ {id: iniId, no:1, type:'context' } ],
links: []
};




const view = {
  'focusedNode': initData.nodes[0],
  'showItemOverlay' : false
}


const vis = {
"colors": {
  "fg": '#000000',
  "bg": '#FFFFFF'
},
"server" : [],
"types":[
  {
    "id":"context"
  },
  {
    "id":"item"
  }
]
}

const elem = document.getElementById("graph");


const Graph = ForceGraph()(elem)

.graphData(initData)
//   .linkColor(() => '#000000')
.height(container.height)
.width(container.width)
.enableNodeDrag(false)
.nodeLabel('name')
.onNodeClick(getContextFromApi)
.nodeCanvasObject((node, ctx) => nodePaint(node, getColor(node.no), ctx))


async function getContextFromApi(node) {
let { nodes, links } = Graph.graphData();

const id = node.id
const call = await fetch(apiUrl+""+id)
const data = await call.json()


nodes = addToGraph(nodes,links, id,{clicked:true,...data})

vis.showItemOverlay = data.type === 'item'


view.focusedNode = nodes.find(n => node.id === n.id)

await updateHeader()

Graph.centerAt(node.x, node.y, 1000);
Graph.zoom(3, 2000);


}

function addToGraph(nodes,links, parentId,data) {

const newLinks = []
let newNodes = nodes

const existingNodeIndex = newNodes.findIndex(n => n.id === data.id)
if(existingNodeIndex) Object.assign(newNodes[existingNodeIndex], data)

data.context.forEach(ele => {
    newLinks.push({"source": ele.id,"target": parentId})
    const server = ele.id.split(':')[1]
    let serverVis = vis.server.find( s => s.url === server)
    if(!serverVis){
      serverVis = {url:server, hex: getColor(nodes.length+newNodes.length)}
      vis.server.push(serverVis)
    }
    const context = {id:ele.id,name: ele.name, no:nodes.length+newNodes.length,type:ele.type,template:ele.template,server:ele.id.split(':')[1], vis: serverVis}
    addNodeToArray(newNodes,context)
})
data.item.forEach(ele => {
  const server = ele.id.split(':')[1]
    let serverVis = vis.server.find( s => s.url === server)
    if(!serverVis){
      serverVis = {url:server, hex: getColor(nodes.length+newNodes.length)}
      vis.server.push(serverVis)
    }

    newLinks.push({"source": ele.id,"target": parentId})
    const item = {id:ele.id,name: ele.name,no:nodes.length+newNodes.length,type:ele.type,template:ele.template,server:ele.id.split(':')[1], vis: serverVis}
    addNodeToArray(newNodes,item)
})
Graph.graphData({
  nodes: newNodes,
  links: [...links, ...newLinks]
});

return newNodes

}

function addNodeToArray(data,node) {
if(!data.find(d => d.id === node.id)) data.push(node)
return data;
}

const getColor = n => '#' + ((n * 1234567) % Math.pow(2, 24)).toString(16).padStart(6, '0');

function nodePaint(node, color, ctx) {

ctx.lineWidth = node.clicked ? 2 : 1

switch (node.type) {
  case('item'):
  ctx.fillStyle = vis.colors.fg;
  ctx.beginPath(); 
  ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false); 
  ctx.fill(); 
  break;
  case('context'):
  ctx.fillStyle = vis.colors.bg;
  ctx.strokeStyle = vis.colors.fg;
  ctx.beginPath(); 
  ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false); 
  ctx.stroke(); 
  ctx.fill(); 
  break;
}
}

async function updateHeader() {
const headline = document.querySelector('header h1')
const headlineContent = view?.focusedNode?.name
const headlineLimit = 50
headline.innerHTML = view?.focusedNode?.name.substring(0,headlineLimit) 
if(view?.focusedNode?.name.length > headlineLimit) headline.innerHTML = headline.innerHTML + "…"

// const topic = document.querySelector('header h3')
// topic.innerHTML = view.focusedNode?.description?.default


// const itemOverlay = document.getElementById('itemOverlay')
// vis.showItemOverlay ? itemOverlay.style.display = "block" : itemOverlay.style.display = "none"

// const closeButton = document.createElement('button')
// closeButton.innerHTML = 'X'
// closeButton.addEventListener("click", (e) =>{
//   e.preventDefault()
//   document.querySelector('side').style.display = "none"
//   vis.showItemOverlay  = false
// });

// const contentWrapper = document.createElement('div')



if(view.focusedNode.type === 'item') {

  const closeButton = document.createElement('button')
  closeButton.innerHTML = 'X'
  closeButton.id = 'closeButton'
  closeButton.addEventListener("click", (e) =>{
    e.preventDefault()
    document.querySelector('main > side').style.display = "none"
    vis.showItemOverlay  = false
    document.querySelector('main > side').innerHTML = ''

    nav.querySelector('div').style.display = "initial"
    document.getElementById('closeButton').remove()
  });


  const nav = document.querySelector('header > section')
  nav.appendChild(closeButton)
  nav.querySelector('div').style.display = "none"
  



  createItemOverlay(view.focusedNode)
}

// const request =  await fetch(apiUrl+ view.focusedNode.id+"/render/json")
// const content = await request.json() 
// contentWrapper.innerHTML += content?.languages?.EN?.formattedContent
// itemOverlay.innerHTML = ""
// itemOverlay.appendChild(closeButton)
// itemOverlay.appendChild(contentWrapper)

}



//// genral


async function createItemOverlay(data) {
  console.log(config)

  const burger = document.querySelector('.hamburger');
  const menu = document.querySelector('.menu');
  const overlay = document.querySelector('.overlay');

  burger.classList.remove("is-active");
	menu.classList.remove("slidein");
	if(overlay) overlay.classList.remove("menuopen");


  const itemWrapper = document.querySelector('main > side')
  itemWrapper.style.display = "block"; 

  const header = document.createElement('header')

  const name = document.createElement('h3')
  const author = document.createElement('p')
  const server = document.createElement('p')
  const allocationPhysical = document.createElement('p')
  const allocationTemporal = document.createElement('p')


  const authorList = data?.origin?.authors.map(member => member?.name).join(',')
  author.innerHTML = "by: "+ authorList


  name.innerHTML = data?.name
  server.innerHTML = "origin: " + data?.origin?.server?.join(',')

  // const coords =  data?.allocation?.physical[0]
  //allocationPhysical.innerHTML = "located: " + coords?.lat + ", " + coords?.lng
  allocationPhysical.innerHTML = 'coords?.lat' + ", " + 'coords?.lng'


  //allocationTemporal.innerHTML = "temporal: " + temporal?.date
  allocationTemporal.innerHTML =  'temporal'


  header.appendChild(name)
  header.appendChild(allocationPhysical)
  header.appendChild(allocationTemporal)


  const content = document.createElement('article')

  const abstract = document.createElement('div')
  const description = document.createElement('p')
  description.innerHTML = data?.description?.default
  const img = document.createElement('img')
  img.src = data?.thumbnail_full_size
  abstract.appendChild(img)
  abstract.appendChild(description)

  const full = document.createElement('div')
  const fetchedContent = await fetch(config?.api?.url+config?.api?.version+data?.id+"/render/json" )
  const fetchedContentJson = await fetchedContent?.json()
  full.innerHTML = fetchedContentJson?.languages?.EN?.formattedContent

  content.appendChild(abstract)
  content.appendChild(full)


  const footer = document.createElement('footer')

  footer.appendChild(author)
  footer.appendChild(server)

  itemWrapper.appendChild(header)
  itemWrapper.appendChild(content)
  itemWrapper.appendChild(footer)



}




/** BURGER MENU **/
const burger = document.querySelector('.hamburger');
const menu = document.querySelector('.menu');
const overlay = document.querySelector('.overlay');

burger.addEventListener('click', event => {
	burger.classList.toggle("is-active");
	menu.classList.toggle("slidein");
	overlay.classList.toggle("menuopen");
});


