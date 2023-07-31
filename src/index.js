import { loadTeamsRequest, createTeamRequest, deleteTeamRequest, updateTeamRequest } from "./middleware";
import "./style.css";
import { $, $$, debounce, filterElements, mask, unmask } from "./utilities";
//starting the app

// import { debounce } from "lodash"; // bad, don't import all functions
// import debounce from "lodash/debounce"; //better

let editId;
let allTeams = [];
const form = "#teamsForm";

function getTeamAsHTML({ id, promotion, members, name, url }) {
  const displayUrl = url.startsWith("https://github.com/") ? url.substring(19) : url;
  return `<tr>
    <td style="text-align: center"><input type="checkbox" name="selected" value="${id}"></td>
    <td>${promotion}</td>
    <td>${members}</td>
    <td>${name}</td>
    <td><a href="${url}" target="_blank">${displayUrl}</a></td>
    <td>
      <a data-id="${id}" class="remove-btn">✂</a>
      <a data-id="${id}" class="edit-btn">&#9998;</a>
    </td>
  </tr>`;
}

let previewDisplayTeams = [];
function displayTeams(teams) {
  if (teams === previewDisplayTeams) {
    console.warn("same teams already displayed");
    return;
  }

  if (teams.length === previewDisplayTeams.length) {
    if (teams.every((team, i) => team === previewDisplayTeams[i])) {
      console.warn("same content");
      return;
    }
  }

  previewDisplayTeams = teams;
  console.warn("displayTeams", teams);
  const teamsHTML = teams.map(getTeamAsHTML);
  $("#teamsTable tbody").innerHTML = teamsHTML.join("");
}

/**
 *
 * @returns {Promise<Team[]>}
 */
function loadTeams() {
  return loadTeamsRequest().then(teams => {
    allTeams = teams;
    displayTeams(teams);
    return teams;
  });
}

function startEdit(id) {
  editId = id;
  const team = allTeams.find(team => team.id == id);
  setTeamValues(team);
}

function setTeamValues({ promotion, members, name, url }) {
  $("#promotion").value = promotion;
  $("#members").value = members;
  $("input[name=name]").value = name;
  $("input[name=url]").value = url;
}

function getTeamValues() {
  const promotion = $("#promotion").value;
  const members = $("#members").value;
  const name = $("input[name=name]").value;
  const url = $("input[name=url]").value;
  return {
    promotion,
    members,
    name: name,
    url: url
  };
}

async function onSubmit(e) {
  e.preventDefault();

  const team = getTeamValues();

  mask(form);
  let status;

  if (editId) {
    team.id = editId;
    status = await updateTeamRequest(team);

    if (status.success) {
      allTeams = allTeams.map(t => {
        if (t.id === editId) {
          console.warn("team", team);
          // return team;
          // return { ...team };
          return {
            ...t,
            ...team
          };
        }
        return t;
      });
    }
  } else {
    status = await createTeamRequest(team);
    if (status.success) {
      //console.info("saved", team);
      team.id = status.id;
      allTeams = [...allTeams, team];
    }
  }

  if (status.success) {
    displayTeams(allTeams);
    $("#teamsForm").reset();
    unmask(form);
  }
}

async function removeSelected() {
  mask("#main");
  const selected = document.querySelectorAll("input[name=selected]:checked");
  selected.forEach(input => {
    deleteTeamRequest(input.value);
  });
  await loadTeams();
  unmask("#main");
}

function initEvents() {
  $("#removeSelected").addEventListener("click", debounce(removeSelected, 200));

  $("#searchTeams").addEventListener(
    "input",
    debounce(function (e) {
      console.info("search: ", this, e.target.value);
      const teams = filterElements(allTeams, e.target.value);
      displayTeams(teams);
    }, 400)
  );

  $("#selectAll").addEventListener("input", e => {
    console.warn("e", e);
    $$("input[name=selected]").forEach(element => {
      element.checked = e.target.checked;
    });
  });

  $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id;

      mask(form);
      deleteTeamRequest(id, async ({ success }) => {
        if (success) {
          await loadTeams();
          unmask(form);
        }
      });
    } else if (e.target.matches("a.edit-btn")) {
      const id = e.target.dataset.id;
      startEdit(id);
    }
  });

  $("#teamsForm").addEventListener("submit", onSubmit);
  $("#teamsForm").addEventListener("reset", () => {
    displayTeams(allTeams);
    editId = undefined;
  });
}

initEvents();

(async () => {
  mask(form);
  const teams = await loadTeams();
  unmask(form);
})();
