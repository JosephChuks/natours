/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import * as auth from './login';
import * as user from './account';
import { showAlert } from './alert';
import { bookTour } from './stripe';

//DOM Elements & Values
const mapBox = document.getElementById('map');

const loginForm = document.querySelector('.form--login');
const logout = document.querySelector('.nav__el--logout');
const userSettings = document.querySelector('.form-user-data');
const userPassword = document.querySelector('.form-user-settings');
const bookButton = document.getElementById('book-tour');

if (bookButton) {
  bookButton.addEventListener('click', (e) => {
    e.preventDefault();
    bookButton.textContent = 'Processing...';

    const { tourId } = bookButton.dataset;
    bookTour(tourId);
  });
}
if (userSettings) {
  userSettings.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value.trim());
    form.append('email', document.getElementById('email').value.trim());

    if (document.getElementById('photo').files[0]) {
      form.append('photo', document.getElementById('photo').files[0]);
    }
    user.profile(form);
  });
}

if (userPassword) {
  userPassword.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.save--password').innerHTML = 'Updating...';
    const currentPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    if (currentPassword === '' || newPassword === '') {
      return showAlert('error', 'Please fill out required fields');
    }

    await user.password(currentPassword, newPassword, confirmPassword);

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.querySelector('.save--password').innerHTML = 'Save Password';
  });
}

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.login(email, password);
  });
}

if (logout) {
  logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.logout();
  });
}
