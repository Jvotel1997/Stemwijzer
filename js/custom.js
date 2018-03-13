var currentSubjectNr = 0;
var choices = [];

function start() {
	document.getElementById("intro-wrapper").style.display = "none";
	document.getElementById("statements-wrapper").style.display = "initial";
	updateStatement();
};

function goToPreviousStatement() {
	if (currentSubjectNr > 0) {
		currentSubjectNr--;
		updateStatement();
	} else {
		document.getElementById("intro-wrapper").style.display = "initial";
		document.getElementById("statements-wrapper").style.display = "none";
	}
}

function goToNextStatement(choice) {
	if (choices.length > currentSubjectNr) {
		// If we're in here, you went back and we're going to replace the choice
		choices[currentSubjectNr] = choice;
	} else {
		choices.push(choice);
	}

	currentSubjectNr++;
	if (currentSubjectNr < subjects.length) {
		updateStatement();
	} else {
		goToMultiplierSelection();
	}
};

function goToMultiplierSelection() {
	document.getElementById("statements-wrapper").style.display = "none";
	document.getElementById("multiplier-wrapper").style.display = "initial";

	var multiplier = document.getElementById("multiplier-wrapper-subjects");
	for (var i = 0; i < subjects.length; i++) {
		var checkbox = document.createElement('input');
		checkbox.type = "checkbox";
		checkbox.name = "subject";
		checkbox.value = i;
		checkbox.id = "subject" + i;

		var createTextNode = document.createTextNode(subjects[i].title);

		var label = document.createElement('label')
		label.htmlFor = checkbox.id;
		label.appendChild(createTextNode);

		multiplier.appendChild(checkbox);
		multiplier.appendChild(label);
	}
}

function goToSettingSelection() {
	document.getElementById("multiplier-wrapper").style.display = "none";
	document.getElementById("party-settings-wrapper").style.display = "initial";

	var multiplier = document.getElementById("party-settings-subjects");
	for (var i = 0; i < parties.length; i++) {
		var checkbox = document.createElement('input');
		checkbox.type = "checkbox";
		checkbox.checked = true;
		checkbox.name = "party";
		checkbox.value = parties[i].name;
		checkbox.id = "party" + i;

		var createTextNode = document.createTextNode(parties[i].name);

		var label = document.createElement('label')
		label.htmlFor = checkbox.id;
		label.appendChild(createTextNode);

		multiplier.appendChild(checkbox);
		multiplier.appendChild(label);
	}
}

var partySelectionType = {
	DeselectAll: 0,
	SelectAll: 1,
	SelectSeatedOnly: 2,
	SelectSecularOnly: 3
};

function toggleAllParties(selectionType) {
	var partyCheckboxes = document.getElementsByName("party");
	for (var i = 0; i < partyCheckboxes.length; i++) {
		if (selectionType == partySelectionType.DeselectAll) {
			partyCheckboxes[i].checked = false;
		} else if (selectionType == partySelectionType.SelectAll) {
			partyCheckboxes[i].checked = true;
		} else if (selectionType == partySelectionType.SelectSeatedOnly) {
			partyCheckboxes[i].checked = parties[i].size > 0;
		} else if (selectionType == partySelectionType.SelectSecularOnly) {
			partyCheckboxes[i].checked = parties[i].secular;
		}
	}
}

function finish() {
	document.getElementById("party-settings-wrapper").style.display = "none";
	document.getElementById("result-wrapper").style.display = "initial";

	var multiplierSubjects = document.getElementsByName("subject");

	for (var i = 0; i < choices.length; i++) {
		var choice = choices[i];
		var subject = subjects[i];

		for (var y = 0; y < subject.parties.length; y++) {
			var party = subject.parties[y];

			if (party.position == choice) {

				var scoredParty = parties.find(function(element) {
					return element.name == party.name;
				});

				scoredParty.score++;

				//if multiplier checkbox is checked, give extra point to all corresponding parties.
				if (multiplierSubjects[i].checked) {
					scoredParty.score++;
				}
			}
		}
	}


	parties.sort(function(a, b) {
		return b.score - a.score;
	});

	var partyCheckboxes = document.getElementsByName("party");
	for (var i = 0; i < parties.length; i++) {
		var partyCheckbox;
		// For loop om partycheckbox te zoeken obv partij naam
		for (var p = 0; p < partyCheckboxes.length; p++) {
			if (partyCheckboxes[p].value == parties[i].name) {
				partyCheckbox = partyCheckboxes[p];
				break;
			}
		}
		if (!partyCheckbox.checked) {
			continue;
		}

		var resultsList = document.createElement("li");
		var percentage = Math.round(parties[i].score * 100 / subjects.length);
		var resultsListNode = document.createTextNode(parties[i].name + ": " +
			percentage + "%");
		resultsList.appendChild(resultsListNode);

		document.getElementById("result-content").appendChild(resultsList);
	}
};

//Change title, statement and party positions for new subject.
function updateStatement() {
	//background colour for last choice
	document.getElementById("proButton").classList.remove("selected");
	document.getElementById("ambivalentButton").classList.remove("selected");
	document.getElementById("contraButton").classList.remove("selected");

	if (choices.length > currentSubjectNr) {
		// Als we hier zijn zitten we in een vraag die we al eerder hebben beantwoord
		// Toon dus de keuze van die vraag
		var currentChoice = choices[currentSubjectNr];
		if (currentChoice == "pro") {
			document.getElementById("proButton").classList.add("selected");
		}
		if (currentChoice == "ambivalent") {
			document.getElementById("ambivalentButton").classList.add("selected");
		}
		if (currentChoice == "contra") {
			document.getElementById("contraButton").classList.add("selected");
		}
	}

	//party position variables
	var subject = subjects[currentSubjectNr];
	var pro = document.getElementById("opinion-agree-list");
	var ambivalent = document.getElementById("opinion-neither-list");
	var contra = document.getElementById("opinion-disagree-list");

	//Overwrite statements.
	var title = document.getElementById("statement-title");
	title.innerHTML = (currentSubjectNr + 1) + ". " + subject.title;

	var statement = document.getElementById("statement-description");
	statement.innerHTML = subject.statement;

	pro.innerHTML = "";
	ambivalent.innerHTML = "";
	contra.innerHTML = "";

	//Get parties' opinions on current subject and place them in corresponding div.
	for (var i = 0; i < subject.parties.length; i++) {
		var party = subject.parties[i];

		var summary = document.createElement("summary");
		var summaryNode = document.createTextNode(party.name);
		summary.appendChild(summaryNode);

		var explanation = document.createElement("p");
		var explanationNode = document.createTextNode(party.explanation);
		explanation.appendChild(explanationNode);

		var details = document.createElement("details");
		details.appendChild(summary);
		details.appendChild(explanation);

		if (party.position === "pro") {
			pro.appendChild(details);
		} else if (party.position === "ambivalent") {
			ambivalent.appendChild(details);
		} else if (party.position === "contra") {
			contra.appendChild(details);
		}
	}
};
