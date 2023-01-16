let config 
async function ini() {
   
    const configReq = await fetch('./config.json')
    config = await configReq.json()

    let mode = localStorage.getItem('graph_mode');
    if(!mode) { //falling back to default
        localStorage.setItem('graph_mode', '2d');
        mode = '2d'
    }



    config.session = {mode:mode}

    const id = getParameter('id') //check if custom id is defined
    //if(id) config?.api?.rootId = id



    generateMenu()
    addDependenciesToSession(mode)
}


function generateMenu() {
    const nav = document.querySelector('.menu > nav')
    
    let modeList = document.createElement("select")
    modeList.id = 'modeSelect'
    modeList.addEventListener('change', modeSelect)

    let item = document.createElement("option")
      item.innerHTML = "2d"
      item.value = "2d"
      modeList.appendChild(item)

    item = document.createElement("option")
      item.innerHTML = "3d"
      item.value = "3d"

      modeList.appendChild(item)

    modeList.value = config.session.mode


    nav.appendChild(modeList)

}

function modeSelect(e) {
   // const mode = document.getElementById('modeSelect').
    const mode = e.target.value
    config.session.mode = mode
    localStorage.setItem('graph_mode', mode);
    location.reload();



}

function addDependenciesToSession(mode) {
    const scriptWrapper = document.getElementById('renderIncludes')
    scriptWrapper.innerHTML = ''
    
    let mainScript = document.createElement('script')
    mainScript.setAttribute("async",false);
    let forceGraph = document.createElement('script')
    forceGraph.setAttribute("async",false);
    switch(mode){
        case '2d':
            forceGraph.setAttribute("src", "./assets/js/force-graph.js");
            scriptWrapper.appendChild(forceGraph);

            forceGraph.addEventListener("load", () => {
                mainScript.setAttribute("src", "./assets/js/main2d.js");
                scriptWrapper.appendChild(mainScript);
            });

            break;
        case '3d':
            forceGraph.setAttribute("src", "./assets/js/3d-force-graph.js");
            scriptWrapper.appendChild(forceGraph);

            forceGraph.addEventListener("load", () => {
                const treeJs = document.createElement('script')
                treeJs.setAttribute("src", "./assets/js/three.js");
                treeJs.setAttribute("async",false);
                scriptWrapper.appendChild(treeJs);

                treeJs.addEventListener("load", () => {
                    mainScript.setAttribute("src", "./assets/js/main3d.js");
                    scriptWrapper.appendChild(mainScript);        
                })
            });
            break;
    }



}



function getParameter  (key) {
    const address = window.location.search
    const parameterList = new URLSearchParams(address)
    return parameterList.get(key)
}


 