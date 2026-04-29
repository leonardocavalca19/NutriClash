let timer;
let partita = {
    punteggio: 0,
    tempo: 0,
    username: null
};
let punteggio = 0;
let listaProdotti;
let prodotto1;
let prodotto2;

let img_element1;
let img_element2;
let name_element1;
let name_element2;

let secondi = 0;
document.addEventListener("DOMContentLoaded", async ()=>{
    timer = setInterval(() => {
        secondi++;
        document.getElementById("timer").innerText = secondi;
    }, 1000);

    let data = await fetch("/game/call");
    listaProdotti = await data.json();
    prodotto1 = listaProdotti[0];
    prodotto2 = listaProdotti[1];

    img_element1 = document.getElementById("img-element1");
    img_element2 = document.getElementById("img-element2");
    name_element1 = document.getElementById("name-element1");
    name_element2 = document.getElementById("name-element2");
    await setItems();

    img_element1.addEventListener("click", () => {
        checkChoice(0);
    });
    img_element2.addEventListener("click", () => {
        checkChoice(1);
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

    img_element1.src = listaProdotti[0].image_url;
    img_element2.src = listaProdotti[1].image_url;
    name_element1.innerText = (listaProdotti[0].product_name_it != null ? listaProdotti[0].product_name_it : listaProdotti[0].product_name) + listaProdotti[0].nutriscore_grade;
    name_element2.innerText = (listaProdotti[1].product_name_it != null ? listaProdotti[1].product_name_it : listaProdotti[1].product_name) + listaProdotti[1].nutriscore_grade;
}

function checkChoice(index)
{
    let indiceToCheck = index == 0 ? 1 : 0;
    if(listaProdotti[index].nutriscore_grade>listaProdotti[indiceToCheck].nutriscore_grade) //valore nutriscore: e=0,d=1,c=2,b=3,a=4
    {
        lost(secondi);
        /**
         * TODO salvare il punteggio nel DB se si è collegati ad un account
         * controllare routes game.js
         */
    }
    else
    {
        punteggio++;
        document.getElementById("punteggio").innerText = punteggio;
        listaProdotti.splice(0,2);
        setItems();
    }
}