import axios from 'axios';
import { showAlert } from './alert';

export const profile = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/update-profile',
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Profile Updated Succesfully');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const password = async (currentPassword, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/update-password',
      data: {
        currentPassword,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Password Updated Succesfully');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
