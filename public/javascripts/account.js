document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll(".btn-delete-key").forEach(button => {
        button.addEventListener("click", async () => {
            const key = button.dataset.key;
            const conferma = confirm(`Vuoi eliminare questa chiave?`);
            if(!conferma) return;
            try
            {
                const response = await fetch(`/account/delete-api-key/${key}`,
                    {
                        method: "DELETE"
                    }
                );
                const result = await response.json();
                if(result.success)
                {
                    // elimina la card dalla pagina
                    button.closest(".api-row").remove();
                } else {
                    alert(result.error);
                }
            } catch(err) {
                console.error(err.message);
                alert("Errore server");
            }
        });
    })

    document.getElementById("btn-elimina").addEventListener("click", async () => {
        const conferma = confirm(`Vuoi veramente eliminare permanentemente questo account?`);
        if(!conferma) return;
        const username = document.getElementById("btn-elimina").dataset.username;
        console.log(username);
        try
        {
            const response = await fetch(`/account/delete/${username}`,
                {
                    method: "DELETE"
                }
            );
            const result = await response.json();
            if(result.success) window.location.href = "/";
        } catch(err) {
            console.error(err.message);
            alert("Errore server");
        }
    });
});