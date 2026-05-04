let timer;

let partita = {
    punteggio: 0,
    tempo: 0,
    username: null
};
let listaProdotti;

let img_element1;
let img_element2;
let name_element1;
let name_element2;

let secondi = 0;

document.addEventListener("DOMContentLoaded", async ()=>{
    startTimer();

    let data = await fetch("/game/call");
    listaProdotti = await data.json();

    img_element1 = document.getElementById("img-element1");
    img_element2 = document.getElementById("img-element2");
    name_element1 = document.getElementById("name-element1");
    name_element2 = document.getElementById("name-element2");

    await setItems();

    img_element1.addEventListener("click", () => { checkChoice(0); });
    img_element2.addEventListener("click", () => { checkChoice(1); });
});

function startTimer()
{
    timer = setInterval(() => {
        secondi++;
        document.getElementById("timer").innerText = Math.floor(secondi/60) + ":" + (secondi%60<10?0:"") + secondi%60;
    }, 1000);
}

function stopTimer()
{
    clearInterval(timer)
}

async function lost(tempo, data = null)
{
    stopTimer();
    const response = await fetch("/game/lost", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            body: data ? JSON.stringify(data) : null
        });
    const page = await response.text();
    document.getElementById("main").innerHTML = page;
}

async function setItems()
{
    if(listaProdotti.length < 2)
    {
        const data = await fetch("/game/call");
        const nuovaLista = await data.json();
        listaProdotti = listaProdotti.concat(nuovaLista);
    }
    const [p1, p2] = listaProdotti;
    img_element1.src = p1.image_url ? p1.image_url : "/images/not-available.png";
    img_element2.src = p2.image_url ? p2.image_url : "/images/not-available.png";

    name_element1.innerText = (p1.product_name_it ?? p1.product_name) + p1.nutriscore_grade; //nutriscore temporaneo
    name_element2.innerText = (p2.product_name_it ?? p2.product_name) + p2.nutriscore_grade; //nutriscore temporaneo
}

async function checkChoice(index)
{
    if (listaProdotti.length < 2) return;

    const p1 = listaProdotti[0];
    const p2 = listaProdotti[1];

    showNutriScore();

    await delay(1500);

    const response = await fetch("/game/check", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            p1: p1.barcode,
            p2: p2.barcode,
            scelta: index
        })
    });
    const result = await response.json();

    hideNutriScore();

    if(!result.win)
    {
        await fetch("/game/finish", { method: "POST" });
        lost(secondi);
        return;
    }
    listaProdotti.splice(0, 2);
    await setItems();
}

function showNutriScore()
{
    const [p1, p2] = listaProdotti;

    const s1 = document.getElementById("score1");
    const s2 = document.getElementById("score2");

    s1.style.display = "flex";
    s2.style.display = "flex";

    s1.innerText = p1.nutriscore_grade.toUpperCase();
    s2.innerText = p2.nutriscore_grade.toUpperCase();

    s1.className = "nutriscore " + p1.nutriscore_grade;
    s2.className = "nutriscore " + p2.nutriscore_grade;
}
function hideNutriScore()
{
    document.getElementById("score1").style.display = "none";
    document.getElementById("score2").style.display = "none";
}

function delay(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}