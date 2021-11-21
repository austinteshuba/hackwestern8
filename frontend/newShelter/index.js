
const newShelter = document.getElementById('newShelter');
newShelter.addEventListener('click', () => {
        const name = document.getElementById('name');
        const postalcode = document.getElementById('postalcode');
        const address = document.getElementById('address');
        const city = document.getElementById('city');
        const totalBeds = document.getElementById('totalbeds');
        const openbeds = document.getElementById('openbeds');
        const wake = document.getElementById('wake');
        const sleep = document.getElementById('sleep');
        const family = document.getElementById('family');
        const indigenous = document.getElementById('indigenous');
        const lgbtq = document.getElementById('lgbtq');
        const female = document.getElementById('female');
        const youth = document.getElementById('youth');
        const meal = document.getElementById('meal');
        const phone = document.getElementById('phone');
        const quiet = document.getElementById('quiet');
        var prereqs = [];
        if (family.checked) prereqs.push("family_friendly");
        if(lgbtq.checked) prereqs.push("lgbtq");
        if(female.checked) prereqs.push('female');
        if (indigenous.checked) prereqs.push('indigenous');
        if (youth.checked) prereqs.push("youth")
        fetch('/shelter/newShelter', {
            method: 'POST',
            headers:{
              'Content-Type':'application/json'
            } ,
            body: JSON.stringify({
                name: name.value,
                postalCode: postalcode.value,
                address: address.value,
                phone: phone.value,
                city: city.value,
                totalBeds: totalBeds.value,
                openBeds: openbeds.value,
                mealProvided: meal.checked,
                quietShelter: quiet.checked,
                wakeUpTime: wake.value? parseFloat(wake.value): null,
                sleepTime: sleep.value? parseFloat(sleep.value) : null,
                prerequisites: prereqs
            }),
          });   
        document.getElementById('confirmation-text').classList.remove('hide');
        document.getElementById('confirmation-section').classList.remove('hide');
        document.getElementById('main-section').classList.add('hide');
  });

