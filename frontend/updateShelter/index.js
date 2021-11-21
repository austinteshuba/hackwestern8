// source: https://www.w3schools.com/js/js_cookies.asp
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function shelterNameToId(shelterName) {
  return shelterName.replaceAll(' ', "_");
}

let totalBeds = 0;
function getOpenBeds(shelterName) {
  return fetch('/shelter/shelterDetails?name=' + shelterNameToId(shelterName))
      .then((response) => response.json())
      .then((shelterDetails) => {
        totalBeds = shelterDetails.totalBeds;
        return shelterDetails.openBeds;
      });
}

function updateBedCount(shelterName, openBedCount) {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: shelterNameToId(shelterName),
      openBeds: openBedCount
    })
  };

  if (openBedCount >= 0) {
    fetch('/shelter/bedsUpdate', options)
        .then(response => response.json());
  }
}

const shelterName = getCookie("shelterName");
if (shelterName == null) {
  window.location.href = '/';
}

// get the accurate count for the site
const bedCount = document.getElementById('bed-count');
getOpenBeds(shelterName).then((count) => {
  bedCount.innerText = count;
  const bedForm = document.getElementById('bedForm');
  bedForm.removeAttribute('hidden');
});

// counting buttons must work
const incrementButton = document.getElementById('increment');
const decrementButton = document.getElementById('decrement');

incrementButton.addEventListener('click', () => {
  let newCount = parseInt(bedCount.innerText) + 1;
  updateBedCount(shelterName, newCount);
  bedCount.innerText = newCount.toString();
});

decrementButton.addEventListener('click', () => {
  let newCount = parseInt(bedCount.innerText) - 1;
  if (newCount >= 0) {
    updateBedCount(shelterName, newCount);
    bedCount.innerText = newCount.toString();
  }
});

// three buttons at the bottom
const declareFullButton = document.getElementById('full');
const declareEmptyButton = document.getElementById('reset');
const refreshButton = document.getElementById('refresh');

declareFullButton.addEventListener('click', () => {
  updateBedCount(shelterName, 0);
  bedCount.innerText = '0';
});

declareEmptyButton.addEventListener('click', () => {
  updateBedCount(shelterName, totalBeds);
  bedCount.innerText = `${totalBeds}`;
});

refreshButton.addEventListener('click', () => {
  getOpenBeds(shelterName).then((count) => {
    bedCount.innerText = count;
    const bedForm = document.getElementById('bedForm');
    bedForm.removeAttribute('hidden');
  });
});

// add homepage redirect to logo
const homepageLogo = document.getElementById('homepage-link');
homepageLogo.addEventListener('click', () => {
  window.location.href = '/';
});

