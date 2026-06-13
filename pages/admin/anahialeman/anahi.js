const API_URL = "https://localhost:7286/api/Teams";

const TOKEN = localStorage.getItem('token');

let teams = [];
let editandoId = null;

window.onload = cargarTeams;

function obtenerCabeceras() {

    const TOKEN = localStorage.getItem('token');
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}` 
    };
}

async function cargarTeams() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: obtenerCabeceras()
        });
        
        if (response.status === 401) {
            document.getElementById("mensaje").innerText = "⚠️ Error 401: No autorizado. Revisa tu Token JWT.";
            return;
        }

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }

        teams = await response.json();
        mostrarTeams(teams);
        document.getElementById("mensaje").innerText = ""; 
    } catch (error) {
        console.error("Error al conectar con la API:", error);
        document.getElementById("mensaje").innerText = "⚠️ Error: El backend está apagado o no se pudo conectar.";
    }
}

function mostrarTeams(lista) {
    let html = "";
    
    if (lista.length === 0) {
        html = `<tr><td colspan="3" style="text-align:center;">No hay equipos en la base de datos.</td></tr>`;
    } else {
        lista.forEach(team => {
            html += `
            <tr>
                <td>${team.id}</td>
                <td>${team.name}</td>
                <td>
                    <button onclick="editarTeam(${team.id}, '${team.name}')">Editar</button>
                    <button onclick="eliminarTeam(${team.id})">Eliminar</button>
                </td>
            </tr>`;
        });
    }
    document.getElementById("teamsBody").innerHTML = html;
}

async function guardarTeam() {
    const nombreInput = document.getElementById("teamName").value.trim();

    if (nombreInput === "") {
        alert("Por favor, ingrese un nombre.");
        return;
    }

    const datosEquipo = { 
        id: 0,
        name: nombreInput,
        description: "sin descripcion",
        memberCount: 0
    };

    try {
        let response;

        if (editandoId === null) {
            response = await fetch(API_URL, {
                method: "POST",
                headers: obtenerCabeceras(),
                body: JSON.stringify(datosEquipo)
            });
        } else {
            response = await fetch(`${API_URL}/${editandoId}`, {
                method: "PUT",
                headers: obtenerCabeceras(),
                body: JSON.stringify(datosEquipo)
            });
        }

        if (response.status === 401) {
            document.getElementById("mensaje").innerText = " Por favor, vuelva a iniciar sesión.";
            alert("No autorizado. Inicie sesión nuevamente.");
            return;
        }

        if (!response.ok) {
            throw new Error("No se pudo guardar el equipo.");
        }
        document.getElementById("teamName").value = "";
        editandoId = null; 
        cargarTeams();

    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        alert("Ocurrió un error al guardar en la base de datos.");
    }
}

function editarTeam(id, nombre) {
    editandoId = id;
    document.getElementById("teamName").value = nombre;
}

async function eliminarTeam(id) {
    if (!confirm("¿Seguro que deseas eliminar este equipo de la base de datos?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: obtenerCabeceras()
        });

        if (!response.ok) throw new Error("No se pudo eliminar el registro.");
        
        cargarTeams();
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar de la base de datos.");
    }
}

function buscarTeam() {
    const texto = document.getElementById("buscar").value.toLowerCase();
    const filtrados = teams.filter(t => t.name.toLowerCase().includes(texto));
    mostrarTeams(filtrados);
}