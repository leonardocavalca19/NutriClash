document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll(".ruolo-select").forEach(select => {
        select.addEventListener("change", async() => {
            const username = select.dataset.username;
            const ruolo = select.value;
            try
            {
                const response = await fetch("/admin/cambia-ruolo", {
                    method:"POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, ruolo })
                });
                const data = await response.json();
                if(!data.success)
                {
                    alert(data.error || "Errore")
                }
            }
            catch(err)
            {
                console.error(err);
                alert("Errore server");
            }
        });
    });
});