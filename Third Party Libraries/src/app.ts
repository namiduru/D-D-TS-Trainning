const form = document.querySelector('form')!;
const adressInput = document.getElementById('adress')! as HTMLInputElement;

function searchAddressHandler(event: Event) {
  event.preventDefault();
  const enteredAdress = adressInput.value;

  // send this to Google's API!
}

form.addEventListener('submit', searchAddressHandler);
