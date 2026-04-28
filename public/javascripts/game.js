let timer;
let partita = {
    punteggio: 0,
    tempo: 0,
    username: null
};
let punteggio = 0;
let listaProdotti;

let img_element1;
let img_element2;
let name_element1;
let name_element2;

document.addEventListener("DOMContentLoaded", async ()=>{
    let secondi = 0;
    timer = setInterval(() => {
        secondi++;
        document.getElementById("timer").innerText = secondi;
    }, 1000);

    let data = await fetch("/game/call");
    listaProdotti = await data.json();
    
    console.log(listaProdotti);
    await setItems();

    img_element1.addEventListener("click", () => {
        lost(secondi);
    });
});
function stopTimer()
{
    clearInterval(timer)
}

function lost(tempo)
{
    stopTimer();
    document.getElementById("main").innerHTML = "";
    partita.punteggio = punteggio;
    partita.tempo = tempo;

    /**
     * PLACEHOLDER
     */
    let p = document.createElement("p");
    p.innerText = "PERSO!!!";
    document.getElementById("main").appendChild(p);
}

function setItems()
{
    img_element1 = document.getElementById("img-element1");
    img_element2 = document.getElementById("img-element2");
    name_element1 = document.getElementById("name-element1");
    name_element2 = document.getElementById("name-element2");

    img_element1.src = listaProdotti[0].image_url;
    img_element2.src = listaProdotti[1].image_url;
    name_element1.innerText = listaProdotti[0].product_name_it != null ? listaProdotti[0].product_name_it : listaProdotti[0].product_name;
    name_element2.innerText = listaProdotti[1].product_name_it != null ? listaProdotti[1].product_name_it : listaProdotti[1].product_name;
}