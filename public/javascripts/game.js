let timer;

let partita = {
    punteggio: 0,
    tempo: 0
};
let listaProdotti;

let img_element1;
let img_element2;
let name_element1;
let name_element2;

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
        partita.tempo++;
        document.getElementById("timer").innerText = Math.floor(partita.tempo/60) + ":" + (partita.tempo%60<10?0:"") + partita.tempo%60;
    }, 1000);
}

function stopTimer()
{
    clearInterval(timer)
}

async function lost(data)
{
    const response = await fetch("/game/lost", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
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

    if(!result.win)
    {
        await fetch("/game/finish", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                punteggio: partita.punteggio,
                tempo: partita.tempo
            })
        });
        stopTimer();
        showNutriScore();
        await delay(1500);
        hideNutriScore();
        lost(partita);
        return;
    }
    else
    {
        showNutriScore();
        await delay(1500);
        hideNutriScore();

        partita.punteggio++;
        listaProdotti.splice(0, 2);
        document.getElementById("punteggio").innerText = partita.punteggio;
        await setItems();
    }
}

function showNutriScore()
{
    const [p1, p2] = listaProdotti;

    const s1 = document.getElementById("score1");
    const s2 = document.getElementById("score2");

    s1.classList.remove("hidden");
    s2.classList.remove("hidden");

    s1.innerText = p1.nutriscore_grade.toUpperCase();
    s2.innerText = p2.nutriscore_grade.toUpperCase();

    s1.className = "nutriscore " + p1.nutriscore_grade;
    s2.className = "nutriscore " + p2.nutriscore_grade;
}
function hideNutriScore()
{
    document.getElementById("score1").classList.add("hidden");
    document.getElementById("score2").classList.add("hidden");
}

function delay(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}