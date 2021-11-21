// Add options for the dropdown
const shelterDropdown = document.getElementById('shelters');
console.log(shelterDropdown);
fetch('/shelter/shelters')
    .then(response => response.json())
    .then(body => {
      const shelterNames = body.map((shelterObject => shelterObject.name));
      shelterNames.forEach((name) => {
        const shelterNameOption = document.createElement('option');
        shelterNameOption.value = name;
        shelterNameOption.innerText = name;
        shelterDropdown.appendChild(shelterNameOption);
      });
    });


// Add listeners to the buttons
const inviteCodes = new Set(["welcome"]);
const passwords = new Set(["welcome"]);
const newShelter = document.getElementById('newShelter');
const inviteCodeInput = document.getElementById('invite-code');
newShelter.addEventListener('click', () => {
  if (inviteCodes.has(inviteCodeInput.value)){
    // Go to the add shelter page
    window.location.href = "newShelter";
  } else {
    alert('Invite Code Unknown!');
  }
});

const passwordInput = document.getElementById('password');
const toShelterButton = document.getElementById('toShelter');
toShelterButton.addEventListener('click', () => {
  if (passwords.has(passwordInput.value)) {
    document.cookie = `shelterName=${shelterDropdown.value}`;
    window.location.href = "updateShelter";
  } else {
    alert('Incorrect password!');
  }
});


