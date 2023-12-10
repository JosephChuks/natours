/* eslint-disable no-undef */
import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51OKeCHHzmpmNHc0vbKsnNqd3csDTNpWXFa11q2dlfHNoYEBzapKpB0YJVOWOSLKoIo18944jpqVbJ6c1D8GUnFlL00t6elzvlZ',
);

export const bookTour = async (tourId) => {
  try {
    // Get session from server
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );

    // Create check out form + process payment
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
