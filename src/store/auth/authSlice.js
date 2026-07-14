// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   token: null,
//   tokenExpireAt: null,
//   user: null,
//   companyDetails: null,
//   companyImage: null,
//   version: null,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setCredentials: (state, action) => {
//       const {
//         token,
//         tokenExpireAt,
//         user,
//         companyDetails,
//         companyImage,
//         version,
//       } = action.payload;
//       state.token = token;
//       state.tokenExpireAt = tokenExpireAt;
//       state.user = user;
//       state.companyDetails = companyDetails;
//       state.companyImage = companyImage;
//       state.version = version;
//     },
//     logout: (state) => {
//       return initialState;
//     },
//   },
// });

// export const { setCredentials, logout } = authSlice.actions;
// export default authSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  tokenExpireAt: null,
  user: null,
  userDetails: null,
  userImage: null,
  version: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, tokenExpireAt, user, userDetails, userImage, version } =
        action.payload;

      state.token = token ?? state.token;
      state.tokenExpireAt = tokenExpireAt ?? state.tokenExpireAt;
      state.user = user ?? state.user;
      state.userDetails = userDetails ?? state.userDetails;
      state.userImage = userImage ?? state.userImage;
      state.version = version ?? state.version;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },

    setUserImage: (state, action) => {
      state.userImage = action.payload;
    },
    setVersion: (state, action) => {
      state.version = action.payload;
    },
    logout: () => {
      return initialState;
    },
  },
});

export const {
  setCredentials,
  setToken,
  setUser,
  setUserImage,
  setVersion,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
