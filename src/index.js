import "./style.css";
//starting the app

function loadTeams() {
  const request = fetch("teams.json");
  const response = request.then((r) => r.json());
  response.then((result) => {
    console.warn("result", result);
  });
}

loadTeams();
