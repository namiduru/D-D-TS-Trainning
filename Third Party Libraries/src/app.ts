import axios from 'axios';

const form = document.querySelector('form')!;
const adressInput = document.getElementById('adress')! as HTMLInputElement;

type GoogleGeocodingResponse = 
  {results: {geometry: {location: {lat: number, lng: number}}}[],
  status: 'OK' | 'ZERO_RESULTS'
};

// You don't need to type this if you have the below package
// npm install --save @types/googlemaps
declare var google: any;

function searchAddressHandler(event: Event) {
  const GOOGLE_API_KEY = 'GOOGLE_API_KEY';
  event.preventDefault();
  const enteredAdress = adressInput.value;

  // send this to Google's API!
  axios.get<GoogleGeocodingResponse>(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(enteredAdress)}&key=${GOOGLE_API_KEY}`)
  .then(response => {
    if(response.data.status !== 'OK') {
      throw new Error('Could not fetch location!');
    }
    const coordinates = response.data.results[0].geometry.location;

    const map = new google.maps.Map(document.getElementById('map'), {
      center: coordinates,
      zoom: 8
    });

    new google.maps.Marker({positon: coordinates, map: map});
  }).catch((err) => {
    alert(err.message);
    console.log(err);
  });
}

form.addEventListener('submit', searchAddressHandler);
