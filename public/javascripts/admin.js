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
    document.querySelectorAll(".delete").forEach(button => {
        button.addEventListener("click", async () => {
            const username = button.dataset.username;
            const conferma = confirm(
                `Vuoi eliminare ${username}?`
            );
            if(!conferma) return;
            try
            {
                const response = await fetch(`/admin/delete/${username}`,
                    {
                        method: "DELETE"
                    }
                );
                const result = await response.json();
                if(result.success)
                {
                    // elimina la card dalla pagina
                    button.closest(".user-box").remove();
                } else {
                    alert(result.error);
                }
            } catch(err) {
                console.error(err);
                alert("Errore server");
            }
        });
    });
});