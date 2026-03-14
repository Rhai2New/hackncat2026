alert("script loaded");

var form = document.getElementById("ideaForm");

form.addEventListener("submit", function(e) {
    e.preventDefault();
    alert("submit clicked");

    var title = document.getElementById("title").value;
    var problem = document.getElementById("problem").value;
    var solution = document.getElementById("solution").value;
    var audience = document.getElementById("audience").value;

    if (title === "" || problem === "" || solution === "" || audience === "") {
        alert("Please fill in all fields before submitting.");
        return;
    }

    var ideaData = {
        title: title,
        problem: problem,
        solution: solution,
        audience: audience
    };

    alert("sending request");

    fetch("/refine-idea", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(ideaData)
    })
    .then(response => {
        alert("got response");
        return response.json();
    })
    .then(data => {
        alert("parsed response");

        var box = document.getElementById("pitchSummaryBox");
        var text = document.getElementById("pitchSummaryText");

        box.style.display = "block";
        text.textContent = data.pitchSummary || data.error || "No summary returned.";
    })
    .catch(error => {
        alert("fetch failed");

        var box = document.getElementById("pitchSummaryBox");
        var text = document.getElementById("pitchSummaryText");

        box.style.display = "block";
        text.textContent = "Request failed.";

        console.error(error);
    });
});